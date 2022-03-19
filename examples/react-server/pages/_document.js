import Document, { Head, Html, Main, NextScript } from "next/document";
import { extractStyles } from "coulis";

class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);
		const styles = extractStyles();

		return {
			...initialProps,
			styles: (
				<>
					{initialProps.styles}
					{styles.map((style) => {
						const { content, keys, type } = style;

						return (
							<style
								key={type}
								data-coulis
								data-type={type}
								data-keys={keys.join()}
								// eslint-disable-next-line react/no-danger
								dangerouslySetInnerHTML={{ __html: content }}
							/>
						);
					})}
				</>
			),
		};
	}

	render() {
		return (
			<Html>
				<Head />
				<body>
					{JSON.stringify(this.props.styleTags)}
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
