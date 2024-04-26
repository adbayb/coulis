import { atoms } from "coulis";
import React from "react";

import { NUMBER_OF_DATA } from "../../constants";

export const Component = () => {
	return (
		<table
			className={atoms({
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
								className={atoms({
									backgroundColor: {
										":hover": "lightyellow",
										default: "lightcoral",
									},
								})}
							>
								The table body
							</td>
							<td
								className={atoms({
									backgroundColor: {
										":hover": "lightyellow",
										default: "lightblue",
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
