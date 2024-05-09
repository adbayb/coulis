import { createStyles } from "coulis";
import React from "react";

import { NUMBER_OF_DATA } from "../../constants";

const styles = createStyles(
	{
		backgroundColor: true,
		border: true,
	},
	{
		states: {
			hover: ({ className, declaration }) =>
				`${className}:hover{${declaration}}`,
		},
	},
);

export const Component = () => {
	return (
		<table
			className={styles({
				border: "1px solid black",
			})}
		>
			<thead>
				<tr>
					<th>Column1</th>
					<th>Column2</th>
				</tr>
			</thead>
			<tbody>
				{[...new Array(NUMBER_OF_DATA)].map((_, index) => {
					return (
						<tr key={index}>
							<td
								className={styles({
									backgroundColor: {
										base: "lightcoral",
										hover: "lightyellow",
									},
								})}
							>
								The table body
							</td>
							<td
								className={styles({
									backgroundColor: {
										base: "lightblue",
										hover: "lightyellow",
									},
								})}
							>
								with two columns
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
