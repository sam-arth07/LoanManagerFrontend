"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { getApiBaseUrl } from "@/utils/api-service"; // Added import
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useState } from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

export default function LoanForm({ userId }: { userId: string }) {
	const { getToken } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [formStatus, setFormStatus] = useState<{
		type: "success" | "error" | null;
		message: string;
	}>({
		type: null,
		message: "",
	});
	const [form, setForm] = useState({
		fullName: "",
		loanAmount: "",
		duration: "",
		employmentStatus: "",
		employmentAddress1: "",
		employmentAddress2: "",
		purpose: "",
		termsAccepted: false,
		creditCheck: false,
	});

	// Calculate monthly payment using the formula for equal installment loans
	const calculateMonthlyPayment = (
		principal: number,
		months: number,
		interestRate = 0.12
	) => {
		// If inputs are invalid, return 0
		if (!principal || !months || principal <= 0 || months <= 0) return 0;

		// Monthly interest rate (annual rate divided by 12)
		const monthlyRate = interestRate / 12;

		// Calculate monthly payment using the formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
		// where P = principal, r = monthly interest rate, n = number of months
		const payment =
			(principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
			(Math.pow(1 + monthlyRate, months) - 1);

		return Math.round(payment * 100) / 100; // Round to 2 decimal places
	};

	// Generate payment schedule data
	const generatePaymentSchedule = () => {
		const loanAmount = parseFloat(form.loanAmount) || 0;
		const duration = parseInt(form.duration) || 0;

		// If inputs are invalid, return empty array
		if (loanAmount <= 0 || duration <= 0) return [];

		const monthlyPayment = calculateMonthlyPayment(loanAmount, duration);
		const interestRate = 0.12; // 12% annual interest rate
		const monthlyRate = interestRate / 12;

		let remainingBalance = loanAmount;
		const schedule = [];

		for (let month = 1; month <= duration; month++) {
			const interestPayment = remainingBalance * monthlyRate;
			const principalPayment = monthlyPayment - interestPayment;
			remainingBalance -= principalPayment;

			schedule.push({
				month,
				payment: monthlyPayment,
				principalPayment: Math.round(principalPayment * 100) / 100,
				interestPayment: Math.round(interestPayment * 100) / 100,
				remainingBalance: Math.max(
					0,
					Math.round(remainingBalance * 100) / 100
				),
			});
		}

		return schedule;
	};

	// Generate payment schedule based on current inputs
	const paymentSchedule = generatePaymentSchedule();
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.termsAccepted) {
			setFormStatus({
				type: "error",
				message: "Please accept the terms to proceed.",
			});
			return;
		}

		try {
			setIsLoading(true);
			setFormStatus({ type: null, message: "" });

			// Get token from Clerk
			const token = await getToken();

			if (!token) {
				setFormStatus({
					type: "error",
					message: "Authentication required. Please sign in again.",
				});
				return;
			}

			const response = await axios.post(
				`${getApiBaseUrl()}/api/loan/`, // Changed
				{
					userId,
					fullName: form.fullName,
					loanAmount: parseFloat(form.loanAmount),
					duration: parseInt(form.duration),
					employmentStatus: form.employmentStatus,
					employmentAddress:
						form.employmentAddress1 + " " + form.employmentAddress2,
					purpose: form.purpose,
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setFormStatus({
				type: "success",
				message: "Loan application submitted successfully!",
			});

			// Reset form after successful submission
			setForm({
				...form,
				loanAmount: "",
				duration: "",
				purpose: "",
				employmentStatus: "",
				employmentAddress1: "",
				employmentAddress2: "",
				termsAccepted: false,
			});
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response) {
					setFormStatus({
						type: "error",
						message: `Error ${error.response.status}: ${
							typeof error.response.data === "object"
								? JSON.stringify(error.response.data)
								: error.response.data
						}`,
					});
				} else if (error.request) {
					setFormStatus({
						type: "error",
						message:
							"Connection error: The server did not respond. Please check if the backend is running.",
					});
				} else {
					setFormStatus({
						type: "error",
						message: `Error: ${error.message}`,
					});
				}
			} else {
				setFormStatus({
					type: "error",
					message:
						"Failed to submit loan application. Please try again.",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6 text-center">
				APPLY FOR A LOAN
			</h1>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Left column */}
					<div className="space-y-4">
						<div>
							<label
								htmlFor="fullName"
								className="block text-sm font-medium mb-1">
								Full name as it appears on bank account
							</label>
							<input
								id="fullName"
								type="text"
								placeholder="Full name as it appears on bank account"
								value={form.fullName}
								onChange={(e) =>
									setForm({
										...form,
										fullName: e.target.value,
									})
								}
								required
								className="w-full border rounded p-2"
							/>
						</div>

						<div>
							{" "}
							<label
								htmlFor="duration"
								className="block text-sm font-medium mb-1">
								Loan tenure (in months)
							</label>
							<input
								id="duration"
								type="number"
								placeholder="Loan tenure (in months)"
								value={form.duration}
								onChange={(e) =>
									setForm({
										...form,
										duration: e.target.value,
									})
								}
								min="1"
								max="60"
								required
								className="w-full border rounded p-2"
							/>
						</div>

						<div>
							<label
								htmlFor="purpose"
								className="block text-sm font-medium mb-1">
								Reason for loan
							</label>
							<textarea
								id="purpose"
								placeholder="Reason for loan"
								value={form.purpose}
								onChange={(e) =>
									setForm({
										...form,
										purpose: e.target.value,
									})
								}
								required
								className="w-full border rounded p-2 h-24"
							/>
						</div>
					</div>

					{/* Right column */}
					<div className="space-y-4">
						<div>
							{" "}
							<label
								htmlFor="loanAmount"
								className="block text-sm font-medium mb-1">
								How much do you need? (₹)
							</label>
							<input
								id="loanAmount"
								type="number"
								placeholder="How much do you need?"
								value={form.loanAmount}
								onChange={(e) =>
									setForm({
										...form,
										loanAmount: e.target.value,
									})
								}
								min="1000"
								required
								className="w-full border rounded p-2"
							/>
						</div>

						<div>
							<label
								htmlFor="employmentStatus"
								className="block text-sm font-medium mb-1">
								Employment status
							</label>
							<input
								id="employmentStatus"
								type="text"
								placeholder="Employment status"
								value={form.employmentStatus}
								onChange={(e) =>
									setForm({
										...form,
										employmentStatus: e.target.value,
									})
								}
								required
								className="w-full border rounded p-2"
							/>
						</div>

						<div>
							<label
								htmlFor="employmentAddress1"
								className="block text-sm font-medium mb-1">
								Employment address
							</label>
							<input
								id="employmentAddress1"
								type="text"
								placeholder="Employment address"
								value={form.employmentAddress1}
								onChange={(e) =>
									setForm({
										...form,
										employmentAddress1: e.target.value,
									})
								}
								required
								className="w-full border rounded p-2 mb-2"
							/>
							<input
								id="employmentAddress2"
								type="text"
								placeholder="Employment address"
								value={form.employmentAddress2}
								onChange={(e) =>
									setForm({
										...form,
										employmentAddress2: e.target.value,
									})
								}
								className="w-full border rounded p-2"
							/>
						</div>
					</div>
				</div>
				{/* Chart section */}
				<div className="mt-8">
					<h2 className="text-lg font-medium mb-2">
						Payment Schedule
					</h2>

					{parseFloat(form.loanAmount) > 0 &&
					parseInt(form.duration) > 0 ? (
						<>
							<div className="bg-gray-50 p-3 mb-4 rounded">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{" "}
									<div>
										<p className="text-sm text-gray-600">
											Loan Amount
										</p>
										<p className="font-semibold text-lg">
											₹
											{parseFloat(
												form.loanAmount
											).toLocaleString()}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">
											Monthly Payment
										</p>
										<p className="font-semibold text-lg">
											₹
											{calculateMonthlyPayment(
												parseFloat(form.loanAmount),
												parseInt(form.duration)
											).toLocaleString()}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">
											Total Payment
										</p>
										<p className="font-semibold text-lg">
											₹
											{(
												calculateMonthlyPayment(
													parseFloat(form.loanAmount),
													parseInt(form.duration)
												) * parseInt(form.duration)
											).toLocaleString()}
										</p>
									</div>
								</div>
							</div>

							<div className="border rounded p-4 overflow-x-auto">
								<LineChart
									width={600}
									height={300}
									data={paymentSchedule}
									margin={{
										top: 5,
										right: 30,
										left: 20,
										bottom: 5,
									}}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="month"
										label={{
											value: "Month",
											position: "insideBottomRight",
											offset: -10,
										}}
									/>{" "}
									<YAxis
										label={{
											value: "Amount (₹)",
											angle: -90,
											position: "insideLeft",
										}}
										tickFormatter={(value) =>
											value.toLocaleString()
										}
									/>
									<Tooltip
										formatter={(value) => [
											"₹" +
												Number(value).toLocaleString(),
											undefined,
										]}
										labelFormatter={(label) =>
											`Month ${label}`
										}
									/>
									<Legend />
									<Line
										name="Monthly Payment"
										type="monotone"
										dataKey="payment"
										stroke="#0c3e19"
										strokeWidth={2}
										activeDot={{ r: 8 }}
									/>
									<Line
										name="Remaining Balance"
										type="monotone"
										dataKey="remainingBalance"
										stroke="#6b9908"
										strokeWidth={2}
										dot={false}
									/>
									<Line
										name="Principal Payment"
										type="monotone"
										dataKey="principalPayment"
										stroke="#82ca9d"
										strokeWidth={1.5}
										dot={false}
									/>
									<Line
										name="Interest Payment"
										type="monotone"
										dataKey="interestPayment"
										stroke="#ffc658"
										strokeWidth={1.5}
										dot={false}
									/>
								</LineChart>
							</div>
						</>
					) : (
						<div className="border rounded p-8 text-center text-gray-500">
							<p>
								Enter a loan amount and duration to see your
								payment schedule
							</p>
						</div>
					)}
				</div>
				{/* Terms and conditions */}
				<div className="flex items-start space-x-2">
					<Checkbox
						id="termsAccepted"
						checked={form.termsAccepted}
						onCheckedChange={(checked) =>
							setForm({
								...form,
								termsAccepted: checked === true,
							})
						}
						className="mt-1"
					/>
					<label
						htmlFor="termsAccepted"
						className="text-sm text-gray-600">
						I have read the important information and accept that by
						completing the application I will be bound by the terms.
					</label>
				</div>
				<div className="flex items-start space-x-2">
					<Checkbox
						id="creditCheck"
						checked={form.creditCheck}
						onCheckedChange={(checked) =>
							setForm({ ...form, creditCheck: checked === true })
						}
						className="mt-1"
					/>
					<label
						htmlFor="creditCheck"
						className="text-sm text-gray-600">
						Any personal and credit information obtained may be
						disclosed from time to time to other lenders, credit
						bureaus or other credit reporting agencies.
					</label>
				</div>{" "}
				{/* Submit button */}{" "}
				<div className="mt-6">
					<button
						type="submit"
						className={`bg-green-700 text-white py-2 px-6 rounded hover:bg-green-800 transition duration-200 ${
							isLoading ? "opacity-50 cursor-not-allowed" : ""
						}`}
						disabled={isLoading}>
						{isLoading ? "Processing..." : "Submit"}
					</button>
				</div>
				{formStatus.type && (
					<div
						className={`mt-4 p-4 rounded ${
							formStatus.type === "success"
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}>
						{formStatus.message}
					</div>
				)}
			</form>
		</div>
	);
}
