import React from "react";
import { css } from "emotion";

const Component = () => {
	return (
		<div
			className={css`
				color: lightcoral;
			`}
		>
			Simple
		</div>
	);
};

export default function () {
	return <Component />;
}
