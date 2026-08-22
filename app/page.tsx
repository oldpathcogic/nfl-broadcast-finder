"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Antenna,
  Bell,
  Calendar,
  CheckCircle2,
  Clock3,
  Headphones,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Tv,
  Wifi,
} from "lucide-react";

type CapabilityKey =
  | "antenna"
  | "providerBundle"
  | "espnUnlimited"
  | "nflNetwork"
  | "nflPlusAudio";

type AvailabilityState =
  | "confirmed"
  | "likely"
  | "pending"
  | "changed"
  | "unavailable";

type WatchPath = {
  id: string;
  label: string;
  network: string;
  medium: "ota_tv" | "streaming" | "cable" | "audio_app" | "radio";
  territory: string;
  entitlement: "free" | "included" | "subscription" | "provider_login";
  requirement: CapabilityKey | "none";
  devices: string[];
  source: string;
  verifiedAt: string;
  confidence: AvailabilityState;
  note: string;
};

type Game = {
  id: string;
  uid: string;
  week: string;
  matchup: string;
  shortName: string;
  kickoffUtc: string;
  venue: string;
  venueTz: string;
  status: AvailabilityState;
  flexEligible: boolean;
  market: string;
  national: WatchPath[];
  local: WatchPath[];
  audio: WatchPath[];
  changes: {
    at: string;
    title: string;
    detail: string;
    source: string;
  }[];
};

const capabilityLabels: Record<CapabilityKey, string> = {
  antenna: "Antenna",
  providerBundle: "Live-TV bundle",
  espnUnlimited: "ESPN Unlimited",
  nflNetwork: "NFL Network",
  nflPlusAudio: "NFL+ audio",
};

const initialCapabilities: Record<CapabilityKey, boolean> = {
  antenna: true,
  providerBundle: true,
  espnUnlimited: false,
  nflNetwork: false,
  nflPlusAudio: true,
};

const marketOptions = [
  {
    zip: "94533",
    city: "Fairfield, CA",
    dma: "Sacramento-Stockton-Modesto",
    localAffiliate: "KCRA 3",
  },
  {
    zip: "94105",
    city: "San Francisco, CA",
    dma: "San Francisco-Oakland-San Jose",
    localAffiliate: "KNTV 11",
  },
  {
    zip: "90012",
    city: "Los Angeles, CA",
    dma: "Los Angeles",
    localAffiliate: "KNBC 4",
  },
];

const verifiedStamp = "2026-08-22T19:06:00.000Z";

const games: Game[] = [
  {
    id: "was-det-2026-pre",
    uid: "nflbf-was-det-2026-preseason",
    week: "Preseason",
    matchup: "Washington Commanders at Detroit Lions",
    shortName: "Commanders at Lions",
    kickoffUtc: "2026-08-22T16:00:00.000Z",
    venue: "Ford Field, Detroit, MI",
    venueTz: "America/Detroit",
    status: "likely",
    flexEligible: false,
    market: "Out of Sacramento OTA market",
    national: [
      {
        id: "was-det-nflplus",
        label: "NFL+",
        network: "NFL+",
        medium: "streaming",
        territory: "US out-of-market preseason eligibility",
        entitlement: "subscription",
        requirement: "nflPlusAudio",
        devices: ["phone", "tablet", "browser"],
        source: "Team watch pages, validation pending",
        verifiedAt: verifiedStamp,
        confidence: "likely",
        note: "Video depends on preseason eligibility and location.",
      },
    ],
    local: [],
    audio: [],
    changes: [
      {
        at: verifiedStamp,
        title: "Seeded from preseason slate",
        detail: "Local team broadcast marked for verification before kickoff.",
        source: "Build reference appendix",
      },
    ],
  },
  {
    id: "bal-min-2026-pre",
    uid: "nflbf-bal-min-2026-preseason",
    week: "Preseason",
    matchup: "Baltimore Ravens at Minnesota Vikings",
    shortName: "Ravens at Vikings",
    kickoffUtc: "2026-08-22T17:00:00.000Z",
    venue: "U.S. Bank Stadium, Minneapolis, MN",
    venueTz: "America/Chicago",
    status: "confirmed",
    flexEligible: false,
    market: "National stream",
    national: [
      {
        id: "bal-min-espn",
        label: "ESPN Unlimited",
        network: "ESPN",
        medium: "streaming",
        territory: "US national",
        entitlement: "subscription",
        requirement: "espnUnlimited",
        devices: ["tv app", "browser", "phone"],
        source: "National listing seed",
        verifiedAt: verifiedStamp,
        confidence: "confirmed",
        note: "Subscription path; local affiliate still checked separately.",
      },
    ],
    local: [],
    audio: [
      {
        id: "bal-min-audio",
        label: "NFL+ audio",
        network: "NFL+",
        medium: "audio_app",
        territory: "US",
        entitlement: "subscription",
        requirement: "nflPlusAudio",
        devices: ["phone", "tablet", "browser"],
        source: "NFL audio fallback seed",
        verifiedAt: verifiedStamp,
        confidence: "likely",
        note: "Use when video is unavailable with current setup.",
      },
    ],
    changes: [
      {
        at: verifiedStamp,
        title: "National outlet confirmed",
        detail: "ESPN Unlimited added as the primary national video path.",
        source: "Build reference appendix",
      },
    ],
  },
  {
    id: "buf-cle-2026-pre",
    uid: "nflbf-buf-cle-2026-preseason",
    week: "Preseason",
    matchup: "Buffalo Bills at Cleveland Browns",
    shortName: "Bills at Browns",
    kickoffUtc: "2026-08-22T17:00:00.000Z",
    venue: "Huntington Bank Field, Cleveland, OH",
    venueTz: "America/New_York",
    status: "confirmed",
    flexEligible: false,
    market: "National cable",
    national: [
      {
        id: "buf-cle-nfln",
        label: "NFL Network",
        network: "NFL Network",
        medium: "cable",
        territory: "US national",
        entitlement: "provider_login",
        requirement: "nflNetwork",
        devices: ["tv", "live-TV app"],
        source: "National listing seed",
        verifiedAt: verifiedStamp,
        confidence: "confirmed",
        note: "Requires a bundle carrying NFL Network.",
      },
    ],
    local: [],
    audio: [],
    changes: [
      {
        at: verifiedStamp,
        title: "Cable path verified",
        detail: "NFL Network listed as the national outlet.",
        source: "Build reference appendix",
      },
    ],
  },
  {
    id: "atl-ind-2026-pre",
    uid: "nflbf-atl-ind-2026-preseason",
    week: "Preseason",
    matchup: "Atlanta Falcons at Indianapolis Colts",
    shortName: "Falcons at Colts",
    kickoffUtc: "2026-08-22T17:00:00.000Z",
    venue: "Lucas Oil Stadium, Indianapolis, IN",
    venueTz: "America/Indiana/Indianapolis",
    status: "pending",
    flexEligible: false,
    market: "Team affiliate workflow",
    national: [],
    local: [],
    audio: [
      {
        id: "atl-ind-audio",
        label: "Team radio networks",
        network: "Team radio",
        medium: "radio",
        territory: "Team markets",
        entitlement: "free",
        requirement: "none",
        devices: ["radio", "browser"],
        source: "Team radio validation pending",
        verifiedAt: verifiedStamp,
        confidence: "pending",
        note: "Moderator review should attach affiliate call signs.",
      },
    ],
    changes: [
      {
        at: verifiedStamp,
        title: "Needs local affiliate review",
        detail: "Preseason local rights are decentralized for this matchup.",
        source: "Build reference appendix",
      },
    ],
  },
  {
    id: "nyg-mia-2026-pre",
    uid: "nflbf-nyg-mia-2026-preseason",
    week: "Preseason",
    matchup: "New York Giants at Miami Dolphins",
    shortName: "Giants at Dolphins",
    kickoffUtc: "2026-08-22T20:00:00.000Z",
    venue: "Hard Rock Stadium, Miami Gardens, FL",
    venueTz: "America/New_York",
    status: "confirmed",
    flexEligible: false,
    market: "National cable",
    national: [
      {
        id: "nyg-mia-nfln",
        label: "NFL Network",
        network: "NFL Network",
        medium: "cable",
        territory: "US national",
        entitlement: "provider_login",
        requirement: "nflNetwork",
        devices: ["tv", "live-TV app"],
        source: "National listing seed",
        verifiedAt: verifiedStamp,
        confidence: "confirmed",
        note: "Bundle login required.",
      },
    ],
    local: [],
    audio: [],
    changes: [
      {
        at: verifiedStamp,
        title: "National outlet confirmed",
        detail: "NFL Network added as the national video path.",
        source: "Build reference appendix",
      },
    ],
  },
  {
    id: "no-lar-2026-pre",
    uid: "nflbf-no-lar-2026-preseason",
    week: "Preseason",
    matchup: "New Orleans Saints at Los Angeles Rams",
    shortName: "Saints at Rams",
    kickoffUtc: "2026-08-22T20:00:00.000Z",
    venue: "SoFi Stadium, Inglewood, CA",
    venueTz: "America/Los_Angeles",
    status: "confirmed",
    flexEligible: false,
    market: "Sacramento local OTA verified",
    national: [
      {
        id: "no-lar-espn",
        label: "ESPN Unlimited",
        network: "ESPN",
        medium: "streaming",
        territory: "US national",
        entitlement: "subscription",
        requirement: "espnUnlimited",
        devices: ["tv app", "browser", "phone"],
        source: "National listing seed",
        verifiedAt: verifiedStamp,
        confidence: "confirmed",
        note: "National feed remains available if subscribed.",
      },
    ],
    local: [
      {
        id: "no-lar-kcra",
        label: "KCRA 3",
        network: "NBC Sacramento",
        medium: "ota_tv",
        territory: "Sacramento-Stockton-Modesto DMA",
        entitlement: "free",
        requirement: "antenna",
        devices: ["antenna", "live-TV bundle"],
        source: "Fairfield worked example",
        verifiedAt: verifiedStamp,
        confidence: "confirmed",
        note: "Free antenna path for ZIP 94533; provider channel number still belongs to the user's guide.",
      },
    ],
    audio: [
      {
        id: "no-lar-rams-audio",
        label: "Rams radio network",
        network: "Team radio",
        medium: "radio",
        territory: "Team radio network",
        entitlement: "free",
        requirement: "none",
        devices: ["radio", "browser"],
        source: "Audio fallback seed",
        verifiedAt: verifiedStamp,
        confidence: "likely",
        note: "Use as a lawful fallback if video access fails.",
      },
      {
        id: "no-lar-nflplus-audio",
        label: "NFL+ audio",
        network: "NFL+",
        medium: "audio_app",
        territory: "US",
        entitlement: "subscription",
        requirement: "nflPlusAudio",
        devices: ["phone", "tablet", "browser"],
        source: "Audio fallback seed",
        verifiedAt: verifiedStamp,
        confidence: "likely",
        note: "Subscription audio path where eligible.",
      },
    ],
    changes: [
      {
        at: "2026-08-22T19:06:00.000Z",
        title: "Local OTA path confirmed",
        detail: "Fairfield ZIP 94533 resolves to KCRA 3, NBC Sacramento.",
        source: "Build reference worked example",
      },
      {
        at: "2026-08-22T18:35:00.000Z",
        title: "National stream attached",
        detail: "ESPN Unlimited retained as a national subscription option.",
        source: "Build reference appendix",
      },
    ],
  },
  {
    id: "chi-cin-2026-pre",
    uid: "nflbf-chi-cin-2026-preseason",
    week: "Preseason",
    matchup: "Chicago Bears at Cincinnati Bengals",
    shortName: "Bears at Bengals",
    kickoffUtc: "2026-08-22T23:00:00.000Z",
    venue: "Paycor Stadium, Cincinnati, OH",
    venueTz: "America/New_York",
    status: "pending",
    flexEligible: false,
    market: "Team affiliate workflow",
    national: [],
    local: [],
    audio: [],
    changes: [
      {
        at: verifiedStamp,
        title: "Awaiting affiliate confirmation",
        detail: "Team pages should be checked 72 hours before kickoff and on game day.",
        source: "Operations rule",
      },
    ],
  },
  {
    id: "phi-ne-2026-pre",
    uid: "nflbf-phi-ne-2026-preseason",
    week: "Preseason",
    matchup: "Philadelphia Eagles at New England Patriots",
    shortName: "Eagles at Patriots",
    kickoffUtc: "2026-08-22T23:00:00.000Z",
    venue: "Gillette Stadium, Foxborough, MA",
    venueTz: "America/New_York",
    status: "confirmed",
    flexEligible: false,
    market: "National cable",
    national: [
      {
        id: "phi-ne-nfln",
        label: "NFL Network",
        network: "NFL Network",
        medium: "cable",
        territory: "US national",
        entitlement: "provider_login",
        requirement: "nflNetwork",
        devices: ["tv", "live-TV app"],
        source: "National listing seed",
        verifiedAt: verifiedStamp,
        confidence: "confirmed",
        note: "Requires a live-TV bundle carrying NFL Network.",
      },
    ],
    local: [],
    audio: [],
    changes: [
      {
        at: verifiedStamp,
        title: "National cable path verified",
        detail: "NFL Network listed as the national video path.",
        source: "Build reference appendix",
      },
    ],
  },
  {
    id: "kc-tb-2026-pre",
    uid: "nflbf-kc-tb-2026-preseason",
    week: "Preseason",
    matchup: "Kansas City Chiefs at Tampa Bay Buccaneers",
    shortName: "Chiefs at Buccaneers",
    kickoffUtc: "2026-08-22T23:30:00.000Z",
    venue: "Raymond James Stadium, Tampa, FL",
    venueTz: "America/New_York",
    status: "confirmed",
    flexEligible: false,
    market: "National stream",
    national: [
      {
        id: "kc-tb-espn",
        label: "ESPN Unlimited",
        network: "ESPN",
        medium: "streaming",
        territory: "US national",
        entitlement: "subscription",
        requirement: "espnUnlimited",
        devices: ["tv app", "browser", "phone"],
        source: "National listing seed",
        verifiedAt: verifiedStamp,
        confidence: "confirmed",
        note: "Subscription stream.",
      },
    ],
    local: [],
    audio: [],
    changes: [
      {
        at: verifiedStamp,
        title: "National stream confirmed",
        detail: "ESPN Unlimited listed as the national video path.",
        source: "Build reference appendix",
      },
    ],
  },
  {
    id: "dal-ari-2026-pre",
    uid: "nflbf-dal-ari-2026-preseason",
    week: "Preseason",
    matchup: "Dallas Cowboys at Arizona Cardinals",
    shortName: "Cowboys at Cardinals",
    kickoffUtc: "2026-08-23T02:00:00.000Z",
    venue: "State Farm Stadium, Glendale, AZ",
    venueTz: "America/Phoenix",
    status: "confirmed",
    flexEligible: false,
    market: "National cable",
    national: [
      {
        id: "dal-ari-nfln",
        label: "NFL Network",
        network: "NFL Network",
        medium: "cable",
        territory: "US national",
        entitlement: "provider_login",
        requirement: "nflNetwork",
        devices: ["tv", "live-TV app"],
        source: "National listing seed",
        verifiedAt: verifiedStamp,
        confidence: "confirmed",
        note: "Requires a live-TV bundle carrying NFL Network.",
      },
    ],
    local: [],
    audio: [],
    changes: [
      {
        at: verifiedStamp,
        title: "Night game verified",
        detail: "NFL Network listed for the late national window.",
        source: "Build reference appendix",
      },
    ],
  },
];

function formatTime(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
    ...options,
  }).format(new Date(value));
}

function formatStamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
    timeZoneName: "short",
  }).format(new Date(value));
}

function mediumIcon(medium: WatchPath["medium"]) {
  if (medium === "ota_tv") return <Antenna aria-hidden="true" />;
  if (medium === "streaming") return <Wifi aria-hidden="true" />;
  if (medium === "audio_app") return <Headphones aria-hidden="true" />;
  if (medium === "radio") return <Radio aria-hidden="true" />;
  return <Tv aria-hidden="true" />;
}

function stateLabel(state: AvailabilityState) {
  const labels: Record<AvailabilityState, string> = {
    confirmed: "Confirmed",
    likely: "Likely",
    pending: "Pending",
    changed: "Changed",
    unavailable: "Unavailable",
  };
  return labels[state];
}

function isOwned(path: WatchPath, capabilities: Record<CapabilityKey, boolean>) {
  return path.requirement === "none" || capabilities[path.requirement];
}

function pathScore(path: WatchPath, capabilities: Record<CapabilityKey, boolean>) {
  const owned = isOwned(path, capabilities);
  if (owned && path.entitlement === "free") return 1;
  if (owned) return 2;
  if (path.medium === "radio" || path.medium === "audio_app") return 4;
  return 3;
}

function rankedPaths(game: Game, capabilities: Record<CapabilityKey, boolean>) {
  return [...game.local, ...game.national, ...game.audio].sort((a, b) => {
    const score = pathScore(a, capabilities) - pathScore(b, capabilities);
    if (score !== 0) return score;
    return a.label.localeCompare(b.label);
  });
}

function createIcs(game: Game, primaryPath: WatchPath | undefined) {
  const start = new Date(game.kickoffUtc);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const fmt = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const description = [
    `Primary path: ${primaryPath ? `${primaryPath.label} (${primaryPath.network})` : "No verified video path"}`,
    `Status: ${stateLabel(game.status)}`,
    `Last verified: ${primaryPath ? formatStamp(primaryPath.verifiedAt) : "Pending"}`,
    "Generated by NFL Broadcast Finder.",
  ].join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NFL Broadcast Finder//MVP//EN",
    "BEGIN:VEVENT",
    `UID:${game.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${game.matchup}`,
    `LOCATION:${game.venue}`,
    `DESCRIPTION:${description}`,
    "SEQUENCE:1",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function Home() {
  const [capabilities, setCapabilities] = useState(initialCapabilities);
  const [zip, setZip] = useState("94533");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("no-lar-2026-pre");

  const market = marketOptions.find((item) => item.zip === zip) ?? marketOptions[0];
  const filteredGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return games;
    return games.filter((game) =>
      [game.matchup, game.venue, game.market].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [query]);

  const selectedGame =
    filteredGames.find((game) => game.id === selectedId) ??
    games.find((game) => game.id === selectedId) ??
    games[0];
  const selectedPaths = rankedPaths(selectedGame, capabilities);
  const primaryPath = selectedPaths[0];
  const confirmedCount = games.filter((game) => game.status === "confirmed").length;
  const pendingCount = games.filter((game) => game.status === "pending").length;
  const coveragePercent = Math.round((confirmedCount / games.length) * 100);

  function toggleCapability(key: CapabilityKey) {
    setCapabilities((current) => ({ ...current, [key]: !current[key] }));
  }

  function downloadCalendar(game: Game) {
    const ics = createIcs(game, rankedPaths(game, capabilities)[0]);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${game.id}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <section className="command-center" aria-label="NFL Broadcast Finder">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            BF
          </div>
          <div>
            <p className="eyebrow">NFL Broadcast Finder</p>
            <h1>Find the lawful way to watch or listen before kickoff.</h1>
          </div>
        </div>

        <div className="top-actions" aria-label="Monitoring actions">
          <button className="icon-button" type="button" aria-label="Refresh source checks">
            <RefreshCw aria-hidden="true" />
          </button>
          <button className="icon-button" type="button" aria-label="Alert settings">
            <Bell aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="control-grid" aria-label="Viewer context">
        <div className="profile-panel">
          <div className="panel-title">
            <MapPin aria-hidden="true" />
            <span>Viewer Context</span>
          </div>
          <div className="field-row">
            <label htmlFor="zip">ZIP</label>
            <select id="zip" value={zip} onChange={(event) => setZip(event.target.value)}>
              {marketOptions.map((option) => (
                <option key={option.zip} value={option.zip}>
                  {option.zip} - {option.city}
                </option>
              ))}
            </select>
          </div>
          <dl className="context-list">
            <div>
              <dt>TV market</dt>
              <dd>{market.dma}</dd>
            </div>
            <div>
              <dt>Local NBC</dt>
              <dd>{market.localAffiliate}</dd>
            </div>
            <div>
              <dt>Provider status</dt>
              <dd>Channel number delegated to provider guide</dd>
            </div>
          </dl>
        </div>

        <div className="setup-panel">
          <div className="panel-title">
            <SlidersHorizontal aria-hidden="true" />
            <span>Watch Setup</span>
          </div>
          <div className="toggle-grid">
            {(Object.keys(capabilities) as CapabilityKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`toggle ${capabilities[key] ? "is-on" : ""}`}
                onClick={() => toggleCapability(key)}
                aria-pressed={capabilities[key]}
              >
                <span>{capabilityLabels[key]}</span>
                <span>{capabilities[key] ? "On" : "Off"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="coverage-panel">
          <div className="panel-title">
            <ShieldCheck aria-hidden="true" />
            <span>Coverage Audit</span>
          </div>
          <div className="audit-meter" aria-label={`${coveragePercent}% of games confirmed`}>
            <span style={{ width: `${coveragePercent}%` }} />
          </div>
          <div className="stat-row">
            <strong>{coveragePercent}%</strong>
            <span>{confirmedCount} confirmed, {pendingCount} pending</span>
          </div>
          <p className="small-note">Demo ledger seeded from the attached build reference, not live league feeds.</p>
        </div>
      </section>

      <section className="workbench">
        <aside className="game-rail" aria-label="Game ledger">
          <div className="rail-header">
            <div>
              <p className="eyebrow">Canonical Ledger</p>
              <h2>Saturday Slate</h2>
            </div>
            <span>{filteredGames.length}</span>
          </div>

          <label className="search-box" htmlFor="game-search">
            <Search aria-hidden="true" />
            <input
              id="game-search"
              type="search"
              placeholder="Search games"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div className="game-list">
            {filteredGames.map((game) => {
              const paths = rankedPaths(game, capabilities);
              const best = paths[0];
              const owned = best ? isOwned(best, capabilities) : false;
              return (
                <button
                  type="button"
                  key={game.id}
                  className={`game-row ${selectedGame.id === game.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedId(game.id)}
                >
                  <span className={`status-dot ${game.status}`} />
                  <span>
                    <strong>{game.shortName}</strong>
                    <small>{formatTime(game.kickoffUtc)} - {best ? best.label : "No video path"}</small>
                  </span>
                  <em>{owned ? "Ready" : "Add"}</em>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="result-pane" aria-label="Selected game broadcast result">
          <div className="game-heading">
            <div>
              <p className="eyebrow">{selectedGame.week} - {stateLabel(selectedGame.status)}</p>
              <h2>{selectedGame.matchup}</h2>
              <p>
                {formatTime(selectedGame.kickoffUtc, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}{" "}
                - {selectedGame.venue}
              </p>
            </div>
            <button
              className="download-button"
              type="button"
              onClick={() => downloadCalendar(selectedGame)}
            >
              <Calendar aria-hidden="true" />
              <span>Calendar</span>
            </button>
          </div>

          <div className="primary-result">
            <div className="primary-icon">{primaryPath ? mediumIcon(primaryPath.medium) : <AlertTriangle aria-hidden="true" />}</div>
            <div>
              <p className="eyebrow">Best Path For {market.city}</p>
              <h3>{primaryPath ? primaryPath.label : "No verified outlet"}</h3>
              <p>
                {primaryPath
                  ? `${primaryPath.network} - ${primaryPath.territory}`
                  : "A verified video or audio path has not been attached yet."}
              </p>
            </div>
            <span className={`confidence-pill ${primaryPath?.confidence ?? "unavailable"}`}>
              {primaryPath ? stateLabel(primaryPath.confidence) : "Unavailable"}
            </span>
          </div>

          <div className="path-grid">
            {selectedPaths.map((path) => {
              const owned = isOwned(path, capabilities);
              return (
                <article className="path-card" key={path.id}>
                  <div className="path-card-top">
                    <div className="path-icon">{mediumIcon(path.medium)}</div>
                    <span className={`confidence-pill ${path.confidence}`}>
                      {stateLabel(path.confidence)}
                    </span>
                  </div>
                  <h3>{path.label}</h3>
                  <p>{path.network}</p>
                  <dl>
                    <div>
                      <dt>Access</dt>
                      <dd>{owned ? "Available with setup" : `Needs ${capabilityLabels[path.requirement as CapabilityKey] ?? "review"}`}</dd>
                    </div>
                    <div>
                      <dt>Territory</dt>
                      <dd>{path.territory}</dd>
                    </div>
                    <div>
                      <dt>Last verified</dt>
                      <dd>{formatStamp(path.verifiedAt)}</dd>
                    </div>
                  </dl>
                  <p className="card-note">{path.note}</p>
                </article>
              );
            })}
          </div>

          <div className="detail-grid">
            <section className="ops-panel" aria-label="Change ledger">
              <div className="panel-title">
                <Clock3 aria-hidden="true" />
                <span>Change Ledger</span>
              </div>
              <div className="timeline">
                {selectedGame.changes.map((change) => (
                  <article key={`${change.at}-${change.title}`}>
                    <CheckCircle2 aria-hidden="true" />
                    <div>
                      <strong>{change.title}</strong>
                      <p>{change.detail}</p>
                      <small>{formatStamp(change.at)} - {change.source}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="ops-panel" aria-label="Source health">
              <div className="panel-title">
                <AlertTriangle aria-hidden="true" />
                <span>Verification Queue</span>
              </div>
              <ul className="queue-list">
                <li>
                  <strong>Schedule feed</strong>
                  <span>Ready for Sportradar or SportsDataIO connector</span>
                </li>
                <li>
                  <strong>Local EPG</strong>
                  <span>Manual verification required for market expansion</span>
                </li>
                <li>
                  <strong>Alerts</strong>
                  <span>Calendar export active; push/email adapters pending</span>
                </li>
              </ul>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
