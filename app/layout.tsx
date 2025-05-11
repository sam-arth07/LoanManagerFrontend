import AppClientWrapper from "@/components/AppClientWrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Loan Manager",
	description: "CreditSea Fullstack App",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body className={inter.className}>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						enableSystem>
						<AppClientWrapper>{children}</AppClientWrapper>
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
