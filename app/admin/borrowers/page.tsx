"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, Search, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";

// Types
interface User {
	id: string;
	clerkId: string;
	email: string;
	name: string;
	isAdmin: boolean;
}

interface PaginationData {
	total: number;
	page: number;
	pages: number;
	limit: number;
}

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState<PaginationData>({
		total: 0,
		page: 1,
		pages: 1,
		limit: 10,
	});
	const [searchTerm, setSearchTerm] = useState("");
	const { getToken, isLoaded } = useAuth();

	useEffect(() => {
		async function fetchUsers() {
			if (!isLoaded) return;

			try {
				setIsLoading(true);				const token = await getToken();
				const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
				const response = await fetch(
					`${apiUrl}/api/admin/users?page=${pagination.page}&limit=${pagination.limit}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error(
						`Failed to fetch users: ${response.status}`
					);
				}

				const data = await response.json();
				setUsers(data.data);
				setPagination(data.pagination);
			} catch (err) {
				console.error("Error fetching users:", err);
				setError("Failed to load users. Please try again later.");
			} finally {
				setIsLoading(false);
			}
		}

		fetchUsers();
	}, [getToken, isLoaded, pagination.page, pagination.limit]);

	// Filtered users (for search)
	const filteredUsers = users.filter(
		(user) =>
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[80vh]">
				<div className="w-16 h-16 border-4 border-t-[#0a512f] border-[#f3f3f3] rounded-full animate-spin"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Users</h1>

				<div className="flex space-x-2">
					<div className="relative">
						<Input
							type="text"
							placeholder="Search users..."
							className="pl-10"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
					</div>
				</div>
			</div>

			{error && (
				<div className="bg-red-50 p-4 rounded-lg text-center">
					<h2 className="text-red-800 text-lg font-medium">Error</h2>
					<p className="text-red-600">{error}</p>
				</div>
			)}

			<Card className="bg-white shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
							<tr>
								<th className="px-6 py-3 text-left">User</th>
								<th className="px-6 py-3 text-left">Email</th>
								<th className="px-6 py-3 text-left">ID</th>
								<th className="px-6 py-3 text-left">Role</th>
								<th className="px-6 py-3 text-left">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{filteredUsers.length > 0 ? (
								filteredUsers.map((user) => (
									<tr key={user.id}>
										<td className="px-6 py-4 whitespace-nowrap">
											{user.name}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{user.email}
										</td>
										<td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
											{user.id}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{user.isAdmin ? (
												<div className="flex items-center text-purple-700">
													<Shield className="h-4 w-4 mr-1" />
													<span>Admin</span>
												</div>
											) : (
												<div className="flex items-center text-blue-700">
													<Users className="h-4 w-4 mr-1" />
													<span>User</span>
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-4">
												<Button
													variant="outline"
													size="sm"
													className="text-sm"
													asChild>
													<a
														href={`/admin/users/${user.id}`}>
														View Profile
													</a>
												</Button>

												<Button
													variant="outline"
													size="sm"
													className="text-sm"
													asChild>
													<a
														href={`/admin/loans?userId=${user.id}`}>
														View Loans
													</a>
												</Button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-4 text-center text-gray-500">
										No users found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
					<div className="text-sm text-gray-500">
						Showing {filteredUsers.length} of {pagination.total}{" "}
						users
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
