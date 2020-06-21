import React from "react";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { extractCss } from "coulis";

class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);
		const styleTags = extractCss();

		// console.log("PASSE", initialProps, styleTags);

		return { ...initialProps, styleTags };
	}

	render() {
		return (
			<Html>
				<Head>{this.props.styleTags}</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
