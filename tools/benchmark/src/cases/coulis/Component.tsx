import { NUMBER_OF_DATA } from "../../constants";
import { SHADES } from "../constants";
import { createStyles } from "./helpers";

export const CoulisComponent = () => {
	return (
		<table>
			<thead>
				<tr>
					<th>Column1</th>
				</tr>
			</thead>
			<tbody>
				{Array.from({ length: NUMBER_OF_DATA }, (_, index) => {
					const className = createStyles({
						backgroundColor: SHADES[index % SHADES.length],
					});

					return (
						<tr key={index}>
							<td className={className}>The table body</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
