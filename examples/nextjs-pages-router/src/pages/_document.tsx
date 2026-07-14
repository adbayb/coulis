import type { DocumentContext } from "next/document";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { getMetadata } from "../helpers/coulis";

class MyDocument extends Document {
	public static override async getInitialProps(context: DocumentContext) {
		const initialProps = await Document.getInitialProps(context);

		return {
			...initialProps,
			styles: (
				<>
					{initialProps.styles}
					{getMetadata().map(({ attributes, content }) => {
						return (
							<style
								{...attributes}
								key={attributes["data-coulis-type"]}
								// oxlint-disable-next-line react/no-danger
								dangerouslySetInnerHTML={{
									__html: content,
								}}
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
