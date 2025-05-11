"use client";

import UserLoansTable from "@/components/UserLoansTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiBaseUrl } from "@/utils/api-service"; // Added import
import { useAuth, UserButton, useUser } from "@clerk/nextjs";
import axios from "axios";
import {
	BellIcon,
	CreditCard,
	DollarSign,
	Home,
	MessageCircle,
	Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Loan = {
	id: string;
	fullName: string;
	loanAmount: number;
	purpose: string;
	duration: number;
	status: "pending" | "approved" | "rejected" | "verified";
	appliedAt: string;
	employmentStatus?: string;
	employmentAddress?: string;
};

export default function Dashboard() {
	const router = useRouter();
	const { user, isLoaded: isUserLoaded } = useUser();
	const { getToken } = useAuth();

	const [loans, setLoans] = useState<Loan[]>([]);
	const [isLoadingLoans, setIsLoadingLoans] = useState(true);
	const [loanError, setLoanError] = useState<string | null>(null);
	const [deficit, setDeficit] = useState<number>(0);

	useEffect(() => {
		async function fetchUserLoansAndCalculateDeficit() {
			setIsLoadingLoans(true);
			setLoanError(null);
			try {
				const token = await getToken();
				if (!token) {
					setLoanError("Authentication required to fetch loans.");
					setIsLoadingLoans(false);
					return;
				}

				const response = await axios.get(
					`${getApiBaseUrl()}/api/loan/my-loans`, // Changed
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
						timeout: 5000,
					}
				);
				const fetchedLoans: Loan[] = response.data;
				setLoans(fetchedLoans);

				const activeLoanAmount = fetchedLoans
					.filter(
						(loan) =>
							loan.status === "approved" ||
							loan.status === "verified"
					)
					.reduce((sum, loan) => sum + loan.loanAmount, 0);
				setDeficit(activeLoanAmount);
			} catch (err: any) {
				console.error("Error fetching user loans for dashboard:", err);
				if (
					err.code === "ECONNABORTED" ||
					err.response?.status >= 500 ||
					!err.response
				) {
					console.warn(
						"Using demo data for dashboard deficit due to API error."
					);
					const demoLoans: Loan[] = [
						{
							id: "1",
							fullName: "Demo User",
							loanAmount: 50000,
							purpose: "Demo",
							duration: 12,
							status: "approved",
							appliedAt: new Date().toISOString(),
						},
						{
							id: "2",
							fullName: "Demo User",
							loanAmount: 25000,
							purpose: "Demo 2",
							duration: 24,
							status: "verified",
							appliedAt: new Date().toISOString(),
						},
						{
							id: "3",
							fullName: "Demo User",
							loanAmount: 10000,
							purpose: "Demo 3",
							duration: 6,
							status: "pending",
							appliedAt: new Date().toISOString(),
						},
					];
					setLoans(demoLoans);
					const activeDemoLoanAmount = demoLoans
						.filter(
							(loan) =>
								loan.status === "approved" ||
								loan.status === "verified"
						)
						.reduce((sum, loan) => sum + loan.loanAmount, 0);
					setDeficit(activeDemoLoanAmount);
					setLoanError(null);
				} else {
					setLoanError(
						err.response?.data?.message ||
							"Failed to fetch loan applications."
					);
				}
			} finally {
				setIsLoadingLoans(false);
			}
		}

		if (isUserLoaded) {
			fetchUserLoansAndCalculateDeficit();
		}
	}, [getToken, isUserLoaded]);

	return (
		<div className="min-h-screen bg-[#efefef]">
			<header className="bg-white border-b border-[#dfe0eb] px-6 py-3 flex items-center justify-between">
				<div className="text-[#0a512f] font-bold text-xl">
					CREDIT APP
				</div>
				<div className="flex items-center space-x-6">
					<div className="flex items-center text-[#0a512f] font-medium">
						<Home className="mr-2 h-5 w-5" />
						<span>Home</span>
					</div>

					<div className="flex items-center text-[#7c7c7c] font-medium">
						<Send className="mr-2 h-5 w-5" />
						<span>Payments</span>
					</div>

					<div className="flex items-center text-[#7c7c7c] font-medium">
						<DollarSign className="mr-2 h-5 w-5" />
						<span>Budget</span>
					</div>

					<div className="flex items-center text-[#7c7c7c] font-medium">
						<CreditCard className="mr-2 h-5 w-5" />
						<span>Card</span>
					</div>
				</div>{" "}
				<div className="flex items-center space-x-4">
					<BellIcon className="h-5 w-5 text-[#7c7c7c]" />
					<MessageCircle className="h-5 w-5 text-[#0a512f]" />

					<div className="flex items-center space-x-2">
						<UserButton afterSignOutUrl="/" />

						{isUserLoaded ? (
							<div className="flex items-center">
								<span className="text-[#0a512f] font-medium mr-1">
									{user?.fullName ||
										user?.firstName ||
										user?.primaryEmailAddress
											?.emailAddress ||
										"User"}
								</span>
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg">
									<path
										d="M6 9L12 15L18 9"
										stroke="#0a512f"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						) : (
							<div className="flex items-center">
								<span className="text-[#7c7c7c] mr-1">
									Loading...
								</span>
							</div>
						)}
					</div>
				</div>
			</header>

			<main className="max-w-5xl mx-auto py-8 px-4">
				<div className="flex justify-between items-center mb-8">
					<div className="flex items-start">
						<div className="bg-[#6b9908] p-3 mr-3">
							<DollarSign className="h-6 w-6 text-white" />
						</div>
						<div>
							<div className="text-xs text-[#696969] uppercase">
								DEFICIT
							</div>
							<div className="flex items-center">
								<span className="text-[#696969] mr-1">₹</span>
								{isLoadingLoans ? (
									<span className="text-4xl font-medium text-[#6b9908]">
										Loading...
									</span>
								) : loanError ? (
									<span className="text-lg font-medium text-red-500">
										Error
									</span>
								) : (
									<span className="text-4xl font-medium text-[#6b9908]">
										{deficit.toLocaleString(undefined, {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</span>
								)}
							</div>
						</div>
					</div>
					<Button
						className="bg-[#0a512f] hover:bg-[#064921] text-white rounded-md px-6"
						onClick={() => router.push("/dashboard/loan")}>
						Get A Loan
					</Button>
				</div>
				<Tabs defaultValue="borrow" className="mb-6">
					<TabsList className="bg-white w-full grid grid-cols-3 p-0 h-12">
						<TabsTrigger
							value="borrow"
							className="rounded-none data-[state=active]:bg-[#f8faf0] data-[state=active]:text-black data-[state=active]:shadow-none h-full">
							Borrow Cash
						</TabsTrigger>
						<TabsTrigger
							value="transact"
							className="rounded-none data-[state=active]:bg-[#f8faf0] data-[state=active]:text-black data-[state=active]:shadow-none h-full">
							Transact
						</TabsTrigger>
						<TabsTrigger
							value="deposit"
							className="rounded-none data-[state=active]:bg-[#f8faf0] data-[state=active]:text-black data-[state=active]:shadow-none h-full">
							Deposit Cash
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<UserLoansTable
					loans={loans}
					isLoading={isLoadingLoans}
					error={loanError}
				/>
			</main>
		</div>
	);
}
