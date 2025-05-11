// API service for CreditSea
import { useAuth } from "@clerk/nextjs";
import { withErrorHandling, handleApiResponse } from './api-error';

// Types
export interface DashboardStats {
  stats: {
    activeUsers: number;
    borrowerCount: number;
    cashDisbursed: number;
    cashReceived: number;
    repaidLoans: number;
    savingsAccount: number;
    otherAccounts: number;
  };
  loanStats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  recentLoans: LoanApplication[];
  kpis?: {
    averageLoanAmount: number;
    approvalRate: number;
    collectionRate: number;
  };
}

export interface LoanApplication {
  id: string;
  userId: string;
  fullName: string;
  loanAmount: number;
  purpose: string;
  duration: number;
  status: string;
  appliedAt: string;
}

export interface LoanDetails extends LoanApplication {
  employmentStatus: string | null;
  employmentAddress: string | null;
  updatedAt: string;
}

// Helper to get the API base URL
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

// Helper to create auth headers with token
export async function getAuthHeaders(getToken: () => Promise<string | null>): Promise<HeadersInit> {
  const token = await getToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * API service class for CreditSea frontend
 */
export class ApiService {
  private baseUrl: string;
  private getToken: () => Promise<string | null>;

  constructor(getToken: () => Promise<string | null>) {
    this.baseUrl = getApiBaseUrl();
    this.getToken = getToken;
  }
  // Dashboard data
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const headers = await getAuthHeaders(this.getToken);
      const response = await fetch(`${this.baseUrl}/api/admin/dashboard-stats`, { 
        headers,
        // Add cache control to ensure fresh data
        cache: 'no-store',
        // Set a reasonable timeout
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
      });
      
      return handleApiResponse<DashboardStats>(response, 'Failed to fetch dashboard data');
    } catch (error) {
      // Handle timeout and network errors specifically
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Dashboard data fetch timed out. Please try again.');
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      console.error('Error fetching dashboard data:', error);
      throw error; // Re-throw to be handled by withErrorHandling
    }
  }
  // Loan listing
  async getLoans(page = 1, limit = 10, filters?: Record<string, any>): Promise<{ loans: LoanApplication[], total: number }> {
    try {
      const headers = await getAuthHeaders(this.getToken);
      
      // Build query string from filters
      const queryParams = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(`${this.baseUrl}/api/admin/loans?${queryParams}`, { 
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(8000) // 8 seconds timeout
      });
      
      return handleApiResponse(response, 'Failed to fetch loans');
    } catch (error) {
      // Handle specific error types with user-friendly messages
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timed out while fetching loans. Please try again.');
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      console.error('Error fetching loans:', error);
      throw error;
    }
  }
  // Loan details
  async getLoanDetails(id: string): Promise<LoanDetails> {
    try {
      const headers = await getAuthHeaders(this.getToken);
      const response = await fetch(`${this.baseUrl}/api/admin/loans/${id}`, { 
        headers,
        // Add cache control to ensure we get fresh data
        cache: 'no-store'
      });
      
      return handleApiResponse<LoanDetails>(response, `Failed to fetch loan details for ID: ${id}`);
    } catch (error) {
      console.error(`Error fetching loan details for ID: ${id}`, error);
      throw error; // Re-throw to be handled by withErrorHandling
    }
  }
  // Update loan status
  async updateLoanStatus(id: string, status: string): Promise<LoanDetails> {
    try {
      const headers = await getAuthHeaders(this.getToken);
      const response = await fetch(`${this.baseUrl}/api/admin/loans/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
        signal: AbortSignal.timeout(5000) // 5 seconds timeout should be enough for a simple update
      });
      
      // Provide a more specific error message based on the status being set
      const statusAction = status === 'approved' ? 'approve' : 
                          status === 'rejected' ? 'reject' : 
                          status === 'verified' ? 'verify' : 'update';
      
      return handleApiResponse<LoanDetails>(
        response, 
        `Failed to ${statusAction} loan. Please try again.`
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Status update timed out. The operation might have completed, please check before trying again.');
      }
      
      console.error(`Error updating loan status to ${status} for ID: ${id}`, error);
      throw error;
    }
  }
  // User loans (for customer portal)
  async getUserLoans(): Promise<LoanApplication[]> {
    try {
      const headers = await getAuthHeaders(this.getToken);
      const response = await fetch(`${this.baseUrl}/api/loans`, { 
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(8000) // 8 seconds timeout
      });
      
      return handleApiResponse<LoanApplication[]>(response, 'Failed to fetch your loans');
    } catch (error) {
      // Handle offline mode gracefully
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error when fetching user loans:', error);
        throw new Error('You appear to be offline. Please check your internet connection and try again.');
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timed out while loading your loans. Please try again.');
      }
      
      console.error('Error fetching user loans:', error);
      throw error;
    }
  }

  // Apply for a loan
  async applyForLoan(loanData: Omit<LoanApplication, 'id' | 'userId' | 'appliedAt' | 'status'>): Promise<LoanApplication> {
    const headers = await getAuthHeaders(this.getToken);
    const response = await fetch(`${this.baseUrl}/api/loans/apply`, {
      method: 'POST',
      headers,
      body: JSON.stringify(loanData),
    });
    return handleApiResponse<LoanApplication>(response, 'Failed to submit loan application');
  }
}

/**
 * Hook to use the API service with authentication
 */
export function useApiService() {
  const { getToken } = useAuth();
  return new ApiService(getToken);
}
