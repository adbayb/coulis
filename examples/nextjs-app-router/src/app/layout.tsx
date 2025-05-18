import type { Metadata } from "next";

import { CoulisRegistry } from "../components/CoulisRegistry";

export const metadata: Metadata = {
	title: "Coulis",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<CoulisRegistry>{children}</CoulisRegistry>
			</body>
		</html>
	);
}
