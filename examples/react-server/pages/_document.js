import { extractStyles } from "coulis";
import Document, { Head, Html, Main, NextScript } from "next/document";

class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const initialProps = await Document.getInitialProps(ctx);
		const styles = extractStyles();

		return {
			...initialProps,
			styles: (
				<>
					{initialProps.styles}
					{styles.map(({ content, keys }) => {
						return (
							<style
								data-coulis={keys}
								// eslint-disable-next-line react/no-danger, react/jsx-sort-props
								dangerouslySetInnerHTML={{ __html: content }}
								key={keys}
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
