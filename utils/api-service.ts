// API service for CreditSea
import { useAuth } from "@clerk/nextjs";
import apiCache, { ApiCache } from "./api-cache";
import { handleApiResponse } from "./api-error";
import { logError, logWarning } from "./error-logger";

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
	return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}

// Helper to create auth headers with token
export async function getAuthHeaders(
	getToken: () => Promise<string | null>
): Promise<HeadersInit> {
	const token = await getToken();
	return {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
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
	} // Track the last dashboard stats request time to prevent frequent refetching
	private lastDashboardFetch: number = 0;
	private dashboardMinInterval: number = 2000; // 2 seconds minimum between fetches

	// Dashboard data
	async getDashboardStats(): Promise<DashboardStats> {
		try {
			// Check if we've fetched recently to avoid unnecessary calls
			const now = Date.now();
			if (now - this.lastDashboardFetch < this.dashboardMinInterval) {
				// Use cache from ApiCache if available
				const cacheKey = ApiCache.generateCacheKey(
					`${this.baseUrl}/api/admin/dashboard-stats`
				);
				const cachedData = apiCache.get<DashboardStats>(cacheKey);
				if (cachedData) {
					return cachedData;
				}
			}

			// Update the last fetch timestamp
			this.lastDashboardFetch = now;

			const headers = await getAuthHeaders(this.getToken);
			const response = await fetch(
				`${this.baseUrl}/api/admin/dashboard-stats`,
				{
					headers,
					// Add cache control to ensure fresh data
					cache: "no-store",
					// Set a reasonable timeout
					signal: AbortSignal.timeout(10000), // 10 seconds timeout
				}
			);

			const data = await handleApiResponse<DashboardStats>(
				response,
				"Failed to fetch dashboard data"
			);

			// Store successful response in cache for future use
			const cacheKey = ApiCache.generateCacheKey(
				`${this.baseUrl}/api/admin/dashboard-stats`
			);
			apiCache.set(cacheKey, data, 60 * 1000); // Cache for 60 seconds

			return data;
		} catch (error) {
			// Handle timeout and network errors specifically
			if (error instanceof DOMException && error.name === "AbortError") {
				// Try to return cached data if available when timeout occurs
				const cacheKey = ApiCache.generateCacheKey(
					`${this.baseUrl}/api/admin/dashboard-stats`
				);
				const cachedData = apiCache.get<DashboardStats>(cacheKey);
				if (cachedData) {
					return cachedData;
				}

				throw new Error(
					"Dashboard data fetch timed out. Please try again."
				);
			}

			if (error instanceof TypeError && error.message.includes("fetch")) {
				// Try to return cached data if available when network error occurs
				const cacheKey = ApiCache.generateCacheKey(
					`${this.baseUrl}/api/admin/dashboard-stats`
				);
				const cachedData = apiCache.get<DashboardStats>(cacheKey);
				if (cachedData) {
					return cachedData;
				}

				throw new Error(
					"Network error. Please check your internet connection."
				);
			}

			throw error; // Re-throw to be handled by withErrorHandling
		}
	} // Loan listing
	async getLoans(
		page = 1,
		limit = 10,
		filters?: Record<string, any>
	): Promise<{ loans: LoanApplication[]; total: number }> {
		const cacheKey = ApiCache.generateCacheKey(
			`${
				this.baseUrl
			}/api/admin/loans?page=${page}&limit=${limit}&filters=${JSON.stringify(
				filters || {}
			)}`
		);

		try {
			const headers = await getAuthHeaders(this.getToken);

			// Build query string from filters
			const queryParams = new URLSearchParams({
				page: String(page),
				limit: String(limit),
			});
			if (filters) {
				Object.entries(filters).forEach(([key, value]) => {
					if (value !== undefined && value !== null && value !== "") {
						queryParams.append(key, String(value));
					}
				});
			}

			const response = await fetch(
				`${this.baseUrl}/api/admin/loans?${queryParams}`,
				{
					headers,
					cache: "no-store",
					signal: AbortSignal.timeout(8000), // 8 seconds timeout
				}
			);

			const responseData = await handleApiResponse(
				response,
				"Failed to fetch loans"
			);

			// Handle the API response format which returns { data: loans[], pagination: { total, page, pages, limit } }
			const sanitizedData = {
				loans: Array.isArray(
					(responseData as { data: LoanApplication[] }).data
				)
					? (responseData as { data: LoanApplication[] }).data
					: [],
				total:
					(responseData as { pagination?: { total: number } })
						.pagination?.total || 0,
			};

			// Cache successful response
			apiCache.set(cacheKey, sanitizedData, 30 * 1000); // Cache for 30 seconds

			return sanitizedData;
		} catch (error) {
			// Try to use cached data if available
			const cachedData = apiCache.get<{
				loans: LoanApplication[];
				total: number;
			}>(cacheKey);
			if (cachedData) {
				return cachedData;
			}

			// Handle specific error types with user-friendly messages
			if (error instanceof DOMException && error.name === "AbortError") {
				throw new Error(
					"Request timed out while fetching loans. Please try again."
				);
			}

			if (error instanceof TypeError && error.message.includes("fetch")) {
				throw new Error(
					"Network error. Please check your internet connection and try again."
				);
			}

			// Return empty result instead of throwing when all else fails
			// This prevents the UI from breaking when there's a backend issue
			return { loans: [], total: 0 };
		}
	} // Loan details
	async getLoanDetails(id: string): Promise<LoanDetails> {
		try {
			const headers = await getAuthHeaders(this.getToken);

			const response = await fetch(
				`${this.baseUrl}/api/admin/loans/${id}`,
				{
					headers,
					// Add cache control to ensure we get fresh data
					cache: "no-store",
				}
			);

			return handleApiResponse<LoanDetails>(
				response,
				`Failed to fetch loan details for ID: ${id}`
			);
		} catch (error) {
			throw error; // Re-throw to be handled by withErrorHandling
		}
	}
	// Update loan status
	async updateLoanStatus(id: string, status: string): Promise<LoanDetails> {
		try {
			const headers = await getAuthHeaders(this.getToken);
			// Ensure content-type header is properly set
			const requestHeaders = {
				...headers,
				"Content-Type": "application/json",
			};

			const url = `${this.baseUrl}/api/admin/loans/${id}/status`;

			const response = await fetch(url, {
				method: "PATCH",
				headers: requestHeaders,
				body: JSON.stringify({ status }),
				signal: AbortSignal.timeout(15000), // 15 seconds timeout for better reliability
				credentials: "include", // Include cookies if needed
				mode: "cors", // Explicitly set CORS mode
			});

			// Provide a more specific error message based on the status being set
			const statusAction =
				status === "approved"
					? "approve"
					: status === "rejected"
					? "reject"
					: status === "verified"
					? "verify"
					: "update";

			const result = await handleApiResponse<LoanDetails>(
				response,
				`Failed to ${statusAction} loan. Please try again.`
			);

			return result;
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") {
				throw new Error(
					"Status update timed out. The operation might have completed, please check before trying again."
				);
			}

			if (error instanceof TypeError && error.message.includes("fetch")) {
				throw new Error(
					"Network connection issue. Please check your internet connection and try again."
				);
			}

			throw error;
		}
	} // User loans (for customer portal)
	async getUserLoans(): Promise<LoanApplication[]> {
		const cacheKey = ApiCache.generateCacheKey(`${this.baseUrl}/api/loans`);
		const isOnline =
			typeof navigator !== "undefined" ? navigator.onLine : true;

		try {
			// If we're offline, try to use cached data immediately
			if (!isOnline) {
				const cachedData = apiCache.get<LoanApplication[]>(cacheKey);
				if (cachedData) {
					logWarning(
						"Using cached loan data because you are offline",
						{ source: "getUserLoans" }
					);
					return cachedData;
				}
				throw new Error(
					"You are currently offline and no cached data is available."
				);
			}

			const headers = await getAuthHeaders(this.getToken);
			const response = await fetch(`${this.baseUrl}/api/loans`, {
				headers,
				cache: "no-store",
				signal: AbortSignal.timeout(8000), // 8 seconds timeout
			});

			const data = await handleApiResponse<LoanApplication[]>(
				response,
				"Failed to fetch your loans"
			);

			// Cache the successful response for offline use
			apiCache.set(cacheKey, data, 30 * 60 * 1000); // Cache for 30 minutes

			return data;
		} catch (error) {
			// Handle offline mode gracefully - try to use cached data even if the error is not a network error
			const cachedData = apiCache.get<LoanApplication[]>(cacheKey);

			if (cachedData) {
				// Log that we're using cached data
				logWarning("Using cached loan data after fetch error", {
					error:
						error instanceof Error
							? error.message
							: "Unknown error",
					source: "getUserLoans",
				});
				return cachedData;
			}

			// Customize error message based on error type
			if (error instanceof TypeError && error.message.includes("fetch")) {
				logError("Network error when fetching user loans", { error });
				throw new Error(
					"You appear to be offline. Please check your internet connection and try again."
				);
			}

			if (error instanceof DOMException && error.name === "AbortError") {
				throw new Error(
					"Request timed out while loading your loans. Please try again."
				);
			}

			throw error;
		}
	}
	// Apply for a loan
	async applyForLoan(
		loanData: Omit<
			LoanApplication,
			"id" | "userId" | "appliedAt" | "status"
		>
	): Promise<LoanApplication> {
		try {
			const headers = await getAuthHeaders(this.getToken);

			// Validate loan data before sending
			if (loanData.loanAmount <= 0) {
				throw new Error("Loan amount must be greater than zero");
			}

			if (loanData.duration <= 0) {
				throw new Error("Loan duration must be greater than zero");
			}

			const response = await fetch(`${this.baseUrl}/api/loans/apply`, {
				method: "POST",
				headers,
				body: JSON.stringify(loanData),
				signal: AbortSignal.timeout(10000), // 10 seconds timeout for loan application
			});

			const result = await handleApiResponse<LoanApplication>(
				response,
				"Failed to submit loan application. Please try again."
			);

			// Clear any cached loan data since we've modified the state
			const cacheKey = ApiCache.generateCacheKey(
				`${this.baseUrl}/api/loans`
			);
			apiCache.delete(cacheKey);

			return result;
		} catch (error) {
			// Handle specific error cases
			if (error instanceof DOMException && error.name === "AbortError") {
				logError("Loan application submission timed out", { loanData });
				throw new Error(
					"Your loan application submission timed out. Please try again and confirm if your application was submitted."
				);
			}

			if (error instanceof TypeError && error.message.includes("fetch")) {
				logError("Network error during loan application", { loanData });
				throw new Error(
					"Network connection failed. Your application was not submitted. Please try again when your connection is restored."
				);
			}

			// Log the error but re-throw for higher-level handling
			logError("Error applying for loan", {
				error: error instanceof Error ? error.message : "Unknown error",
				loanAmount: loanData.loanAmount,
				duration: loanData.duration,
			});

			throw error;
		}
	}
}

/**
 * Hook to use the API service with authentication and enhanced error handling
 */
export function useApiService() {
	const { getToken, userId } = useAuth();

	// Create the API service
	const apiService = new ApiService(getToken);

	// Set user ID for error logging if available
	if (userId) {
		import("./error-logger")
			.then(({ default: logger }) => {
				logger.setUserId(userId);
			})
			.catch(() => {
				// Silently fail if logger can't be imported
			});
	}

	return apiService;
}
