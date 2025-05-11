"use client";

import { Card } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import {
	ArrowDownUp,
	BarChart4,
	CheckCircle,
	Clock,
	DollarSign,
	Users,
	Wallet,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApiService, DashboardStats } from "@/utils/api-service";
import { withErrorHandling } from "@/utils/api-error";
import { ErrorToast, ErrorDisplay } from "@/components/ErrorToast";
import Loader from "@/components/Loader";

export default function AdminDashboardPage() {
	const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { isLoaded } = useAuth();
	const apiService = useApiService();

	// Track last refreshed time
	const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
	useEffect(() => {
		async function fetchDashboardData() {
			if (!isLoaded) return;
            
            setIsLoading(true);
            setError(null);

			const { data, error } = await withErrorHandling(
				() => apiService.getDashboardStats(),
                (err) => console.error("Dashboard data fetch error:", err),
                { retry: true, retryDelay: 1500 } // Retry once after 1.5s if the call fails
			);

			if (data) {
				setDashboardData(data);
				setLastRefreshed(new Date());
			} else if (error) {
				setError(error);
			}
			
			setIsLoading(false);
		}

		fetchDashboardData();
	}, [isLoaded, apiService]);
	// Function to refresh dashboard data manually
	const refreshDashboardData = async () => {
		if (!isLoaded) return;
		
		setIsLoading(true);
		setError(null);
		
		const { data, error } = await withErrorHandling(
			() => apiService.getDashboardStats(),
			(err) => console.error("Error refreshing dashboard data:", err)
		);
		
		if (data) {
			setDashboardData(data);
			setLastRefreshed(new Date());
		} else if (error) {
			setError(error);
		}
		
		setIsLoading(false);
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Get status color
	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "approved":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			case "verified":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// Calculate percentages for loan status
	const calculatePercentage = (value: number, total: number): number => {
		if (total === 0) return 0;
		return Math.round((value / total) * 100);
	};

	const pendingPercentage = calculatePercentage(
		dashboardData?.loanStats.pending || 0,
		dashboardData?.loanStats.total || 0
	);
	
	const approvedPercentage = calculatePercentage(
		dashboardData?.loanStats.approved || 0,
		dashboardData?.loanStats.total || 0
	);
	
	const rejectedPercentage = calculatePercentage(
		dashboardData?.loanStats.rejected || 0,
		dashboardData?.loanStats.total || 0
	);

	// Add visual progress bar for loan status
	const LoanStatusProgressBar = () => {
		if (!dashboardData || dashboardData.loanStats.total === 0) return null;
		
		return (
			<Card className="p-6 bg-white shadow-sm">
				<h3 className="text-sm font-medium text-gray-700 mb-4">Loan Status Distribution</h3>
				<div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
					{pendingPercentage > 0 && (
						<div 
							className="bg-yellow-400 h-full" 
							style={{ width: `${pendingPercentage}%` }}
							title={`Pending: ${pendingPercentage}%`}
						></div>
					)}
					{approvedPercentage > 0 && (
						<div 
							className="bg-green-400 h-full" 
							style={{ width: `${approvedPercentage}%` }}
							title={`Approved: ${approvedPercentage}%`}
						></div>
					)}
					{rejectedPercentage > 0 && (
						<div 
							className="bg-red-400 h-full" 
							style={{ width: `${rejectedPercentage}%` }}
							title={`Rejected: ${rejectedPercentage}%`}
						></div>
					)}
				</div>
				<div className="flex justify-between mt-2 text-xs text-gray-500">
					<div className="flex items-center">
						<div className="h-2 w-2 bg-yellow-400 rounded-full mr-1"></div>
						<span>Pending</span>
					</div>
					<div className="flex items-center">
						<div className="h-2 w-2 bg-green-400 rounded-full mr-1"></div>
						<span>Approved</span>
					</div>
					<div className="flex items-center">
						<div className="h-2 w-2 bg-red-400 rounded-full mr-1"></div>
						<span>Rejected</span>
					</div>
				</div>
			</Card>
		);
	};

	// Calculate loan KPIs and metrics
	const calculateAverageLoanAmount = (): string => {
		if (!dashboardData || !dashboardData.recentLoans || dashboardData.recentLoans.length === 0) {
			return formatCurrency(0);
		}
		
		const totalAmount = dashboardData.recentLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
		const avgAmount = totalAmount / dashboardData.recentLoans.length;
		
		return formatCurrency(avgAmount);
	};
	
	// Calculate approval rate
	const calculateApprovalRate = (): string => {
		if (!dashboardData || dashboardData.loanStats.total === 0) {
			return "0%";
		}
		
		const approvedRate = Math.round((dashboardData.loanStats.approved / dashboardData.loanStats.total) * 100);
		return `${approvedRate}%`;
	};
	if (isLoading) {
		return <Loader size="large" text="Loading dashboard data..." />;
	}	// Display error toast
	if (error) {
		return (
			<>
				<ErrorToast error={error} onClose={() => setError(null)} />
				<div className="bg-red-50 p-6 rounded-lg">
					<ErrorDisplay 
						error={error} 
						retryFn={refreshDashboardData}
						dismissFn={() => setError(null)}
						className="mb-4"
					/>
					<p className="text-sm text-gray-600 mt-2">
						If this issue persists, please contact support.
					</p>
				</div>
			</>
		);
	}

	if (!dashboardData) {
		return <div>No data available</div>;
	}
	const formatRefreshTime = (date: Date): string => {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	};
	
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Dashboard Overview</h1>
				<div className="flex items-center space-x-4">
					<span className="text-sm text-gray-500">
						Last updated: {formatRefreshTime(lastRefreshed)}
					</span>
					<button
						onClick={refreshDashboardData}
						disabled={isLoading}
						className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm hover:bg-blue-100 transition-colors"
					>
						{isLoading ? (
							<>
								<div className="w-4 h-4 border-2 border-t-blue-600 border-blue-200 rounded-full animate-spin mr-2"></div>
								Refreshing...
							</>
						) : (
							<>
								<svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								Refresh Data
							</>
						)}
					</button>
				</div>
			</div>

			{/* Stats Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card className="p-6 bg-white shadow-sm">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">
								Borrowers
							</p>
							<h3 className="text-2xl font-bold">
								{dashboardData.stats.borrowerCount}
							</h3>
							<p className="text-xs text-gray-400 mt-1">
								Total customers
							</p>
						</div>
						<div className="bg-blue-100 p-3 rounded-full">
							<Users className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-white shadow-sm">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">
								Cash Disbursed
							</p>
							<h3 className="text-2xl font-bold">
								{formatCurrency(
									dashboardData.stats.cashDisbursed
								)}
							</h3>
							<p className="text-xs text-gray-400 mt-1">
								Total loans disbursed
							</p>
						</div>
						<div className="bg-green-100 p-3 rounded-full">
							<DollarSign className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-white shadow-sm">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">
								Cash Received
							</p>
							<h3 className="text-2xl font-bold">
								{formatCurrency(
									dashboardData.stats.cashReceived
								)}
							</h3>							<p className="text-xs text-gray-400 mt-1">
								Total repayments received
							</p>
						</div>
						<div className="bg-purple-100 p-3 rounded-full">
							<Wallet className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-white shadow-sm">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">
								Active Users
							</p>
							<h3 className="text-2xl font-bold">
								{dashboardData.stats.activeUsers}
							</h3>
							<p className="text-xs text-gray-400 mt-1">
								System users
							</p>
						</div>
						<div className="bg-amber-100 p-3 rounded-full">
							<Users className="w-6 h-6 text-amber-600" />
						</div>
					</div>
				</Card>
			</div>

			{/* Loan Summary and KPI Cards */}
			<h2 className="text-xl font-semibold mt-8">Loan Performance Metrics</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<Card className="p-6 bg-white shadow-sm">
					<h3 className="text-sm text-gray-500 mb-2">Average Loan Amount</h3>
					<div className="flex items-center">
						<div className="text-2xl font-bold">{calculateAverageLoanAmount()}</div>
					</div>
					<div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
						<div className="bg-blue-500 h-full" style={{ width: '65%' }}></div>
					</div>
				</Card>
				
				<Card className="p-6 bg-white shadow-sm">
					<h3 className="text-sm text-gray-500 mb-2">Approval Rate</h3>
					<div className="flex items-center">
						<div className="text-2xl font-bold">{calculateApprovalRate()}</div>
					</div>
					<div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
						<div className="bg-green-500 h-full" style={{ width: `${calculatePercentage(dashboardData.loanStats.approved, dashboardData.loanStats.total)}%` }}></div>
					</div>
				</Card>
				
				<Card className="p-6 bg-white shadow-sm">
					<h3 className="text-sm text-gray-500 mb-2">Collection Rate</h3>
					<div className="flex items-center">
						<div className="text-2xl font-bold">
							{dashboardData.stats.cashReceived > 0 && dashboardData.stats.cashDisbursed > 0
								? `${Math.round((dashboardData.stats.cashReceived / dashboardData.stats.cashDisbursed) * 100)}%`
								: "0%"}
						</div>
					</div>
					<div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
						<div 
							className="bg-purple-500 h-full" 
							style={{ 
								width: `${dashboardData.stats.cashDisbursed > 0 
									? Math.min(100, Math.round((dashboardData.stats.cashReceived / dashboardData.stats.cashDisbursed) * 100))
									: 0}%` 
							}}
						></div>
					</div>
				</Card>
			</div>

			{/* Second row of stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<Card className="p-6 bg-white shadow-sm">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">
								Savings Account
							</p>
							<h3 className="text-2xl font-bold">
								{formatCurrency(
									dashboardData.stats.savingsAccount
								)}
							</h3>
							<p className="text-xs text-gray-400 mt-1">
								Total deposits
							</p>
						</div>
						<div className="bg-cyan-100 p-3 rounded-full">
							<Wallet className="w-6 h-6 text-cyan-600" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-white shadow-sm">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">
								Other Accounts
							</p>
							<h3 className="text-2xl font-bold">
								{dashboardData.stats.otherAccounts}
							</h3>
							<p className="text-xs text-gray-400 mt-1">
								Other income sources
							</p>
						</div>
						<div className="bg-indigo-100 p-3 rounded-full">
							<ArrowDownUp className="w-6 h-6 text-indigo-600" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-white shadow-sm">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-gray-500 mb-1">
								Repaid Loans
							</p>
							<h3 className="text-2xl font-bold">
								{dashboardData.stats.repaidLoans}
							</h3>
							<p className="text-xs text-gray-400 mt-1">
								Successfully closed loans
							</p>
						</div>
						<div className="bg-emerald-100 p-3 rounded-full">
							<CheckCircle className="w-6 h-6 text-emerald-600" />
						</div>
					</div>
				</Card>
			</div>

			{/* Loan Status Cards */}
			<h2 className="text-xl font-semibold mt-8">Loan Applications</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card className="p-6 bg-white shadow-sm border-t-4 border-yellow-400">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="text-2xl font-bold">
								{dashboardData.loanStats.pending}
							</h3>
							<p className="text-sm text-gray-500 mt-1">
								Pending Applications
							</p>
							<p className="text-xs text-gray-400 mt-1">
								{pendingPercentage}% of total
							</p>
						</div>
						<div className="bg-yellow-100 p-3 rounded-full">
							<Clock className="w-6 h-6 text-yellow-600" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-white shadow-sm border-t-4 border-green-400">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="text-2xl font-bold">
								{dashboardData.loanStats.approved}
							</h3>
							<p className="text-sm text-gray-500 mt-1">
								Approved Loans
							</p>
							<p className="text-xs text-gray-400 mt-1">
								{approvedPercentage}% of total
							</p>
						</div>
						<div className="bg-green-100 p-3 rounded-full">
							<CheckCircle className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-white shadow-sm border-t-4 border-red-400">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="text-2xl font-bold">
								{dashboardData.loanStats.rejected}
							</h3>
							<p className="text-sm text-gray-500 mt-1">
								Rejected Applications
							</p>
							<p className="text-xs text-gray-400 mt-1">
								{rejectedPercentage}% of total
							</p>
						</div>
						<div className="bg-red-100 p-3 rounded-full">
							<XCircle className="w-6 h-6 text-red-600" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-white shadow-sm border-t-4 border-blue-400">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="text-2xl font-bold">
								{dashboardData.loanStats.total}
							</h3>
							<p className="text-sm text-gray-500 mt-1">
								Total Applications
							</p>
						</div>
						<div className="bg-blue-100 p-3 rounded-full">
							<BarChart4 className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</Card>
			</div>

			{/* Loan Status Progress Bar */}
			<div className="mt-6">
				<LoanStatusProgressBar />
			</div>

			{/* Recent Loans Table */}
			<h2 className="text-xl font-semibold mt-8">
				Recent Loan Applications
			</h2>
			<Card className="bg-white shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
							<tr>
								<th className="px-6 py-3 text-left">
									Borrower
								</th>
								<th className="px-6 py-3 text-left">Amount</th>
								<th className="px-6 py-3 text-left">Purpose</th>
								<th className="px-6 py-3 text-left">
									Duration
								</th>
								<th className="px-6 py-3 text-left">Date</th>
								<th className="px-6 py-3 text-left">Status</th>
								<th className="px-6 py-3 text-left">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{dashboardData.recentLoans &&
							dashboardData.recentLoans.length > 0 ? (
								dashboardData.recentLoans.map((loan) => (
									<tr key={loan.id}>
										<td className="px-6 py-4 whitespace-nowrap">
											{loan.fullName}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{formatCurrency(loan.loanAmount)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{loan.purpose}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{loan.duration} months
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{formatDate(loan.appliedAt)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
													loan.status
												)}`}>
												{loan.status
													.charAt(0)
													.toUpperCase() +
													loan.status.slice(1)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Link
												href={`/admin/loans/${loan.id}`}
												className="text-blue-600 hover:text-blue-900 text-sm font-medium">
												View Details
											</Link>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={7}
										className="px-6 py-4 text-center text-gray-500">
										No recent loan applications found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				<div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
					<Link
						href="/admin/loans"
						className="text-blue-600 hover:text-blue-900 text-sm font-medium">
						View All Loans
					</Link>
				</div>
			</Card>
		</div>
	);
}
