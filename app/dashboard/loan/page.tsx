"use client";

import LoanForm from "@/components/LoanForm";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoanApplicationPage() {
	const { userId } = useAuth();
	const router = useRouter();

	return (
		<div className="min-h-screen bg-[#efefef] p-6">
			<div className="max-w-5xl mx-auto">
				<button
					onClick={() => router.back()}
					className="flex items-center text-[#0a512f] font-medium mb-6">
					<ArrowLeft className="mr-2 h-5 w-5" />
					<span>Back to Dashboard</span>
				</button>

				<div className="bg-white rounded-lg shadow-sm p-6">
					{userId ? (
						<LoanForm userId={userId} />
					) : (
						<div className="text-center py-8">
							<p className="text-red-500">
								Please sign in to apply for a loan
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
