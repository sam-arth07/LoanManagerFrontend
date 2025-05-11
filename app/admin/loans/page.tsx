"use client";

import { ErrorDisplay, ErrorToast } from "@/components/ErrorToast";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { withErrorHandling } from "@/utils/api-error";
import { LoanApplication, useApiService } from "@/utils/api-service";
import { useAuth } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Types
interface PaginationData {
	total: number;
	page: number;
	pages: number;
	limit: number;
}

export default function LoansPage() {
	const [loans, setLoans] = useState<LoanApplication[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState<PaginationData>({
		total: 0,
		page: 1,
		pages: 1,
		limit: 10,
	});
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const { getToken, isLoaded } = useAuth();
	const apiService = useApiService();

	const fetchLoans = async () => {
		if (!isLoaded) return;

		setIsLoading(true);
		setError(null);

		// Prepare filters
		const filters: Record<string, any> = {};
		if (statusFilter !== "all") {
			filters.status = statusFilter;
		}
		if (searchTerm) {
			filters.search = searchTerm;
		}

		try {
			console.log("Fetching loans with:", {
				page: pagination.page,
				limit: pagination.limit,
				filters,
			});

			const response = await apiService.getLoans(
				pagination.page,
				pagination.limit,
				filters
			);
			console.log("API Response:", response);

			if (response && response.loans) {
				console.log(
					`Found ${response.loans.length} loans, total count: ${response.total}`
				);
				setLoans(response.loans);
				setPagination({
					...pagination,
					total: response.total || 0,
					pages: Math.ceil((response.total || 0) / pagination.limit),
				});
			} else {
				console.warn("Invalid API response format:", response);
				setError("Failed to process loan data");
			}
		} catch (err) {
			console.error("Error fetching loans:", err);
			setError(
				err instanceof Error ? err.message : "Failed to fetch loans"
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchLoans();
	}, [isLoaded, pagination.page, pagination.limit, statusFilter]);

	// Separate useEffect to handle search with debouncing
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchTerm) {
				fetchLoans();
			}
		}, 500); // 500ms debounce

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Handler for status change
	const handleStatusChange = async (loanId: string, newStatus: string) => {
		setError(null);

		try {
			const { data, error: updateError } = await withErrorHandling(() =>
				apiService.updateLoanStatus(loanId, newStatus)
			);

			if (data) {
				// Update the loan status in the local state
				// Make sure loans exists before mapping
				if (Array.isArray(loans)) {
					setLoans(
						loans.map((loan) =>
							loan.id === loanId
								? { ...loan, status: newStatus }
								: loan
						)
					);
				}
			} else if (updateError) {
				setError(updateError);
			}
		} catch (err) {
			console.error("Error updating loan status:", err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to update loan status"
			);
		}
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

	// Filtered loans (for search)
	const filteredLoans = loans
		? loans.filter(
				(loan) =>
					loan.fullName
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					loan.purpose
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
		  )
		: [];

	if (isLoading) {
		return <Loader size="large" text="Loading loan applications..." />;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Loan Applications</h1>

				<div className="flex space-x-2">
					<div className="relative">
						<Input
							type="text"
							placeholder="Search loans..."
							className="pl-10"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
					</div>

					<div className="relative inline-block">
						<select
							className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-gray-500"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}>
							<option value="all">All Status</option>
							<option value="pending">Pending</option>
							<option value="approved">Approved</option>
							<option value="rejected">Rejected</option>
							<option value="verified">Verified</option>
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
							<Filter className="h-4 w-4" />
						</div>
					</div>
				</div>
			</div>

			{error && (
				<>
					<ErrorToast error={error} onClose={() => setError(null)} />
					<div className="bg-red-50 p-4 rounded-lg">
						<ErrorDisplay
							error={error}
							retryFn={fetchLoans}
							dismissFn={() => setError(null)}
							className="mb-2"
						/>
						<p className="text-sm text-gray-600 mt-2">
							If this issue persists, please contact the system
							administrator.
						</p>
					</div>
				</>
			)}

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
							{filteredLoans.length > 0 ? (
								filteredLoans.map((loan) => (
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
											<div className="flex items-center space-x-2">
												<Link
													href={`/admin/loans/${loan.id}`}
													className="text-blue-600 hover:text-blue-900 text-sm font-medium">
													View
												</Link>
												{loan.status === "pending" && (
													<>
														<button
															className="text-green-600 hover:text-green-900 text-sm font-medium"
															onClick={() =>
																handleStatusChange(
																	loan.id,
																	"approved"
																)
															}>
															Approve
														</button>
														<button
															className="text-red-600 hover:text-red-900 text-sm font-medium"
															onClick={() =>
																handleStatusChange(
																	loan.id,
																	"rejected"
																)
															}>
															Reject
														</button>
													</>
												)}
												{loan.status === "approved" && (
													<button
														className="text-blue-600 hover:text-blue-900 text-sm font-medium"
														onClick={() =>
															handleStatusChange(
																loan.id,
																"verified"
															)
														}>
														Verify
													</button>
												)}
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={7}
										className="px-6 py-4 text-center text-gray-500">
										No loan applications found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
					<div className="text-sm text-gray-500">
						Showing {filteredLoans.length} of {pagination.total}{" "}
						loans
					</div>
					<div className="flex space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setPagination((prev) => ({
									...prev,
									page: Math.max(prev.page - 1, 1),
								}))
							}
							disabled={pagination.page === 1}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setPagination((prev) => ({
									...prev,
									page: Math.min(prev.page + 1, prev.pages),
								}))
							}
							disabled={pagination.page === pagination.pages}>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
