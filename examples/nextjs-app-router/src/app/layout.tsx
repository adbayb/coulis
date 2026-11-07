import type { Metadata } from "next";
import { CoulisRegistry } from "../components/coulis-registry";

// oxlint-disable-next-line react/only-export-components
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
