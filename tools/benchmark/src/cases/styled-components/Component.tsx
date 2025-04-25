import styled from "styled-components";

import { NUMBER_OF_DATA } from "../../constants";

const Table = styled.table`
	border: 1px solid black;
`;

const Cell1 = styled.td`
	background-color: lightcoral;
	&:hover {
		background-color: lightyellow;
	}
`;

const Cell2 = styled.td`
	background-color: lightblue;
	&:hover {
		background-color: lightyellow;
	}
`;

export const StyledComponentsComponent = () => {
	return (
		<Table>
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
							<Cell1>The table body</Cell1>
							<Cell2>with two columns</Cell2>
						</tr>
					);
				})}
			</tbody>
		</Table>
	);
};
