import Document, { Head, Html, Main, NextScript } from "next/document";
import type { DocumentContext } from "next/document";
import { extractStyles } from "coulis";

class MyDocument extends Document {
	public static override async getInitialProps(context: DocumentContext) {
		const initialProps = await Document.getInitialProps(context);
		const styles = extractStyles();

		return {
			...initialProps,
			styles: (
				<>
					{initialProps.styles}
					{styles.map(({ attributes, content }) => {
						return (
							<style
								{...attributes}
								dangerouslySetInnerHTML={{ __html: content }}
								key={attributes["data-coulis-id"]}
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
