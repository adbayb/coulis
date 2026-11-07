import type { ReactNode } from "react";

export const TableShell = ({ children }: { children: ReactNode }) => {
	return (
		<table>
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
