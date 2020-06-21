import React from "react";
import { css } from "coulis";
import { NUMBER_OF_DATA } from "../../constants";

export const Component = () => {
	return (
		<table
			className={css({
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
								className={css({
									backgroundColor: {
										default: "lightcoral",
										":hover": "lightyellow",
									},
								})}
							>
								The table body
							</td>
							<td
								className={css({
									backgroundColor: {
										default: "lightblue",
										":hover": "lightyellow",
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
