import { getApiBaseUrl } from "@/utils/api-service"; // Added import
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Use clerkMiddleware and pass a callback function that has our custom logic
export default clerkMiddleware(async (auth, req) => {
	// If it's not an admin route, allow the request
	if (!req.nextUrl.pathname.startsWith("/admin")) {
		return NextResponse.next();
	}

	// Get authentication state from the auth object
	// In Clerk v6, auth() returns a Promise that resolves to the auth object
	const authObj = await auth();

	// Check if user is signed in
	if (!authObj.userId) {
		// const signInUrl = new URL("/sign-in", req.url);
		// signInUrl.searchParams.set("redirect_url", req.url);
		return NextResponse.redirect(new URL("/", req.url));
	}

	try {
		// Get the token for API verification
		const token = await authObj.getToken();

		if (!token) {
			// console.error("No token available for authenticated user");
			return NextResponse.redirect(new URL("/dashboard", req.url));
		}

		const verifyResponse = await fetch(
			`${getApiBaseUrl()}/api/auth/verify`, // Changed
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!verifyResponse.ok) {
			// console.error(
			// 	`Admin verification failed with status: ${verifyResponse.status}`
			// );
			return NextResponse.redirect(new URL("/dashboard", req.url));
		}

		const verifyData = await verifyResponse.json();
		// console.log("Admin verification response:", verifyData);

		if (!verifyData.isAdmin) {
			// console.log("User is not an admin, redirecting to dashboard");
			return NextResponse.redirect(new URL("/dashboard", req.url));
		}

		// console.log("Admin access granted to:", authObj.userId);
		return NextResponse.next();
	} catch (error) {
		console.error("Error in admin verification middleware:", error);
		// For development, you might want to allow access despite errors
		if (process.env.NODE_ENV === "development") {
			console.warn(
				"DEVELOPMENT MODE: Allowing admin access despite error"
			);
			return NextResponse.next();
		}
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}
});

// Use Clerk's recommended matcher config
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!static|.*\\..*|_next|favicon.ico).*)",
		"/",
		"/(api|trpc)(.*)",
	],
};
