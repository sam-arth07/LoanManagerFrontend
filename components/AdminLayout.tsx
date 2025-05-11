"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import {
	BarChart4,
	BellIcon,
	Calculator,
	CreditCard,
	DollarSign,
	Home,
	LineChart,
	LogOut,
	MessageCircle,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminLayoutProps {
	children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { getToken, isLoaded, userId } = useAuth();
	const router = useRouter();

	useEffect(() => {
		async function verifyAdmin() {
			if (isLoaded && userId) {
				try {					const token = await getToken();
					console.log("Sending admin verification request...");
					const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
					const response = await fetch(
						`${apiUrl}/api/auth/verify`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);

					console.log(
						"Admin verification response status:",
						response.status
					);
					const responseText = await response.text();
					console.log(
						"Admin verification raw response:",
						responseText
					);
					let data;
					try {
						data = JSON.parse(responseText);
						console.log("Admin verification parsed data:", data);

						// TEMPORARY: Allow all users to access admin for testing
						console.log(
							"TEMPORARY: Allowing all users to access admin panel"
						);
						setIsAdmin(true);

						// If you want to enforce admin-only access, uncomment this block:
						/*
						if (data.isAdmin) {
							console.log("User is verified as admin!");
							setIsAdmin(true);
						} else {
							console.log("User is NOT an admin, redirecting...");
							// Redirect non-admin users to the regular dashboard
							router.push("/dashboard");
						}
						*/
					} catch (jsonError) {
						console.error(
							"Failed to parse JSON response:",
							jsonError
						);
						router.push("/dashboard");
					}
				} catch (error) {
					console.error("Failed to verify admin status:", error);
					router.push("/dashboard"); // Redirect on error
				} finally {
					setIsLoading(false);
				}
			}
		}

		verifyAdmin();
	}, [isLoaded, userId, getToken, router]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-100">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-t-[#0a512f] border-[#f3f3f3] rounded-full animate-spin"></div>
					<p className="mt-4 text-[#0a512f] font-medium">
						Verifying admin access...
					</p>
				</div>
			</div>
		);
	}

	if (!isAdmin) {
		return null; // Will redirect in the useEffect
	}

	return (
		<div className="min-h-screen flex flex-row bg-[#efefef]">
			{/* Sidebar */}
			<div className="w-64 bg-[#0c3e19] text-white flex flex-col">
				<div className="h-14 flex items-center px-4 bg-[#072812]">
					<div className="text-xl font-bold">CREDIT APP</div>
				</div>

				{/* User info */}
				<div className="p-4 flex items-center">
					<UserButton afterSignOutUrl="/" />
					<span className="ml-3 text-sm">John Doe</span>
				</div>

				{/* Navigation */}
				<nav className="flex-1">
					<div className="px-2">
						<Link
							href="/admin"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<Home className="w-5 h-5 mr-3" />
							<span className="text-sm">Dashboard</span>
						</Link>
						<Link
							href="/admin/borrowers"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<Users className="w-5 h-5 mr-3" />
							<span className="text-sm">Borrowers</span>
						</Link>
						<Link
							href="/admin/loans"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<CreditCard className="w-5 h-5 mr-3" />
							<span className="text-sm">Loans</span>
						</Link>
						<Link
							href="/admin/repayments"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<DollarSign className="w-5 h-5 mr-3" />
							<span className="text-sm">Repayments</span>
						</Link>
						<Link
							href="/admin/loan-parameters"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<Calculator className="w-5 h-5 mr-3" />
							<span className="text-sm">Loan Parameters</span>
						</Link>
						<Link
							href="/admin/accounting"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<Calculator className="w-5 h-5 mr-3" />
							<span className="text-sm">Accounting</span>
						</Link>
						<Link
							href="/admin/reports"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<BarChart4 className="w-5 h-5 mr-3" />
							<span className="text-sm">Reports</span>
						</Link>
						<Link
							href="/admin/collateral"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<LineChart className="w-5 h-5 mr-3" />
							<span className="text-sm">Collateral</span>
						</Link>
						<Link
							href="/admin/configuration"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<Settings className="w-5 h-5 mr-3" />
							<span className="text-sm">
								Access Configuration
							</span>
						</Link>
						<Link
							href="/admin/savings"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<DollarSign className="w-5 h-5 mr-3" />
							<span className="text-sm">Savings</span>
						</Link>
						<Link
							href="/admin/other-incomes"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<DollarSign className="w-5 h-5 mr-3" />
							<span className="text-sm">Other Incomes</span>
						</Link>
						<Link
							href="/admin/payroll"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<DollarSign className="w-5 h-5 mr-3" />
							<span className="text-sm">Payroll</span>
						</Link>
						<Link
							href="/admin/expenses"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<Calculator className="w-5 h-5 mr-3" />
							<span className="text-sm">Expenses</span>
						</Link>
						<Link
							href="/admin/e-signature"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<LineChart className="w-5 h-5 mr-3" />
							<span className="text-sm">E-signature</span>
						</Link>
						<Link
							href="/admin/investor-accounts"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<Users className="w-5 h-5 mr-3" />
							<span className="text-sm">Investor Accounts</span>
						</Link>
						<Link
							href="/admin/calendar"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<Calculator className="w-5 h-5 mr-3" />
							<span className="text-sm">Calendar</span>
						</Link>
						<Link
							href="/admin/settings"
							className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
							<Settings className="w-5 h-5 mr-3" />
							<span className="text-sm">Settings</span>
						</Link>
					</div>
				</nav>

				<div className="p-4">
					<Link
						href="/"
						className="flex items-center h-10 px-2 rounded text-white hover:bg-[#072812]">
						<LogOut className="w-5 h-5 mr-3" />
						<span className="text-sm">Sign Out</span>
					</Link>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1">
				{/* Header */}
				<header className="h-14 bg-white border-b border-[#dfe0eb] px-6 flex items-center justify-between">
					<h1 className="text-lg font-semibold text-[#252733]">
						ADMIN - DASHBOARD
					</h1>

					<div className="flex items-center space-x-4">
						<button className="text-[#7c7c7c]">
							<BellIcon className="w-5 h-5" />
						</button>
						<button className="text-[#7c7c7c]">
							<MessageCircle className="w-5 h-5" />
						</button>
						<div className="px-2 py-1 rounded-full bg-[#e0e0e0] text-xs text-[#6b9908]">
							Admin
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="p-6">{children}</main>
			</div>
		</div>
	);
}
