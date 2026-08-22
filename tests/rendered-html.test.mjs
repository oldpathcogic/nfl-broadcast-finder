import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the NFL Broadcast Finder shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>NFL Broadcast Finder<\/title>/i);
  assert.match(html, /Find the lawful way to watch or listen before kickoff\./);
  assert.match(html, /Viewer Context/);
  assert.match(html, /Watch Setup/);
  assert.match(html, /Saints at Rams/);
  assert.match(html, /KCRA 3/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/);
});

test("documents the product boundary and next build steps", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

  assert.match(readme, /^# NFL Broadcast Finder/m);
  assert.match(readme, /does not bypass rights, blackouts, or subscriptions/);
  assert.match(readme, /Add ZIP-to-DMA and market affiliate data/);
});
