"use client";

import { Button } from "@/components/ui/button";
import { getApiBaseUrl } from "@/utils/api-service"; // Added import
import {
	SignInButton,
	SignedIn,
	SignedOut,
	UserButton,
	useAuth,
} from "@clerk/nextjs";
import { CreditCard, DollarSign, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
	const router = useRouter();
	const { getToken, isSignedIn } = useAuth();
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const checkUser = async () => {
			setIsLoading(true);
			try {
				// Outer try for the whole async operation
				const token = await getToken();
				if (!token) {
					// setIsLoading(false) will be called in finally, isAdmin defaults to false
					return;
				}

				const response = await fetch(
					`${getApiBaseUrl()}/api/auth/verify`, // Assuming this is now the correct endpoint
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				const responseText = await response.text();

				try {
					// Inner try for JSON parsing and subsequent logic
					const data = JSON.parse(responseText);
					if (response.ok) {
						setIsAdmin(!!data.isAdmin);
						if (data.isAdmin) {
							console.log("User is admin, can access /admin");
						} else {
							console.log(
								"User is not an admin, cannot access /admin"
							);
						}
					} else {
						console.log(
							"❌ Verification failed:",
							response.status,
							responseText
						);
						setIsAdmin(false);
					}
				} catch (parseError) {
					// Catch JSON.parse errors or sync errors in the inner block
					console.error(
						"🚨 Error processing response:",
						parseError,
						"Response text:",
						responseText
					);
					setIsAdmin(false);
				}
			} catch (fetchError) {
				// Catch errors from getToken(), fetch() itself, or response.text()
				console.error(
					"🚨 Network or fetch operation error:",
					fetchError
				);
				setIsAdmin(false); // Assume not admin on any fetch-related error
			} finally {
				setIsLoading(false); // Ensure loading is always set to false
			}
		};

		if (isSignedIn) {
			checkUser();
		} else {
			setIsLoading(false); // Initial state if not signed in
		}
	}, [isSignedIn, getToken]);

	return (
		<div className="min-h-screen bg-[#efefef]">
			{/* Header Bar */}
			<header className="h-16 bg-[#0c3e19] text-white flex items-center px-6 justify-between">
				<div className="text-xl font-bold">CREDIT SEA</div>

				<div className="flex items-center space-x-4">
					<SignedIn>
						<UserButton afterSignOutUrl="/" />
					</SignedIn>
				</div>
			</header>

			<main className="container mx-auto px-6 py-10 max-w-5xl">
				{/* Welcome Section */}
				<div className="bg-white rounded-lg shadow-md p-8 mb-8">
					<h1 className="text-3xl font-bold mb-4 text-[#0c3e19]">
						Welcome to CreditSea
					</h1>
					<p className="text-gray-600 mb-6">
						Your complete loan management solution for efficient
						financial tracking and management.
					</p>

					<SignedOut>
						<div className="bg-[#f5f5f5] rounded-lg p-8 flex flex-col items-center justify-center">
							<h2 className="text-xl font-semibold mb-4 text-[#0c3e19]">
								Sign in to get started
							</h2>
							<p className="text-gray-500 mb-6 text-center max-w-md">
								Access your dashboard to manage loans, track
								payments, and more.
							</p>
							<SignInButton mode="modal">
								<Button
									variant="default"
									size="lg"
									className="bg-[#0c3e19] hover:bg-[#072812]">
									Sign In
								</Button>
							</SignInButton>
						</div>
					</SignedOut>

					<SignedIn>
						<div className="bg-[#f5f5f5] rounded-lg p-8">
							<div className="flex items-center mb-4">
								{isAdmin && !isLoading && (
									<span className="px-3 py-1 rounded-full text-sm font-medium bg-[#e0e0e0] text-[#6b9908] mr-3">
										Admin Access
									</span>
								)}
							</div>

							{isLoading ? (
								<div className="flex items-center justify-center py-10">
									<div className="w-8 h-8 border-4 border-t-[#0a512f] border-[#f3f3f3] rounded-full animate-spin mr-3"></div>
									<span className="text-gray-600">
										Checking permissions...
									</span>
								</div>
							) : (
								<div>
									<h2 className="text-xl font-semibold mb-6 text-[#0c3e19]">
										{isAdmin
											? "Administrator Dashboard Access"
											: "User Dashboard Access"}
									</h2>

									<div className="flex flex-col sm:flex-row gap-4">
										{isAdmin ? (
											<>
												<Button
													onClick={() =>
														router.push("/admin")
													}
													size="lg"
													className="bg-[#0c3e19] hover:bg-[#072812] text-white">
													Go to Admin Dashboard
												</Button>
												{/* <Button
													onClick={() =>
														router.push(
															"/dashboard"
														)
													}
													variant="outline"
													size="lg"
													className="border-[#0c3e19] text-[#0c3e19]">
													Go to User Dashboard
												</Button> */}
											</>
										) : (
											<Button
												onClick={() =>
													router.push("/dashboard")
												}
												size="lg"
												className="bg-[#0c3e19] hover:bg-[#072812] text-white">
												Go to Dashboard
											</Button>
										)}
									</div>
								</div>
							)}
						</div>
					</SignedIn>
				</div>

				{/* Features Section */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white p-6 rounded-lg shadow-md">
						<div className="w-12 h-12 bg-[#e0f2e9] rounded-full flex items-center justify-center mb-4">
							<CreditCard className="h-6 w-6 text-[#0c3e19]" />
						</div>
						<h3 className="text-lg font-medium mb-2">
							Loan Management
						</h3>
						<p className="text-gray-600">
							Efficiently manage all your loans in one place.
						</p>
					</div>
					<div className="bg-white p-6 rounded-lg shadow-md">
						<div className="w-12 h-12 bg-[#e0f2e9] rounded-full flex items-center justify-center mb-4">
							<DollarSign className="h-6 w-6 text-[#0c3e19]" />
						</div>
						<h3 className="text-lg font-medium mb-2">
							Payment Tracking
						</h3>
						<p className="text-gray-600">
							Track payments and get real-time financial insights.
						</p>
					</div>
					<div className="bg-white p-6 rounded-lg shadow-md">
						<div className="w-12 h-12 bg-[#e0f2e9] rounded-full flex items-center justify-center mb-4">
							<MessageCircle className="h-6 w-6 text-[#0c3e19]" />
						</div>
						<h3 className="text-lg font-medium mb-2">
							Customer Support
						</h3>
						<p className="text-gray-600">
							Get help whenever you need it from our support team.
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
