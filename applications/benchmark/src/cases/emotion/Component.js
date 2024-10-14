import { css } from "@emotion/css";
import React from "react";

import { NUMBER_OF_DATA } from "../../constants";

const tableClassName = css`
	border: 1px solid black;
`;

const firstTdClassName = css`
	background-color: lightcoral;
	&:hover {
		background-color: lightyellow;
	}
`;

const secondTdClassName = css`
	background-color: lightblue;
	&:hover {
		background-color: lightyellow;
	}
`;

export const Component = () => {
	return (
		<table className={tableClassName}>
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
							<td className={firstTdClassName}>The table body</td>
							<td className={secondTdClassName}>
								with two columns
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
