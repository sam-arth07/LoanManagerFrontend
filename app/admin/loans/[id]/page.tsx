"use client";

import { ErrorDisplay, ErrorToast } from "@/components/ErrorToast";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { withErrorHandling } from "@/utils/api-error";
import {
	getApiBaseUrl,
	LoanDetails as LoanDetailsType,
	useApiService,
} from "@/utils/api-service"; // Added import
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface LoanDetailsPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function LoanDetailsPage({ params }: LoanDetailsPageProps) {
	const [loan, setLoan] = useState<LoanDetailsType | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { getToken, isLoaded } = useAuth();
	const apiService = useApiService();
	const apiServiceRef = React.useRef(apiService); // Create a stable reference
	const paramsData = React.use(params); // Unwrap the params Promise
	const { id } = paramsData; // Access the unwrapped params object

	// Function that can be called to reload loan details (for error retry)
	const fetchLoanDetails = async () => {
		if (!isLoaded) return;

		setIsLoading(true);
		setError(null);

		try {
			const { data, error } = await withErrorHandling(() =>
				apiServiceRef.current.getLoanDetails(id)
			);

			if (data) {
				setLoan(data);
			} else if (error) {
				setError(error);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to fetch loan details"
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		let isMounted = true;

		const fetchData = async () => {
			if (!isLoaded) return;

			setIsLoading(true);
			setError(null);

			try {
				const { data, error } = await withErrorHandling(() =>
					apiServiceRef.current.getLoanDetails(id)
				);

				// Only update state if component is still mounted
				if (isMounted) {
					if (data) {
						setLoan(data);
					} else if (error) {
						setError(error);
					}
					setIsLoading(false);
				}
			} catch (err) {
				if (isMounted) {
					setError(
						err instanceof Error
							? err.message
							: "An unexpected error occurred"
					);
					setIsLoading(false);
				}
			}
		};

		fetchData();

		// Cleanup function to prevent state updates after unmount
		return () => {
			isMounted = false;
		};
	}, [isLoaded, id]); // Only re-fetch when authentication loads or ID changes
	const handleStatusChange = async (newStatus: string) => {
		try {
			setError(null);
			setIsLoading(true); // Show loading state
			console.log(
				`Attempting to update loan ${id} status to ${newStatus}`
			);

			// Get the API base URL from the same function used by apiService
			const baseUrl = getApiBaseUrl(); // Changed

			// Add Content-Type header and Authorization header
			const token = await getToken();
			console.log("Auth token available:", token ? "Yes" : "No");

			const headers = {
				"Content-Type": "application/json",
				// Add authorization header to ensure we have proper authentication
				Authorization: `Bearer ${token}`,
			};

			// Construct full URL for better logging
			const url = `${baseUrl}/api/admin/loans/${id}/status`;
			console.log(`Sending request to: ${url}`);
			console.log(`Request headers:`, headers);
			console.log(
				`Request payload:`,
				JSON.stringify({ status: newStatus })
			);

			// Make sure we have a proper network connection first
			if (!navigator.onLine) {
				throw new Error(
					"You are offline. Please check your internet connection."
				);
			}

			// Add error handling and timeouts
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

				const response = await fetch(url, {
					method: "PATCH",
					headers: headers,
					body: JSON.stringify({ status: newStatus }),
					credentials: "include", // Include cookies for cross-origin requests
					signal: controller.signal,
					mode: "cors", // Explicitly set CORS mode
				});

				clearTimeout(timeoutId); // Clear the timeout since the request completed

				console.log(`Status update response code:`, response.status);
				console.log(
					`Response headers:`,
					Object.fromEntries([...response.headers])
				);

				if (response.ok) {
					const updatedLoan = await response.json();
					console.log("Status update successful:", updatedLoan);
					setLoan(updatedLoan);
				} else {
					const errorData = await response.json().catch(() => {
						console.error("Failed to parse error response as JSON");
						return {};
					});

					// Fix grammar in error message based on the status action
					const statusAction =
						newStatus === "approved"
							? "approve"
							: newStatus === "rejected"
							? "reject"
							: newStatus === "verified"
							? "verify"
							: "update";

					const errorMessage =
						errorData.error || `Failed to ${statusAction} loan`;
					console.error(
						"Status update failed:",
						errorMessage,
						errorData
					);
					setError(errorMessage);
				}
			} catch (error: unknown) {
				if (error instanceof Error && error.name === "AbortError") {
					console.error("Request timed out after 10 seconds");
					throw new Error("Request timed out. Please try again.");
				}
				throw error; // Re-throw for the outer catch block
			}
		} catch (err) {
			console.error("Status update exception:", err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to update loan status"
			);
		} finally {
			setIsLoading(false);
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
			hour: "numeric",
			minute: "numeric",
		});
	}; // Get status badge
	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case "approved":
				return (
					<div
						className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full"
						title="Loan application approved and funds disbursed">
						<CheckCircle className="w-4 h-4 mr-1" />
						Approved
					</div>
				);
			case "pending":
				return (
					<div
						className="flex items-center text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full"
						title="Loan application awaiting admin review">
						<Clock className="w-4 h-4 mr-1" />
						Pending
					</div>
				);
			case "rejected":
				return (
					<div
						className="flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-full"
						title="Loan application denied">
						<XCircle className="w-4 h-4 mr-1" />
						Rejected
					</div>
				);
			case "verified":
				return (
					<div
						className="flex items-center text-blue-700 bg-blue-100 px-3 py-1 rounded-full"
						title="Loan has been fully repaid and closed">
						<CheckCircle className="w-4 h-4 mr-1" />
						Verified (Fully Repaid)
					</div>
				);
			default:
				return (
					<div className="flex items-center text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
						{status}
					</div>
				);
		}
	};
	if (isLoading) {
		return <Loader size="large" text="Loading loan details..." />;
	}
	if (error) {
		return (
			<>
				<ErrorToast error={error} onClose={() => setError(null)} />
				<div className="bg-red-50 p-6 rounded-lg">
					<ErrorDisplay
						error={error}
						retryFn={() => fetchLoanDetails()}
						dismissFn={() => setError(null)}
						className="mb-4"
					/>
					<div className="flex justify-between mt-4 items-center">
						<p className="text-sm text-gray-600">
							If this issue persists, please check your connection
							or contact support.
						</p>
						<Button variant="outline" asChild>
							<Link href="/admin/loans">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Loans
							</Link>
						</Button>
					</div>
				</div>
			</>
		);
	}

	if (!loan) {
		return (
			<div className="text-center">
				<p className="text-gray-700">Loan not found</p>
				<Button variant="outline" className="mt-4" asChild>
					<Link href="/admin/loans">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Loans
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-4">
					<Button variant="outline" asChild>
						<Link href="/admin/loans">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Link>
					</Button>
					<h1 className="text-2xl font-bold">
						Loan Application Details
					</h1>
				</div>{" "}
				<div className="flex items-center space-x-2">
					{" "}
					{isLoading ? (
						<div className="flex items-center space-x-2">
							<Loader size="small" text="Updating status..." />
						</div>
					) : (
						<>
							{loan.status === "pending" && (
								<>
									<Button
										variant="outline"
										className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
										onClick={() =>
											handleStatusChange("rejected")
										}
										disabled={isLoading}>
										<XCircle className="h-4 w-4 mr-2" />
										Reject
									</Button>
									<Button
										variant="outline"
										className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
										onClick={() =>
											handleStatusChange("approved")
										}
										disabled={isLoading}>
										<CheckCircle className="h-4 w-4 mr-2" />
										Approve
									</Button>
								</>
							)}
							{loan.status === "rejected" && (
								<Button
									variant="outline"
									className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800"
									onClick={() =>
										handleStatusChange("pending")
									}
									disabled={isLoading}>
									<Clock className="h-4 w-4 mr-2" />
									Reconsider (Move to Pending)
								</Button>
							)}
							{loan.status === "approved" && (
								<>
									<Button
										variant="outline"
										className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:text-orange-800"
										onClick={() =>
											handleStatusChange("pending")
										}
										disabled={isLoading}>
										<ArrowLeft className="h-4 w-4 mr-2" />
										Revert to Pending
									</Button>{" "}
									<Button
										variant="outline"
										className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
										onClick={() =>
											handleStatusChange("verified")
										}
										disabled={isLoading}
										title="Mark this loan as fully repaid - this will be counted in Cash Received">
										<CheckCircle className="h-4 w-4 mr-2" />
										Mark as Fully Repaid (Verify)
									</Button>
								</>
							)}
						</>
					)}
				</div>
			</div>{" "}
			{/* Status Workflow Information */}
			<Card className="bg-white shadow-sm p-4">
				<div className="flex items-center text-sm text-blue-700">
					<div className="bg-blue-100 p-1 rounded mr-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<p>
							<strong>Loan Status Workflow:</strong> Loans start
							as Pending, then can be Approved or Rejected.
							Approved loans can be marked as Verified once fully
							repaid. Only Verified loans are counted in Cash
							Received metrics.
						</p>
					</div>
				</div>
			</Card>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Loan Overview */}
				<Card className="col-span-2 bg-white shadow-sm p-6">
					{" "}
					<h2 className="text-xl font-semibold mb-4">
						Loan Overview
					</h2>
					<div className="flex justify-between items-center mb-4">
						<div>
							<p className="text-sm text-gray-500">Status</p>
							{getStatusBadge(loan.status)}{" "}
							<p className="text-xs text-gray-500 mt-1">
								{loan.status === "pending" &&
									"Awaiting admin review - can be approved or rejected"}
								{loan.status === "approved" &&
									"Loan approved and funds disbursed - can be reverted to pending or marked as repaid"}
								{loan.status === "rejected" &&
									"Application denied - can be reconsidered (moved back to pending)"}
								{loan.status === "verified" &&
									"Loan fully repaid and closed - final status, cannot be changed"}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Loan ID</p>
							<p className="font-mono">{loan.id}</p>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
						<div>
							<p className="text-sm text-gray-500">Full Name</p>
							<p className="font-medium">{loan.fullName}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">User ID</p>
							<p className="font-medium font-mono">
								{loan.userId}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Loan Amount</p>
							<p className="font-medium">
								{formatCurrency(loan.loanAmount)}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Duration</p>
							<p className="font-medium">
								{loan.duration} months
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Purpose</p>
							<p className="font-medium">{loan.purpose}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Applied On</p>
							<p className="font-medium">
								{formatDate(loan.appliedAt)}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">
								Employment Status
							</p>
							<p className="font-medium">
								{loan.employmentStatus || "Not provided"}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">
								Employment Address
							</p>
							<p className="font-medium">
								{loan.employmentAddress || "Not provided"}
							</p>
						</div>
					</div>
				</Card>

				{/* Loan Activity */}
				<Card className="bg-white shadow-sm p-6">
					<h2 className="text-xl font-semibold mb-4">
						Loan Activity
					</h2>
					<div className="space-y-4">
						<div className="border-l-2 border-green-500 pl-4 pb-6 relative">
							<div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
							<p className="font-medium">Application Submitted</p>
							<p className="text-sm text-gray-500">
								{formatDate(loan.appliedAt)}
							</p>
						</div>

						{loan.status !== "pending" && (
							<div className="border-l-2 border-blue-500 pl-4 pb-6 relative">
								<div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
								<p className="font-medium">
									Status changed to{" "}
									{loan.status.charAt(0).toUpperCase() +
										loan.status.slice(1)}
								</p>
								<p className="text-sm text-gray-500">
									{formatDate(loan.updatedAt)}
								</p>
							</div>
						)}

						{/* Placeholder for future activity */}
						<div className="border-l-2 border-gray-200 pl-4 relative">
							<div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200"></div>
							<p className="font-medium text-gray-500">
								Awaiting next action
							</p>
						</div>
					</div>
				</Card>
			</div>
			{/* Additional loan details could be added here */}
		</div>
	);
}
