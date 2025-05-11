"use client";

import { Button } from "@/components/ui/button";
import {
	SignInButton,
	SignedIn,
	SignedOut,
	UserButton,
	useAuth,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
	const router = useRouter();
	const { getToken, isSignedIn } = useAuth();

	useEffect(() => {
		const checkUser = async () => {
			const token = await getToken();

			if (!token) {
				console.log("No token found. User may not be signed in.");
				return;
			}

			try {
				console.log("Sending verification request to backend...");
				const response = await fetch(
					"http://localhost:5000/api/auth/verify",
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);

				console.log("Response status:", response.status);

				// Get the raw text first to debug the response
				const responseText = await response.text();
				console.log("Response body:", responseText);

				// Only try to parse as JSON if it looks like valid JSON
				if (response.ok && responseText.trim()) {
					try {
						const data = JSON.parse(responseText);
						console.log("✅ User verified:", data);

						// Check if user is admin and redirect accordingly
						if (data.isAdmin) {
							console.log("User is admin, can access /admin");
						}
					} catch (jsonError) {
						console.error(
							"Failed to parse response as JSON:",
							jsonError
						);
					}
				} else {
					console.log(
						"❌ Verification failed:",
						response.status,
						responseText
					);
				}
			} catch (err) {
				console.error("🚨 Request error:", err);
			}
		};

		if (isSignedIn) {
			checkUser();
		}
	}, [isSignedIn, getToken]);

	return (
		<main className="p-10">
			<h1 className="text-3xl font-bold mb-4">Welcome to CreditSea</h1>
			<SignedOut>
				<SignInButton mode="modal" />
			</SignedOut>
			<SignedIn>
				<div className="flex flex-col items-start">
					<UserButton afterSignOutUrl="/" />
					<div className="flex gap-2 mt-4">
						<Button
							onClick={() => router.push("/dashboard")}
							className="px-4 py-2 bg-blue-600 text-white rounded">
							Go to Dashboard
						</Button>
						<Button
							onClick={() => router.push("/admin")}
							className="px-4 py-2 bg-green-600 text-white rounded">
							Go to Admin Dashboard
						</Button>
					</div>
				</div>
			</SignedIn>
		</main>
	);
}
