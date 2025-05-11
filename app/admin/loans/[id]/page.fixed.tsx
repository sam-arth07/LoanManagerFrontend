"use client";

import { ErrorDisplay, ErrorToast } from "@/components/ErrorToast";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { withErrorHandling } from "@/utils/api-error";
import {
	LoanDetails as LoanDetailsType,
	useApiService,
} from "@/utils/api-service";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";

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

	// Create the API service once and store in a ref
	const apiService = useApiService();
	const apiServiceRef = useRef(apiService);

	// Unwrap the params Promise
	const paramsData = React.use(params);
	const { id } = paramsData;

	// Use a callback to fetch loan details
	const fetchLoanDetails = useCallback(async () => {
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
				err instanceof Error ? err.message : "An unknown error occurred"
			);
		} finally {
			setIsLoading(false);
		}
	}, [isLoaded, id]);

	// Handle status change
	const handleStatusChange = async (newStatus: string) => {
		setError(null);

		try {
			const { data, error: updateError } = await withErrorHandling(() =>
				apiServiceRef.current.updateLoanStatus(id, newStatus)
			);

			if (data) {
				setLoan(data);
			} else if (updateError) {
				setError(updateError);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to update loan status"
			);
		}
	};

	// Fetch loan details on component mount
	useEffect(() => {
		let isMounted = true;

		const loadLoan = async () => {
			if (!isLoaded) return;

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
							: "An unknown error occurred"
					);
					setIsLoading(false);
				}
			}
		};

		loadLoan();

		// Cleanup function
		return () => {
			isMounted = false;
		};
	}, [isLoaded, id]);

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
	}

	if (error) {
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

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Loan Details Section */}
				<Card className="p-6 shadow-md">
					<h2 className="text-xl font-semibold mb-4 border-b pb-2">
						Loan Information
					</h2>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-gray-600">Status</span>
							{getStatusBadge(loan.status)}
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600">Loan Amount</span>
							<span className="font-semibold">
								{formatCurrency(loan.loanAmount)}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600">Duration</span>
							<span>{loan.duration} months</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600">Applied On</span>
							<span>{formatDate(loan.appliedAt)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600">Purpose</span>
							<span>{loan.purpose}</span>
						</div>
					</div>
				</Card>

				{/* Applicant Details Section */}
				<Card className="p-6 shadow-md">
					<h2 className="text-xl font-semibold mb-4 border-b pb-2">
						Applicant Information
					</h2>
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-gray-600">Full Name</span>
							<span className="font-semibold">
								{loan.fullName}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600">User ID</span>
							<span className="font-mono text-sm">
								{loan.userId}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600">
								Employment Status
							</span>
							<span>{loan.employmentStatus}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-gray-600">
								Employment Address
							</span>
							<span className="text-right">
								{loan.employmentAddress}
							</span>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
