"use client";

import { useToast } from "@/hooks/use-toast"; // Added useToast
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import {
	ArrowDownAZ,
	ArrowUpAZ,
	ArrowUpDown,
	Calendar,
	CreditCard,
	Filter,
	Search,
	Trash2, // Added Trash2 icon
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	AlertDialog, // Added AlertDialog components
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

export type Loan = {
	// Export Loan type
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

type SortField = "loanAmount" | "appliedAt" | "duration" | "status";
type SortOrder = "asc" | "desc"; // Ensure SortOrder is defined

interface UserLoansTableProps {
	loans?: Loan[];
	isLoading?: boolean;
	error?: string | null;
}

export default function UserLoansTable({
	loans: initialLoans,
	isLoading: initialIsLoading,
	error: initialError,
}: UserLoansTableProps) {
	const [loans, setLoans] = useState<Loan[]>(initialLoans || []);
	const [filteredLoans, setFilteredLoans] = useState<Loan[]>(
		initialLoans || []
	);
	const [isLoading, setIsLoading] = useState(
		initialIsLoading !== undefined ? initialIsLoading : true
	);
	const [error, setError] = useState<string | null>(
		initialError === undefined ? null : initialError
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortField, setSortField] = useState<SortField>("appliedAt");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);
	const [minAmount, setMinAmount] = useState("");
	const [maxAmount, setMaxAmount] = useState("");
	const [dateRange, setDateRange] = useState("");
	const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null); // State for loan to delete
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete dialog

	const { getToken } = useAuth();
	const { toast } = useToast(); // Initialize useToast

	// Fetch loans data only if not provided via props
	useEffect(() => {
		async function fetchLoans() {
			try {
				setIsLoading(true);
				const token = await getToken();

				if (!token) {
					setError("Authentication required");
					return;
				}

				try {
					const response = await axios.get(
						"http://localhost:5000/api/loan/my-loans",
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
							timeout: 5000, // 5 seconds timeout
						}
					);

					setLoans(response.data);
					setFilteredLoans(response.data);
					setError(null);
				} catch (apiError) {
					console.warn("Using demo data due to API error:", apiError);
					// Use demo data for presentation
					const demoLoans: Loan[] = [
						{
							id: "1",
							fullName: "John Smith",
							loanAmount: 50000,
							purpose: "Home Renovation",
							duration: 12,
							status: "pending" as "pending",
							appliedAt: new Date().toISOString(),
							employmentStatus: "Employed",
							employmentAddress: "123 Work Street, City",
						},
						{
							id: "2",
							fullName: "John Smith",
							loanAmount: 25000,
							purpose: "Education",
							duration: 24,
							status: "approved" as "approved",
							appliedAt: new Date(
								Date.now() - 7 * 24 * 60 * 60 * 1000
							).toISOString(),
							employmentStatus: "Employed",
							employmentAddress: "123 Work Street, City",
						},
						{
							id: "3",
							fullName: "John Smith",
							loanAmount: 10000,
							purpose: "Business",
							duration: 6,
							status: "rejected" as "rejected",
							appliedAt: new Date(
								Date.now() - 30 * 24 * 60 * 60 * 1000
							).toISOString(),
							employmentStatus: "Self-Employed",
							employmentAddress: "456 Business Ave, City",
						},
						{
							id: "4",
							fullName: "John Smith",
							loanAmount: 75000,
							purpose: "Car Purchase",
							duration: 36,
							status: "verified" as "verified",
							appliedAt: new Date(
								Date.now() - 14 * 24 * 60 * 60 * 1000
							).toISOString(),
							employmentStatus: "Employed",
							employmentAddress: "123 Work Street, City",
						},
					];

					setLoans(demoLoans);
					setFilteredLoans(demoLoans);
				}
			} catch (err) {
				console.error("Error fetching loans:", err);
				setError("Failed to fetch loan applications");
			} finally {
				setIsLoading(false);
			}
		}

		if (initialLoans === undefined) {
			// Only fetch if loans are not passed as a prop
			fetchLoans();
		}
	}, [getToken, initialLoans]); // Depend on initialLoans to prevent re-fetch if props are already there

	// Update local state if props change
	useEffect(() => {
		if (initialLoans !== undefined) {
			setLoans(initialLoans);
			setFilteredLoans(initialLoans); // Also update filteredLoans when props change
		}
	}, [initialLoans]);

	useEffect(() => {
		if (initialIsLoading !== undefined) {
			setIsLoading(initialIsLoading);
		}
	}, [initialIsLoading]);

	useEffect(() => {
		if (initialError !== undefined) {
			setError(initialError);
		}
	}, [initialError]);

	// Apply sorting and filtering whenever relevant state changes
	useEffect(() => {
		let result = [...loans];

		// Apply status filter
		if (statusFilter !== "all") {
			result = result.filter((loan) => loan.status === statusFilter);
		}

		// Apply search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(loan) =>
					loan.purpose.toLowerCase().includes(query) ||
					loan.fullName.toLowerCase().includes(query) ||
					loan.loanAmount.toString().includes(query)
			);
		}

		// Apply amount filter
		if (minAmount) {
			const min = parseFloat(minAmount);
			result = result.filter((loan) => loan.loanAmount >= min);
		}

		if (maxAmount) {
			const max = parseFloat(maxAmount);
			result = result.filter((loan) => loan.loanAmount <= max);
		}
		// Apply date filter (simple implementation for demo)
		if (dateRange === "last7days") {
			const cutoff = new Date();
			cutoff.setDate(cutoff.getDate() - 7);
			result = result.filter(
				(loan) => new Date(loan.appliedAt) >= cutoff
			);
		} else if (dateRange === "last30days") {
			const cutoff = new Date();
			cutoff.setDate(cutoff.getDate() - 30);
			result = result.filter(
				(loan) => new Date(loan.appliedAt) >= cutoff
			);
		} else if (dateRange === "last90days") {
			const cutoff = new Date();
			cutoff.setDate(cutoff.getDate() - 90);
			result = result.filter(
				(loan) => new Date(loan.appliedAt) >= cutoff
			);
		}
		// all_time doesn't need any filtering

		// Apply sorting
		result.sort((a, b) => {
			if (sortField === "loanAmount") {
				return sortOrder === "asc"
					? a.loanAmount - b.loanAmount
					: b.loanAmount - a.loanAmount;
			} else if (sortField === "duration") {
				return sortOrder === "asc"
					? a.duration - b.duration
					: b.duration - a.duration;
			} else if (sortField === "appliedAt") {
				return sortOrder === "asc"
					? new Date(a.appliedAt).getTime() -
							new Date(b.appliedAt).getTime()
					: new Date(b.appliedAt).getTime() -
							new Date(a.appliedAt).getTime();
			} else if (sortField === "status") {
				return sortOrder === "asc"
					? a.status.localeCompare(b.status)
					: b.status.localeCompare(a.status);
			}
			return 0;
		});

		setFilteredLoans(result);
	}, [
		loans, // Ensure this useEffect runs when 'loans' state is updated after deletion
		sortField,
		sortOrder,
		statusFilter,
		searchQuery,
		minAmount,
		maxAmount,
		dateRange,
	]);

	// Sort toggle handler
	const handleToggleSort = (field: SortField) => {
		if (sortField === field) {
			// Toggle order if already sorting by this field
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			// Set new field and default to ascending
			setSortField(field);
			setSortOrder("asc");
		}
	};

	// Get the appropriate status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-500";
			case "approved":
				return "bg-blue-600";
			case "verified":
				return "bg-green-500";
			case "rejected":
				return "bg-red-600";
			default:
				return "bg-gray-500";
		}
	};
	// Reset filters
	const resetFilters = () => {
		setStatusFilter("all");
		setMinAmount("");
		setMaxAmount("");
		setDateRange(""); // This will trigger the placeholder to show
		setSearchQuery("");
		setFilterDialogOpen(false);
	};

	// Apply filters
	const applyFilters = () => {
		setFilterDialogOpen(false);
	};

	// Handle loan deletion
	const handleConfirmDelete = async () => {
		if (!loanToDelete) return;

		try {
			const token = await getToken();
			if (!token) {
				toast({
					title: "Error",
					description: "Authentication required.",
					variant: "destructive",
				});
				return;
			}

			await axios.delete(
				`http://localhost:5000/api/loan/${loanToDelete.id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setLoans((prevLoans) =>
				prevLoans.filter((loan) => loan.id !== loanToDelete.id)
			);
			toast({
				title: "Success",
				description: "Loan application deleted successfully.",
			});
		} catch (err: any) {
			console.error("Error deleting loan:", err);
			toast({
				title: "Error",
				description:
					err.response?.data?.message ||
					"Failed to delete loan application.",
				variant: "destructive",
			});
		} finally {
			setIsDeleteDialogOpen(false);
			setLoanToDelete(null);
		}
	};

	if (isLoading) {
		return (
			<Card className="border-[#dfe0eb] shadow-sm mb-4 p-6">
				<div className="text-center py-8">
					Loading loan applications...
				</div>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="border-[#dfe0eb] shadow-sm mb-4 p-6 bg-red-50">
				<div className="text-center py-8 text-red-600">{error}</div>
			</Card>
		);
	}

	return (
		<Card className="border-[#dfe0eb] shadow-sm mb-4">
			<div className="p-6">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold">
						Your Loan Applications
					</h2>
					<div className="flex space-x-4">
						{/* Sort Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="text-[#7c7c7c] border-[#dfe0eb]">
									<ArrowUpDown className="h-4 w-4 mr-2" />
									Sort
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem
									onClick={() =>
										handleToggleSort("loanAmount")
									}>
									{sortField === "loanAmount" ? (
										sortOrder === "asc" ? (
											<ArrowUpAZ className="mr-2 h-4 w-4" />
										) : (
											<ArrowDownAZ className="mr-2 h-4 w-4" />
										)
									) : (
										<CreditCard className="mr-2 h-4 w-4" />
									)}
									Amount
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleToggleSort("appliedAt")
									}>
									{sortField === "appliedAt" ? (
										sortOrder === "asc" ? (
											<ArrowUpAZ className="mr-2 h-4 w-4" />
										) : (
											<ArrowDownAZ className="mr-2 h-4 w-4" />
										)
									) : (
										<Calendar className="mr-2 h-4 w-4" />
									)}
									Date
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleToggleSort("duration")
									}>
									{sortField === "duration" ? (
										sortOrder === "asc" ? (
											<ArrowUpAZ className="mr-2 h-4 w-4" />
										) : (
											<ArrowDownAZ className="mr-2 h-4 w-4" />
										)
									) : (
										<ArrowUpDown className="mr-2 h-4 w-4" />
									)}
									Duration
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleToggleSort("status")}>
									{sortField === "status" ? (
										sortOrder === "asc" ? (
											<ArrowUpAZ className="mr-2 h-4 w-4" />
										) : (
											<ArrowDownAZ className="mr-2 h-4 w-4" />
										)
									) : (
										<ArrowUpDown className="mr-2 h-4 w-4" />
									)}
									Status
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Filter Dialog */}
						<Dialog
							open={filterDialogOpen}
							onOpenChange={setFilterDialogOpen}>
							<DialogTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="text-[#7c7c7c] border-[#dfe0eb]">
									<Filter className="h-4 w-4 mr-2" />
									Filter
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Filter Loans</DialogTitle>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<Label htmlFor="status">
											Loan Status
										</Label>
										<Select
											value={statusFilter}
											onValueChange={setStatusFilter}>
											<SelectTrigger>
												<SelectValue placeholder="All Statuses" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">
													All Statuses
												</SelectItem>
												<SelectItem value="pending">
													Pending
												</SelectItem>
												<SelectItem value="approved">
													Approved
												</SelectItem>
												<SelectItem value="verified">
													Verified
												</SelectItem>
												<SelectItem value="rejected">
													Rejected
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="minAmount">
												Minimum Amount
											</Label>
											<Input
												id="minAmount"
												type="number"
												placeholder="Min Amount"
												value={minAmount}
												onChange={(e) =>
													setMinAmount(e.target.value)
												}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="maxAmount">
												Maximum Amount
											</Label>
											<Input
												id="maxAmount"
												type="number"
												placeholder="Max Amount"
												value={maxAmount}
												onChange={(e) =>
													setMaxAmount(e.target.value)
												}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="dateRange">
											Date Range
										</Label>
										<Select
											value={dateRange}
											onValueChange={setDateRange}>
											<SelectTrigger>
												<SelectValue placeholder="All Time" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all_time">
													All Time
												</SelectItem>
												<SelectItem value="last7days">
													Last 7 Days
												</SelectItem>
												<SelectItem value="last30days">
													Last 30 Days
												</SelectItem>
												<SelectItem value="last90days">
													Last 90 Days
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex justify-between pt-4">
										<Button
											variant="outline"
											onClick={resetFilters}>
											Reset
										</Button>
										<Button onClick={applyFilters}>
											Apply Filters
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				{/* Search Bar */}
				<div className="relative mb-4">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#7c7c7c]" />
					<Input
						placeholder="Search loans by purpose, amount, or name..."
						className="pl-10 py-2 bg-white border-[#dfe0eb] rounded-md mb-4"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery("")}
							className="absolute right-3 top-1/2 transform -translate-y-1/2">
							<X className="h-4 w-4 text-[#7c7c7c]" />
						</button>
					)}
				</div>

				{/* Active Filters Display */}
				{(statusFilter !== "all" ||
					minAmount ||
					maxAmount ||
					dateRange) && (
					<div className="flex flex-wrap gap-2 mb-4">
						{statusFilter !== "all" && (
							<div className="bg-gray-100 text-sm rounded-full px-3 py-1 flex items-center">
								Status: {statusFilter}
								<button
									onClick={() => setStatusFilter("all")}
									className="ml-2">
									<X className="h-3 w-3" />
								</button>
							</div>
						)}
						{minAmount && (
							<div className="bg-gray-100 text-sm rounded-full px-3 py-1 flex items-center">
								Min: ₹{minAmount}
								<button
									onClick={() => setMinAmount("")}
									className="ml-2">
									<X className="h-3 w-3" />
								</button>
							</div>
						)}
						{maxAmount && (
							<div className="bg-gray-100 text-sm rounded-full px-3 py-1 flex items-center">
								Max: ₹{maxAmount}
								<button
									onClick={() => setMaxAmount("")}
									className="ml-2">
									<X className="h-3 w-3" />
								</button>
							</div>
						)}{" "}
						{dateRange && (
							<div className="bg-gray-100 text-sm rounded-full px-3 py-1 flex items-center">
								{dateRange === "last7days"
									? "Last 7 Days"
									: dateRange === "last30days"
									? "Last 30 Days"
									: dateRange === "last90days"
									? "Last 90 Days"
									: "All Time"}
								<button
									onClick={() => setDateRange("")}
									className="ml-2">
									<X className="h-3 w-3" />
								</button>
							</div>
						)}
						<button
							onClick={resetFilters}
							className="text-sm text-blue-600 hover:text-blue-800">
							Clear All
						</button>
					</div>
				)}

				{/* Table Header */}
				<div className="grid grid-cols-5 border-b border-[#dfe0eb] pb-3 text-[#9fa2b4] text-sm">
					<div>Loan Details</div>
					<div>Amount</div>
					<div>Duration</div>
					<div>Date Applied</div>
					<div>Status</div>
				</div>

				{/* Table Rows */}
				{filteredLoans.length === 0 ? (
					<div className="py-8 text-center text-gray-500">
						No loan applications match your criteria
					</div>
				) : (
					<div className="divide-y divide-[#dfe0eb]">
						{filteredLoans.map((loan) => (
							<div
								key={loan.id}
								className="grid grid-cols-5 py-4 items-center">
								<div className="flex items-center">
									<Avatar className="h-8 w-8 mr-3">
										<AvatarImage
											src="/placeholder-user.jpg"
											alt={loan.fullName}
										/>
										<AvatarFallback className="bg-[#4b506d] text-white">
											{loan.fullName
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium">
											{loan.fullName}
										</div>
										<div className="text-xs text-[#c5c7cd]">
											{loan.purpose}
										</div>
									</div>
								</div>
								<div>
									<div>
										₹{loan.loanAmount.toLocaleString()}
									</div>
									<div className="text-xs text-[#c5c7cd]">
										{loan.employmentStatus || "Employee"}
									</div>
								</div>
								<div>
									<div>{loan.duration} months</div>
									<div className="text-xs text-[#c5c7cd]">
										Term
									</div>
								</div>
								<div>
									<div>
										{new Date(
											loan.appliedAt
										).toLocaleDateString()}
									</div>
									<div className="text-xs text-[#c5c7cd]">
										{new Date(
											loan.appliedAt
										).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
								</div>
								<div className="flex items-center justify-between">
									<span
										className={`${getStatusColor(
											loan.status
										)} text-white px-3 py-1 rounded-full text-xs`}>
										{loan.status.toUpperCase()}
									</span>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="text-[#c5c7cd] hover:text-gray-700">
												<svg
													width="4"
													height="16"
													viewBox="0 0 4 16"
													fill="none"
													xmlns="http://www.w3.org/2000/svg">
													<circle
														cx="2"
														cy="2"
														r="2"
														fill="currentColor"
													/>
													<circle
														cx="2"
														cy="8"
														r="2"
														fill="currentColor"
													/>
													<circle
														cx="2"
														cy="14"
														r="2"
														fill="currentColor"
													/>
												</svg>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() => {
													setLoanToDelete(loan);
													setIsDeleteDialogOpen(true);
												}}
												className="text-red-600 hover:!text-red-600 hover:!bg-red-50">
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination */}
				{filteredLoans.length > 0 && (
					<div className="flex justify-between items-center mt-6 text-sm text-[#9fa2b4]">
						<div className="flex items-center">
							<span>Rows per page:</span>
							<select className="ml-2 bg-transparent border-none focus:outline-none">
								<option>7</option>
								<option>10</option>
								<option>20</option>
							</select>
						</div>
						<div className="flex items-center">
							<span>
								1-{filteredLoans.length} of{" "}
								{filteredLoans.length}
							</span>
							<div className="flex ml-4">
								<button className="p-1 text-[#9fa2b4]">
									<svg
										width="8"
										height="12"
										viewBox="0 0 8 12"
										fill="none"
										xmlns="http://www.w3.org/2000/svg">
										<path
											d="M7 1L1 6L7 11"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
								<button className="p-1 ml-2 text-[#9fa2b4]">
									<svg
										width="8"
										height="12"
										viewBox="0 0 8 12"
										fill="none"
										xmlns="http://www.w3.org/2000/svg">
										<path
											d="M1 1L7 6L1 11"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to delete this loan
							application?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently
							delete the loan application for "
							{loanToDelete?.purpose}" amounting to ₹
							{loanToDelete?.loanAmount.toLocaleString()}.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => setLoanToDelete(null)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDelete}
							className="bg-red-600 hover:bg-red-700">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	);
}
