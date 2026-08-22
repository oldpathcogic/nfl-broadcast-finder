# NFL Broadcast Finder

A Phase 1 MVP for finding the correct lawful broadcast, streaming, or audio path
for NFL games against a viewer's ZIP, market, provider setup, and subscriptions.

The current app is a working product surface seeded from the attached system
plan. It is intentionally transparent about what is demo data and what needs a
real feed or operator review before production use.

## What Works Now

- Canonical game ledger for the sample preseason slate.
- Viewer context for Fairfield, San Francisco, and Los Angeles ZIP examples.
- Watch setup toggles for antenna, live-TV bundle, ESPN Unlimited, NFL Network,
  and NFL+ audio.
- Ranked watch/listen paths based on the viewer's current setup.
- Source freshness, confidence states, and a visible change ledger.
- Calendar export with stable game UIDs and sequence support.
- Verification queue showing where schedule feeds, local EPG data, and alert
  adapters plug in next.

## Product Boundary

This app does not bypass rights, blackouts, or subscriptions. It only ranks
lawful options that have been modeled for the viewer's location and setup.

Seed schedule data is not live NFL schedule data. Before public release, connect
licensed or official schedule feeds, local affiliate/EPG validation, and source
retention that complies with each provider's terms.

## Local Development

```bash
npm install
npm run dev
npm run build
npm test
```

The local preview usually runs at `http://localhost:3000/`.

## Next Build Steps

1. Move the seed game/outlet records into a typed data module or database.
2. Add a schedule ingestion adapter for Sportradar, SportsDataIO, or another
   licensed provider.
3. Add ZIP-to-DMA and market affiliate data with user override support.
4. Add local EPG/source observation records and a moderator review queue.
5. Add persistent user profiles, alert rules, and recurring calendar feeds.
