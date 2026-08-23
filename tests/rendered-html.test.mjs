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
  assert.match(html, /Match confidence/);
  assert.match(html, /Market details/);
  assert.match(html, /Watch Setup/);
  assert.match(html, /Game Date/);
  assert.match(html, /Steelers at Panthers/);
  assert.match(html, /Pittsburgh Steelers logo/);
  assert.match(html, /Carolina Panthers logo/);
  assert.match(html, /NFL\+ audio/);
  assert.match(html, /Streaming Matrix/);
  assert.match(html, /Peacock/);
  assert.match(html, /Paramount\+/);
  assert.match(html, /Open NFL\+/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton|codex-preview/);
});

test("includes tested ZIP market fallbacks", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /Saint Joseph, MO/);
  assert.match(page, /Kansas City-St\. Joseph/);
  assert.match(page, /Vallejo, CA/);
  assert.match(page, /Beverly Hills, CA/);
  assert.match(page, /Needs provider confirmation/);
  assert.match(page, /ZIP found\. Local TV market estimated\./);
  assert.doesNotMatch(page, /DMA lookup needed|Affiliate verification needed|broadcast market pending|coverage is pending/);
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
