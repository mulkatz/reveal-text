import { type ChildProcess, spawn } from "node:child_process";
import { chromium } from "playwright";

const WIDTH = 800;
const HEIGHT = 600;
const DEV_URL = "http://localhost:5173";

async function waitForServer(url: string, timeout = 15000): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		try {
			const res = await fetch(url);
			if (res.ok) return;
		} catch {
			// not ready yet
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error(`Server at ${url} did not start within ${timeout}ms`);
}

async function startDevServer(): Promise<ChildProcess> {
	const proc = spawn("npm", ["run", "dev"], {
		cwd: new URL("../demo", import.meta.url).pathname,
		stdio: "pipe",
	});
	await waitForServer(DEV_URL);
	return proc;
}

async function wait(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

async function record() {
	console.log("Starting demo dev server...");
	const server = await startDevServer();

	try {
		console.log("Launching browser...");
		const browser = await chromium.launch();

		// Pre-load the page without recording to avoid blank frames
		const warmupContext = await browser.newContext({
			viewport: { width: WIDTH, height: HEIGHT },
		});
		const warmupPage = await warmupContext.newPage();
		await warmupPage.goto(DEV_URL, { waitUntil: "networkidle" });
		await wait(1000);
		await warmupContext.close();

		// Now record with a fresh page load
		const context = await browser.newContext({
			viewport: { width: WIDTH, height: HEIGHT },
			recordVideo: {
				dir: "./tmp-video",
				size: { width: WIDTH, height: HEIGHT },
			},
		});

		const page = await context.newPage();
		await page.goto(DEV_URL, { waitUntil: "networkidle" });
		await wait(2500); // Hero animation plays

		// Scroll to Blur In demo and replay
		await page.evaluate(() => {
			const sections = document.querySelectorAll("section");
			sections[2]?.scrollIntoView({ behavior: "smooth" });
		});
		await wait(1500);
		await page.click("section:nth-of-type(3) p");
		await wait(2000);

		// Scroll to Typewriter
		await page.evaluate(() => {
			const sections = document.querySelectorAll("section");
			sections[4]?.scrollIntoView({ behavior: "smooth" });
		});
		await wait(3000);

		// Scroll to Scramble and replay
		await page.evaluate(() => {
			const sections = document.querySelectorAll("section");
			sections[5]?.scrollIntoView({ behavior: "smooth" });
		});
		await wait(500);
		await page.click("section:nth-of-type(6) p");
		await wait(2000);

		console.log("Recording complete. Saving video...");
		await context.close();
		await browser.close();

		console.log("Video saved to tmp-video/");
	} finally {
		server.kill();
	}
}

record().catch((err) => {
	console.error("Recording failed:", err);
	process.exit(1);
});
