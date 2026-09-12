import type { ReactNode } from "react";

export const TableShell = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => {
	return (
		<table className={className}>
			<thead>
				<tr>
					<th>Column1</th>
					<th>Column2</th>
				</tr>
			</thead>
			<tbody>{children}</tbody>
		</table>
	);
};
