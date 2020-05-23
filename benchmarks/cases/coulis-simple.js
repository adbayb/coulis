import React from "react";
import { css } from "coulis";

const Component = () => {
	return <div className={css({ color: "lightcoral" })}>Simple</div>;
};

export default function () {
	return <Component />;
}
