import { NUMBER_OF_DATA } from "../../constants";
import { createStyles } from "./helpers";

const tableClassName = createStyles({
	border: "1px solid black",
});

const firstTdClassName = createStyles({
	backgroundColor: {
		base: "lightcoral",
		hover: "lightyellow",
	},
});

const secondTdClassName = createStyles({
	backgroundColor: {
		base: "lightblue",
		hover: "lightyellow",
	},
});

export const CoulisComponent = () => {
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
