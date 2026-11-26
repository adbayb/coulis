import { create, props } from "@stylexjs/stylex";
import { BACKGROUND_COLORS, ROW_INDEXES } from "../constants";
import { TableShell } from "../table";

// The StyleX compiler only accepts literal styles: one per `BACKGROUND_COLORS` value.
const styles = create({
	cornsilk: { backgroundColor: "cornsilk" },
	lavender: { backgroundColor: "lavender" },
	lightblue: { backgroundColor: "lightblue" },
	lightcoral: { backgroundColor: "lightcoral" },
	lightgreen: { backgroundColor: "lightgreen" },
	lightpink: { backgroundColor: "lightpink" },
	lightsalmon: { backgroundColor: "lightsalmon" },
	lightseagreen: { backgroundColor: "lightseagreen" },
	lightskyblue: { backgroundColor: "lightskyblue" },
	lightslategrey: { backgroundColor: "lightslategrey" },
	lightsteelblue: { backgroundColor: "lightsteelblue" },
	lightyellow: { backgroundColor: "lightyellow" },
	mistyrose: { backgroundColor: "mistyrose" },
	oldlace: { backgroundColor: "oldlace" },
	palegreen: { backgroundColor: "palegreen" },
	peachpuff: { backgroundColor: "peachpuff" },
	powderblue: { backgroundColor: "powderblue" },
	thistle: { backgroundColor: "thistle" },
	wheat: { backgroundColor: "wheat" },
	whitesmoke: { backgroundColor: "whitesmoke" },
});

export const StyleXComponent = () => {
	return (
		<TableShell>
			{ROW_INDEXES.map((index) => {
				const backgroundColor = BACKGROUND_COLORS[
					index % BACKGROUND_COLORS.length
				] as keyof typeof styles;

				const { className } = props(styles[backgroundColor]);

				return (
					<tr key={index}>
						<td className={className}>The table body</td>
						<td className={className}>with two columns</td>
					</tr>
				);
			})}
		</TableShell>
	);
};
