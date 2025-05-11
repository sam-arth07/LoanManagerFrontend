"use client";

import UserLoansTable from "@/components/UserLoansTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BellIcon,
	CreditCard,
	DollarSign,
	Home,
	MessageCircle,
	Send,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-[#efefef]">
			{/* Header/Navigation */}
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
				</div>

				<div className="flex items-center space-x-4">
					<BellIcon className="h-5 w-5 text-[#7c7c7c]" />
					<MessageCircle className="h-5 w-5 text-[#0a512f]" />
					<Avatar className="h-8 w-8">
						<AvatarImage
							src="/placeholder.svg?height=32&width=32"
							alt="User"
						/>
						<AvatarFallback className="bg-[#0a512f] text-white">
							U
						</AvatarFallback>
					</Avatar>
					<div className="flex items-center">
						<span className="text-[#7c7c7c] mr-1">User</span>
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg">
							<path
								d="M6 9L12 15L18 9"
								stroke="#7c7c7c"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-5xl mx-auto py-8 px-4">
				{/* Deficit Display and Loan Button */}
				<div className="flex justify-between items-center mb-8">
					<div className="flex items-start">
						<div className="bg-[#6b9908] p-3 mr-3">
							<DollarSign className="h-6 w-6 text-white" />
						</div>{" "}
						<div>
							<div className="text-xs text-[#696969] uppercase">
								DEFICIT
							</div>
							<div className="flex items-center">
								<span className="text-[#696969] mr-1">₦</span>
								<span className="text-4xl font-medium text-[#6b9908]">
									0.0
								</span>
							</div>
						</div>
					</div>{" "}
					<Button
						className="bg-[#0a512f] hover:bg-[#064921] text-white rounded-md px-6"
						onClick={() => router.push("/dashboard/loan")}>
						Get A Loan
					</Button>
				</div>
				{/* Tabs */}
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

				{/* User Loans Table Component - with built-in search, sort, and filter */}
				<UserLoansTable />
			</main>
		</div>
	);
}
