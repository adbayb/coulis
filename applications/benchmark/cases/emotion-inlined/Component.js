import { css } from "@emotion/css";
import React from "react";

import { NUMBER_OF_DATA } from "../../constants";

export const Component = () => {
	return (
		<table
			className={css`
				border: 1px solid black;
			`}
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
								className={css`
									background-color: lightcoral;
									&:hover {
										background-color: lightyellow;
									}
								`}
							>
								The table body
							</td>
							<td
								className={css`
									background-color: lightblue;
									&:hover {
										background-color: lightyellow;
									}
								`}
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
