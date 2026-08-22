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
  assert.match(html, /Game day access, ranked by your ZIP and subscriptions\./);
  assert.match(html, /Viewer Context/);
  assert.match(html, /Enter any ZIP/);
  assert.match(html, /Verified local market loaded\./);
  assert.match(html, /Watch Setup/);
  assert.match(html, /Saints at Rams/);
  assert.match(html, /KCRA 3/);
  assert.match(html, /New Orleans Saints logo/);
  assert.match(html, /Los Angeles Rams logo/);
  assert.match(html, /NBC logo/);
  assert.match(html, /Streaming Matrix/);
  assert.match(html, /Peacock/);
  assert.match(html, /Paramount\+/);
  assert.match(html, /Open KCRA/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/);
});

test("documents the product boundary and next build steps", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

  assert.match(readme, /^# NFL Broadcast Finder/m);
  assert.match(readme, /does not bypass rights, blackouts, or subscriptions/);
  assert.match(readme, /Searchable viewer context for any 5-digit U\.S\. ZIP code/);
  assert.match(readme, /Team logos are loaded from ESPN/);
  assert.match(readme, /Direct links to official watch\/service pages/);
  assert.match(readme, /a link does not mean the\s+selected game is available on that service/);
  assert.match(readme, /licensed ZIP-to-DMA and market\s+affiliate data/);
});
