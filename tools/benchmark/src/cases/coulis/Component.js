import { createStyles } from "coulis";

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

const tableClassName = styles({
	border: "1px solid black",
});

const firstTdClassName = styles({
	backgroundColor: {
		base: "lightcoral",
		hover: "lightyellow",
	},
});

const secondTdClassName = styles({
	backgroundColor: {
		base: "lightblue",
		hover: "lightyellow",
	},
});

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
				{Array.from({ length: NUMBER_OF_DATA }).map((_, index) => {
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
