import Document, { Head, Html, Main, NextScript } from "next/document";
import type { DocumentContext } from "next/document";

import { getMetadata } from "../helpers/coulis";

class MyDocument extends Document {
	public static override async getInitialProps(context: DocumentContext) {
		const styles = getMetadata();
		const initialProps = await Document.getInitialProps(context);

		return {
			...initialProps,
			styles: (
				<>
					{initialProps.styles}
					{styles.map(({ attributes, content }) => {
						return (
							<style
								{...attributes}
								// eslint-disable-next-line react/dom/no-dangerously-set-innerhtml
								dangerouslySetInnerHTML={{
									__html: content,
								}}
								key={attributes["data-coulis-type"]}
							/>
						);
					})}
				</>
			),
		};
	}

	public override render() {
		return (
			<Html lang="en">
				<Head />
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
