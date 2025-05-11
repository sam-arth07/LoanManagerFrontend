"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useApiService, LoanDetails as LoanDetailsType } from "@/utils/api-service";
import { withErrorHandling } from "@/utils/api-error";
import { ErrorToast, ErrorDisplay } from "@/components/ErrorToast";
import Loader from "@/components/Loader";

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
	const paramsData = React.use(params); // Unwrap the params Promise
	const { id } = paramsData; // Access the unwrapped params object
	// Function to fetch loan details
	const fetchLoanDetails = async () => {
		if (!isLoaded) return;
		
		setIsLoading(true);
		setError(null);
		
		const { data, error } = await withErrorHandling(
			() => apiService.getLoanDetails(id)
		);
		
		if (data) {
			setLoan(data);
		} else if (error) {
			setError(error);
		}
		
		setIsLoading(false);
	};
	
	useEffect(() => {
		fetchLoanDetails();
	}, [isLoaded, apiService, id]);// Handler for status change
	const handleStatusChange = async (newStatus: string) => {
		setError(null);
		
		const { data, error: updateError } = await withErrorHandling(
			() => apiService.updateLoanStatus(id, newStatus)
		);
		
		if (data) {
			setLoan(data);
		} else if (updateError) {
			setError(updateError);
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
	};

	// Get status badge
	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case "approved":
				return (
					<div className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full">
						<CheckCircle className="w-4 h-4 mr-1" />
						Approved
					</div>
				);
			case "pending":
				return (
					<div className="flex items-center text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
						<Clock className="w-4 h-4 mr-1" />
						Pending
					</div>
				);
			case "rejected":
				return (
					<div className="flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-full">
						<XCircle className="w-4 h-4 mr-1" />
						Rejected
					</div>
				);
			case "verified":
				return (
					<div className="flex items-center text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
						<CheckCircle className="w-4 h-4 mr-1" />
						Verified
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
	}	if (error) {
		return (
			<>
				<ErrorToast error={error} onClose={() => setError(null)} />
				<div className="bg-red-50 p-6 rounded-lg">
					<ErrorDisplay 
						error={error} 
						retryFn={fetchLoanDetails}
						dismissFn={() => setError(null)}
						className="mb-4"
					/>
					<div className="flex justify-between mt-4 items-center">
						<p className="text-sm text-gray-600">
							If this issue persists, please check your connection or contact support.
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
				</div>

				<div className="flex items-center space-x-2">
					{loan.status === "pending" && (
						<>
							<Button
								variant="outline"
								className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
								onClick={() => handleStatusChange("rejected")}>
								<XCircle className="h-4 w-4 mr-2" />
								Reject
							</Button>
							<Button
								variant="outline"
								className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
								onClick={() => handleStatusChange("approved")}>
								<CheckCircle className="h-4 w-4 mr-2" />
								Approve
							</Button>
						</>
					)}
					{loan.status === "approved" && (
						<Button
							variant="outline"
							className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
							onClick={() => handleStatusChange("verified")}>
							<CheckCircle className="h-4 w-4 mr-2" />
							Verify
						</Button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Loan Overview */}
				<Card className="col-span-2 bg-white shadow-sm p-6">
					<h2 className="text-xl font-semibold mb-4">
						Loan Overview
					</h2>
					<div className="flex justify-between items-center mb-4">
						<div>
							<p className="text-sm text-gray-500">Status</p>
							{getStatusBadge(loan.status)}
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
