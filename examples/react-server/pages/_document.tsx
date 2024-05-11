import { extract } from "coulis";
import Document, { Head, Html, Main, NextScript } from "next/document";
import type { DocumentContext } from "next/document";

class MyDocument extends Document {
	public static override async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx);
		const styles = extract();

		return {
			...initialProps,
			styles: (
				<>
					{initialProps.styles}
					{styles.map(({ attributes, content }) => {
						return (
							<style
								{...attributes}
								// eslint-disable-next-line react/no-danger, react/jsx-sort-props
								dangerouslySetInnerHTML={{ __html: content }}
								key={attributes["data-coulis-id"]}
							/>
						);
					})}
				</>
			),
		};
	}

	// eslint-disable-next-line @typescript-eslint/class-methods-use-this
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
