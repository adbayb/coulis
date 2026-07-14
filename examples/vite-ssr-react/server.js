// oxlint-disable node/no-top-level-await
import fs from "node:fs/promises";
// oxlint-disable-next-line e18e/ban-dependencies
import express from "express";

// Constants
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT ?? 3003;
const base = process.env.BASE ?? "/";
// Cached production assets
const templateHtml = isProduction ? await fs.readFile("./dist/client/index.html", "utf8") : "";
// Create http server
const app = express();

app.disable("x-powered-by");

// Add Vite or respective production middlewares
let vite = undefined;

if (isProduction) {
	const { default: compression } = await import("compression");
	const { default: sirv } = await import("sirv");

	app.use(compression());
	app.use(base, sirv("./dist/client", { extensions: [] }));
} else {
	const { createServer } = await import("vite");

	vite = await createServer({
		appType: "custom",
		base,
		server: { middlewareMode: true },
	});

	app.use(vite.middlewares);
}

// Serve HTML
app.use("*all", async (request, response) => {
	try {
		const url = request.originalUrl.replace(base, "");
		let template;
		let serverEntryModule;

		if (isProduction) {
			template = templateHtml;
			serverEntryModule = await import("./dist/server/entry-server.js");
		} else {
			// Always read fresh template in development
			template = await fs.readFile("./index.html", "utf8");
			template = await vite.transformIndexHtml(url, template);
			serverEntryModule = await vite.ssrLoadModule("/src/entry-server.tsx");
		}

		const render = serverEntryModule.renderHtml;
		const rendered = await render(url);

		const html = template
			.replace("<!--app-head-->", () => {
				return rendered.head ?? "";
			})
			.replace("<!--app-html-->", () => {
				return rendered.html ?? "";
			});

		response.status(200).set({ "Content-Type": "text/html" }).send(html);
	} catch (error) {
		vite?.ssrFixStacktrace(error);
		console.log(error.stack);
		response.status(500).end(error.stack);
	}
});

// Start http server
app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`);
});
