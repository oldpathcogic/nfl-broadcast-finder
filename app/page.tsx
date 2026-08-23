"use client";

import { type FormEvent, useMemo, useState } from "react";
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
  | "nflPlusAudio"
  | "peacock"
  | "paramountPlus"
  | "primeVideo"
  | "netflix"
  | "sundayTicket"
  | "foxOne";

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
  href?: string;
  ctaLabel?: string;
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

type TeamMeta = {
  name: string;
  slug: string;
  abbr: string;
};

type ViewerMarket = {
  zip: string;
  city: string;
  dma: string;
  localAffiliate: string;
  verification: "confirmed" | "estimated" | "lookup" | "unverified";
};

const capabilityLabels: Record<CapabilityKey, string> = {
  antenna: "Antenna",
  providerBundle: "Live-TV bundle",
  espnUnlimited: "ESPN Unlimited",
  nflNetwork: "NFL Network",
  nflPlusAudio: "NFL+ audio",
  peacock: "Peacock",
  paramountPlus: "Paramount+",
  primeVideo: "Prime Video",
  netflix: "Netflix",
  sundayTicket: "Sunday Ticket",
  foxOne: "FOX One",
};

const teamMeta: Record<string, TeamMeta> = {
  "Arizona Cardinals": { name: "Arizona Cardinals", slug: "ari", abbr: "ARI" },
  "Atlanta Falcons": { name: "Atlanta Falcons", slug: "atl", abbr: "ATL" },
  "Baltimore Ravens": { name: "Baltimore Ravens", slug: "bal", abbr: "BAL" },
  "Buffalo Bills": { name: "Buffalo Bills", slug: "buf", abbr: "BUF" },
  "Chicago Bears": { name: "Chicago Bears", slug: "chi", abbr: "CHI" },
  "Cincinnati Bengals": { name: "Cincinnati Bengals", slug: "cin", abbr: "CIN" },
  "Cleveland Browns": { name: "Cleveland Browns", slug: "cle", abbr: "CLE" },
  "Dallas Cowboys": { name: "Dallas Cowboys", slug: "dal", abbr: "DAL" },
  "Detroit Lions": { name: "Detroit Lions", slug: "det", abbr: "DET" },
  "Indianapolis Colts": { name: "Indianapolis Colts", slug: "ind", abbr: "IND" },
  "Jacksonville Jaguars": { name: "Jacksonville Jaguars", slug: "jax", abbr: "JAX" },
  "Kansas City Chiefs": { name: "Kansas City Chiefs", slug: "kc", abbr: "KC" },
  "Las Vegas Raiders": { name: "Las Vegas Raiders", slug: "lv", abbr: "LV" },
  "Los Angeles Chargers": { name: "Los Angeles Chargers", slug: "lac", abbr: "LAC" },
  "Los Angeles Rams": { name: "Los Angeles Rams", slug: "lar", abbr: "LAR" },
  "Miami Dolphins": { name: "Miami Dolphins", slug: "mia", abbr: "MIA" },
  "Minnesota Vikings": { name: "Minnesota Vikings", slug: "min", abbr: "MIN" },
  "New England Patriots": { name: "New England Patriots", slug: "ne", abbr: "NE" },
  "New Orleans Saints": { name: "New Orleans Saints", slug: "no", abbr: "NO" },
  "New York Giants": { name: "New York Giants", slug: "nyg", abbr: "NYG" },
  "New York Jets": { name: "New York Jets", slug: "nyj", abbr: "NYJ" },
  "Philadelphia Eagles": { name: "Philadelphia Eagles", slug: "phi", abbr: "PHI" },
  "Pittsburgh Steelers": { name: "Pittsburgh Steelers", slug: "pit", abbr: "PIT" },
  "San Francisco 49ers": { name: "San Francisco 49ers", slug: "sf", abbr: "SF" },
  "Seattle Seahawks": { name: "Seattle Seahawks", slug: "sea", abbr: "SEA" },
  "Tampa Bay Buccaneers": { name: "Tampa Bay Buccaneers", slug: "tb", abbr: "TB" },
  "Tennessee Titans": { name: "Tennessee Titans", slug: "ten", abbr: "TEN" },
  "Houston Texans": { name: "Houston Texans", slug: "hou", abbr: "HOU" },
  "Carolina Panthers": { name: "Carolina Panthers", slug: "car", abbr: "CAR" },
  "Washington Commanders": { name: "Washington Commanders", slug: "wsh", abbr: "WSH" },
};

const outletLogos = {
  espn: "https://commons.wikimedia.org/wiki/Special:Redirect/file/ESPN_wordmark.svg",
  nbc: "https://commons.wikimedia.org/wiki/Special:Redirect/file/NBC_logo.svg",
  nfl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/NFL_wordmark_logo_2008.svg",
  nflPlus: "https://commons.wikimedia.org/wiki/Special:Redirect/file/NFL%2B_logo.svg",
  cbs: "https://cdn.simpleicons.org/cbs/111111",
  peacock: "https://cdn.simpleicons.org/peacock/ffffff",
  paramountPlus: "https://cdn.simpleicons.org/paramountplus/ffffff",
  netflix: "https://cdn.simpleicons.org/netflix/e50914",
  youtube: "https://cdn.simpleicons.org/youtube/ff0033",
};

const initialCapabilities: Record<CapabilityKey, boolean> = {
  antenna: true,
  providerBundle: true,
  espnUnlimited: false,
  nflNetwork: false,
  nflPlusAudio: true,
  peacock: false,
  paramountPlus: false,
  primeVideo: false,
  netflix: false,
  sundayTicket: false,
  foxOne: false,
};

const capabilityKeys = Object.keys(initialCapabilities) as CapabilityKey[];

const servicePackages: Array<{
  id: CapabilityKey | "abc" | "cbs" | "fox" | "nbc";
  label: string;
  window: string;
  detail: string;
  href: string;
  logo?: string;
  mark?: string;
  tone?: "prime" | "fox";
}> = [
  {
    id: "paramountPlus",
    label: "Paramount+",
    window: "CBS local games",
    detail: "Streams NFL on CBS games that air on the viewer's local CBS station.",
    href: "https://www.paramountplus.com/shows/nfl-on-cbs/",
    logo: outletLogos.paramountPlus,
  },
  {
    id: "peacock",
    label: "Peacock",
    window: "NBC / SNF",
    detail: "Used for NBC Sunday Night Football and select Peacock NFL games.",
    href: "https://www.nfl.com/ways-to-watch/provider/peacock",
    logo: outletLogos.peacock,
  },
  {
    id: "primeVideo",
    label: "Prime Video",
    window: "TNF",
    detail: "Home of many Thursday Night Football windows and select exclusives.",
    href: "https://www.amazon.com/salp/tnf-help",
    mark: "prime",
    tone: "prime",
  },
  {
    id: "netflix",
    label: "Netflix",
    window: "Select holiday games",
    detail: "Used for select NFL event windows when scheduled by the league.",
    href: "https://www.nfl.com/ways-to-watch",
    logo: outletLogos.netflix,
  },
  {
    id: "sundayTicket",
    label: "Sunday Ticket",
    window: "Out-of-market Sunday",
    detail: "YouTube's out-of-market Sunday afternoon package, subject to restrictions.",
    href: "https://tv.youtube.com/learn/nflsundayticket/",
    logo: outletLogos.youtube,
  },
  {
    id: "foxOne",
    label: "FOX One",
    window: "FOX local games",
    detail: "Used for local FOX NFL availability where eligible.",
    href: "https://www.nfl.com/ways-to-watch",
    mark: "FOX",
    tone: "fox",
  },
  {
    id: "espnUnlimited",
    label: "ESPN",
    window: "MNF / ESPN windows",
    detail: "ESPN app access depends on game window, package, and login.",
    href: "https://www.espn.com/watch/",
    logo: outletLogos.espn,
  },
  {
    id: "nflNetwork",
    label: "NFL Network",
    window: "NFL Network games",
    detail: "Live NFL Network games usually require a carrying TV or streaming bundle.",
    href: "https://www.nfl.com/network/",
    logo: outletLogos.nfl,
  },
];

const knownMarkets: ViewerMarket[] = [
  {
    zip: "94533",
    city: "Fairfield, CA",
    dma: "Sacramento-Stockton-Modesto",
    localAffiliate: "KCRA 3",
    verification: "confirmed",
  },
  {
    zip: "94105",
    city: "San Francisco, CA",
    dma: "San Francisco-Oakland-San Jose",
    localAffiliate: "KNTV 11",
    verification: "confirmed",
  },
  {
    zip: "90012",
    city: "Los Angeles, CA",
    dma: "Los Angeles",
    localAffiliate: "KNBC 4",
    verification: "confirmed",
  },
  {
    zip: "90210",
    city: "Beverly Hills, CA",
    dma: "Los Angeles",
    localAffiliate: "Los Angeles local affiliates",
    verification: "estimated",
  },
  {
    zip: "94589",
    city: "Vallejo, CA",
    dma: "San Francisco-Oakland-San Jose",
    localAffiliate: "Bay Area local affiliates",
    verification: "estimated",
  },
  {
    zip: "64501",
    city: "Saint Joseph, MO",
    dma: "Kansas City-St. Joseph",
    localAffiliate: "Kansas City/St. Joseph local affiliates",
    verification: "estimated",
  },
];

const inferredMarkets: Array<{
  label: string;
  matches: (zip: string, city: string, state: string) => boolean;
  market: Omit<ViewerMarket, "zip" | "city">;
}> = [
  {
    label: "Los Angeles",
    matches: (zip, _city, state) => state === "CA" && /^(900|901|902|903|904|905|906|907|908|910|911|912|913|914|915|916)/.test(zip),
    market: {
      dma: "Los Angeles",
      localAffiliate: "Los Angeles local affiliates",
      verification: "estimated",
    },
  },
  {
    label: "Bay Area",
    matches: (zip, _city, state) => state === "CA" && /^(940|941|943|944|9458|9459|946|947|948|949|950|951)/.test(zip),
    market: {
      dma: "San Francisco-Oakland-San Jose",
      localAffiliate: "Bay Area local affiliates",
      verification: "estimated",
    },
  },
  {
    label: "Kansas City-St. Joseph",
    matches: (zip, _city, state) => state === "MO" && /^(640|641|644|645)/.test(zip),
    market: {
      dma: "Kansas City-St. Joseph",
      localAffiliate: "Kansas City/St. Joseph local affiliates",
      verification: "estimated",
    },
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
        href: "https://www.nfl.com/plus/",
        ctaLabel: "Open NFL+",
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
        href: "https://www.espn.com/watch/",
        ctaLabel: "Open ESPN",
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
        href: "https://www.nfl.com/plus/",
        ctaLabel: "Open NFL+",
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
        href: "https://www.nfl.com/network/",
        ctaLabel: "Open NFL Network",
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
        href: "https://www.nfl.com/ways-to-watch",
        ctaLabel: "Open guide",
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
        href: "https://www.nfl.com/network/",
        ctaLabel: "Open NFL Network",
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
        href: "https://www.espn.com/watch/",
        ctaLabel: "Open ESPN",
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
        href: "https://www.kcra.com/",
        ctaLabel: "Open KCRA",
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
        href: "https://www.therams.com/news/game-coverage/",
        ctaLabel: "Open radio",
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
        href: "https://www.nfl.com/plus/",
        ctaLabel: "Open NFL+",
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
        href: "https://www.nfl.com/network/",
        ctaLabel: "Open NFL Network",
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
        href: "https://www.espn.com/watch/",
        ctaLabel: "Open ESPN",
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
        href: "https://www.nfl.com/network/",
        ctaLabel: "Open NFL Network",
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
  {
    id: "pit-car-2026-pre",
    uid: "nflbf-pit-car-2026-preseason",
    week: "Preseason",
    matchup: "Pittsburgh Steelers at Carolina Panthers",
    shortName: "Steelers at Panthers",
    kickoffUtc: "2026-08-23T17:00:00.000Z",
    venue: "Bank of America Stadium, Charlotte, NC",
    venueTz: "America/New_York",
    status: "likely",
    flexEligible: false,
    market: "Local affiliate workflow",
    national: [
      {
        id: "pit-car-nflplus",
        label: "NFL+",
        network: "NFL+",
        medium: "streaming",
        territory: "US preseason eligibility",
        entitlement: "subscription",
        requirement: "nflPlusAudio",
        devices: ["phone", "tablet", "browser"],
        source: "Modeled upcoming preseason row",
        verifiedAt: verifiedStamp,
        confidence: "likely",
        note: "Preseason video eligibility depends on location and league rules.",
        href: "https://www.nfl.com/plus/",
        ctaLabel: "Open NFL+",
      },
    ],
    local: [],
    audio: [
      {
        id: "pit-car-audio",
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
        note: "Fallback audio path where eligible.",
        href: "https://www.nfl.com/plus/",
        ctaLabel: "Open NFL+",
      },
    ],
    changes: [
      {
        at: verifiedStamp,
        title: "Upcoming row added",
        detail: "Added so date selection can move beyond the initial slate.",
        source: "Modeled schedule row",
      },
    ],
  },
  {
    id: "sea-ten-2026-pre",
    uid: "nflbf-sea-ten-2026-preseason",
    week: "Preseason",
    matchup: "Seattle Seahawks at Tennessee Titans",
    shortName: "Seahawks at Titans",
    kickoffUtc: "2026-08-27T00:00:00.000Z",
    venue: "Nissan Stadium, Nashville, TN",
    venueTz: "America/Chicago",
    status: "likely",
    flexEligible: false,
    market: "National and local review",
    national: [
      {
        id: "sea-ten-nfln",
        label: "NFL Network",
        network: "NFL Network",
        medium: "cable",
        territory: "US national when scheduled",
        entitlement: "provider_login",
        requirement: "nflNetwork",
        devices: ["tv", "live-TV app"],
        source: "Modeled upcoming preseason row",
        verifiedAt: verifiedStamp,
        confidence: "likely",
        note: "Requires a bundle carrying NFL Network if selected for the national window.",
        href: "https://www.nfl.com/network/",
        ctaLabel: "Open NFL Network",
      },
    ],
    local: [],
    audio: [],
    changes: [
      {
        at: verifiedStamp,
        title: "Future date available",
        detail: "This matchup demonstrates picking an upcoming date.",
        source: "Modeled schedule row",
      },
    ],
  },
  {
    id: "lv-lac-2026-pre",
    uid: "nflbf-lv-lac-2026-preseason",
    week: "Preseason",
    matchup: "Las Vegas Raiders at Los Angeles Chargers",
    shortName: "Raiders at Chargers",
    kickoffUtc: "2026-08-28T02:00:00.000Z",
    venue: "SoFi Stadium, Inglewood, CA",
    venueTz: "America/Los_Angeles",
    status: "pending",
    flexEligible: false,
    market: "West Coast local review",
    national: [],
    local: [],
    audio: [
      {
        id: "lv-lac-audio",
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
        note: "Affiliate call signs should be attached by market.",
        href: "https://www.nfl.com/ways-to-watch",
        ctaLabel: "Open guide",
      },
    ],
    changes: [
      {
        at: verifiedStamp,
        title: "Pending outlet review",
        detail: "Local and streaming availability still need source confirmation.",
        source: "Modeled schedule row",
      },
    ],
  },
  {
    id: "nyj-jax-2026-pre",
    uid: "nflbf-nyj-jax-2026-preseason",
    week: "Preseason",
    matchup: "New York Jets at Jacksonville Jaguars",
    shortName: "Jets at Jaguars",
    kickoffUtc: "2026-08-29T23:00:00.000Z",
    venue: "EverBank Stadium, Jacksonville, FL",
    venueTz: "America/New_York",
    status: "likely",
    flexEligible: false,
    market: "Streaming/local review",
    national: [
      {
        id: "nyj-jax-nflplus",
        label: "NFL+",
        network: "NFL+",
        medium: "streaming",
        territory: "US preseason eligibility",
        entitlement: "subscription",
        requirement: "nflPlusAudio",
        devices: ["phone", "tablet", "browser"],
        source: "Modeled upcoming preseason row",
        verifiedAt: verifiedStamp,
        confidence: "likely",
        note: "Use exact game availability from NFL+ before kickoff.",
        href: "https://www.nfl.com/plus/",
        ctaLabel: "Open NFL+",
      },
    ],
    local: [],
    audio: [],
    changes: [
      {
        at: verifiedStamp,
        title: "Future Saturday row",
        detail: "Added to support upcoming-day browsing.",
        source: "Modeled schedule row",
      },
    ],
  },
  {
    id: "sf-hou-2026-week1",
    uid: "nflbf-sf-hou-2026-week1",
    week: "Week 1",
    matchup: "San Francisco 49ers at Houston Texans",
    shortName: "49ers at Texans",
    kickoffUtc: "2026-09-13T20:25:00.000Z",
    venue: "NRG Stadium, Houston, TX",
    venueTz: "America/Chicago",
    status: "likely",
    flexEligible: true,
    market: "Sunday afternoon window",
    national: [
      {
        id: "sf-hou-sunday-ticket",
        label: "Sunday Ticket",
        network: "YouTube Sunday Ticket",
        medium: "streaming",
        territory: "Out-of-market Sunday afternoon",
        entitlement: "subscription",
        requirement: "sundayTicket",
        devices: ["tv app", "browser", "phone"],
        source: "Regular-season availability model",
        verifiedAt: verifiedStamp,
        confidence: "likely",
        note: "Out-of-market rules and local blackouts still apply.",
        href: "https://tv.youtube.com/learn/nflsundayticket/",
        ctaLabel: "Open Sunday Ticket",
      },
    ],
    local: [],
    audio: [],
    changes: [
      {
        at: verifiedStamp,
        title: "Regular-season sample added",
        detail: "Shows how date selection works beyond preseason.",
        source: "Modeled schedule row",
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

function teamLogo(team: TeamMeta) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${team.slug}.png`;
}

function teamsForGame(game: Game) {
  const [awayName, homeName] = game.matchup.split(" at ");
  return {
    away: teamMeta[awayName] ?? { name: awayName, slug: "", abbr: awayName.slice(0, 3).toUpperCase() },
    home: teamMeta[homeName] ?? { name: homeName, slug: "", abbr: homeName.slice(0, 3).toUpperCase() },
  };
}

type LogoDescriptor = {
  alt: string;
  src?: string;
  text?: string;
  tone?: "prime" | "fox";
};

function logoForPath(path: WatchPath, game?: Game) {
  const haystack = `${path.label} ${path.network}`.toLowerCase();
  if (haystack.includes("espn")) return { src: outletLogos.espn, alt: "ESPN logo" };
  if (haystack.includes("nbc") || haystack.includes("kcra")) return { src: outletLogos.nbc, alt: "NBC logo" };
  if (haystack.includes("peacock")) return { src: outletLogos.peacock, alt: "Peacock logo" };
  if (haystack.includes("paramount")) return { src: outletLogos.paramountPlus, alt: "Paramount+ logo" };
  if (haystack.includes("prime")) return { text: "prime", tone: "prime", alt: "Prime Video logo" };
  if (haystack.includes("netflix")) return { src: outletLogos.netflix, alt: "Netflix logo" };
  if (haystack.includes("sunday ticket") || haystack.includes("youtube")) return { src: outletLogos.youtube, alt: "YouTube logo" };
  if (haystack.includes("nfl+") || haystack.includes("nfl plus")) return { src: outletLogos.nflPlus, alt: "NFL+ logo" };
  if (haystack.includes("nfl network")) return { src: outletLogos.nfl, alt: "NFL logo" };
  if (haystack.includes("cbs")) return { src: outletLogos.cbs, alt: "CBS logo" };
  if (haystack.includes("fox")) return { text: "FOX", tone: "fox", alt: "FOX logo" };
  if (game && haystack.includes("rams")) {
    const { home } = teamsForGame(game);
    return { src: teamLogo(home), alt: `${home.name} logo` };
  }
  return null;
}

function LogoImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // Logo sources come from public external CDNs, so this component keeps plain img fallback behavior.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={className}
      decoding="async"
      loading="lazy"
      referrerPolicy="no-referrer"
      src={src}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

function LogoMark({ logo }: { logo: LogoDescriptor }) {
  if (logo.src) return <LogoImage src={logo.src} alt={logo.alt} />;
  return (
    <span className={`text-logo ${logo.tone ?? ""}`} aria-label={logo.alt} role="img">
      {logo.text}
    </span>
  );
}

function TeamPair({ game, size = "compact" }: { game: Game; size?: "compact" | "large" }) {
  const { away, home } = teamsForGame(game);
  return (
    <div className={`team-pair ${size}`} aria-label={`${away.name} at ${home.name}`}>
      <span>
        {away.slug ? <LogoImage src={teamLogo(away)} alt={`${away.name} logo`} /> : away.abbr}
      </span>
      <span>
        {home.slug ? <LogoImage src={teamLogo(home)} alt={`${home.name} logo`} /> : home.abbr}
      </span>
    </div>
  );
}

function OutletLogo({
  path,
  game,
  className = "",
}: {
  path?: WatchPath;
  game?: Game;
  className?: string;
}) {
  const logo = path ? logoForPath(path, game) : null;

  return (
    <div className={`logo-tile ${className}`}>
      {logo ? <LogoMark logo={logo} /> : path ? mediumIcon(path.medium) : <AlertTriangle aria-hidden="true" />}
    </div>
  );
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
  if (path.confidence === "pending") return 4;
  if (path.confidence === "unavailable") return 6;
  if (owned && path.entitlement === "free") return 1;
  if (owned) return 2;
  if (path.medium === "radio" || path.medium === "audio_app") return 5;
  return 3;
}

function localVerificationPath(game: Game, market: ViewerMarket): WatchPath {
  return {
    id: `${game.id}-${market.zip}-local-review`,
    label: "Check local listing",
    network: "Local TV coverage",
    medium: "ota_tv",
    territory: market.dma,
    entitlement: "free",
    requirement: "none",
    devices: ["antenna", "live-TV bundle"],
    source: "ZIP market resolver; provider guide confirmation required",
    verifiedAt: new Date().toISOString(),
    confidence: "pending",
    note: `ZIP ${market.zip} resolves to ${market.city}. Use your provider guide to confirm the exact local channel and game carriage.`,
    href: "https://www.nfl.com/ways-to-watch",
    ctaLabel: "Open NFL guide",
  };
}

function pathsForGame(game: Game, market: ViewerMarket) {
  const confirmedLocal = game.local.filter(
    (path) => path.territory.includes(market.dma) || market.dma.includes(path.territory),
  );
  const needsLocalReview = confirmedLocal.length === 0 && market.zip !== "94533";
  return [
    ...confirmedLocal,
    ...game.national,
    ...(needsLocalReview ? [localVerificationPath(game, market)] : []),
    ...game.audio,
  ];
}

function rankedPaths(game: Game, capabilities: Record<CapabilityKey, boolean>, market: ViewerMarket) {
  return pathsForGame(game, market).sort((a, b) => {
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

function localDateKey(value: string | Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Los_Angeles",
    year: "numeric",
  }).formatToParts(typeof value === "string" ? new Date(value) : value);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

function todayDateKey() {
  return localDateKey(new Date());
}

function dateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(new Date(`${dateKey}T12:00:00`));
}

const marketResolver = {
  confidenceLabel(market: ViewerMarket) {
    if (market.verification === "confirmed") return "Verified";
    if (market.verification === "estimated") return "Estimated";
    return "Needs provider confirmation";
  },
  confidenceTone(market: ViewerMarket) {
    if (market.verification === "confirmed") return "is-verified";
    if (market.verification === "estimated") return "is-estimated";
    return "needs-confirmation";
  },
  statusMessage(market: ViewerMarket) {
    if (market.verification === "confirmed") return "Verified sample market loaded.";
    if (market.verification === "estimated") return "ZIP found. Local TV market estimated.";
    if (market.verification === "lookup") {
      return "ZIP found. Use your provider guide for the exact local channel.";
    }
    return "ZIP accepted. Use your provider guide for local channel confirmation.";
  },
  detail(market: ViewerMarket) {
    if (market.verification === "confirmed") {
      return "This sample market has modeled local affiliate data.";
    }
    if (market.verification === "estimated") {
      return "This market is estimated from ZIP, city, and regional coverage patterns.";
    }
    if (market.verification === "lookup") {
      return "The ZIP resolves to a real place, but exact TV market and affiliate data needs a provider guide.";
    }
    return "The ZIP format is accepted, but the place and local market could not be confirmed automatically.";
  },
};

function fallbackMarket(zip: string, city: string, state: string): ViewerMarket {
  const inferred = inferredMarkets.find((item) => item.matches(zip, city, state));
  if (inferred) {
    return {
      zip,
      city: `${city}, ${state}`,
      ...inferred.market,
    };
  }

  return {
    zip,
    city: `${city}, ${state}`,
    dma: "Provider confirmation needed",
    localAffiliate: "Confirm exact station with provider guide",
    verification: "lookup",
  };
}

export default function Home() {
  const [capabilities, setCapabilities] = useState(initialCapabilities);
  const [zipInput, setZipInput] = useState("94533");
  const [market, setMarket] = useState<ViewerMarket>(knownMarkets[0]);
  const [zipStatus, setZipStatus] = useState("Verified local market loaded.");
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayDateKey);
  const [selectedId, setSelectedId] = useState("pit-car-2026-pre");
  const [showAllSetup, setShowAllSetup] = useState(false);

  const availableDates = useMemo(
    () => Array.from(new Set(games.map((game) => localDateKey(game.kickoffUtc)))).sort(),
    [],
  );

  const dateGames = useMemo(
    () => games.filter((game) => localDateKey(game.kickoffUtc) === selectedDate),
    [selectedDate],
  );

  const filteredGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return dateGames;
    return dateGames.filter((game) =>
      [game.matchup, game.venue, game.market].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [dateGames, query]);

  const selectedGame =
    filteredGames.find((game) => game.id === selectedId) ??
    dateGames[0] ??
    games[0];
  const selectedPaths = rankedPaths(selectedGame, capabilities, market);
  const primaryPath = selectedPaths[0];
  const confirmedCount = dateGames.filter((game) => game.status === "confirmed").length;
  const pendingCount = dateGames.filter((game) => game.status === "pending").length;
  const coveragePercent = dateGames.length ? Math.round((confirmedCount / dateGames.length) * 100) : 0;
  const setupAvailability = useMemo(
    () =>
      capabilityKeys.reduce(
        (totals, key) => {
          totals[key] = dateGames.filter((game) =>
            pathsForGame(game, market).some((path) => path.requirement === key),
          ).length;
          return totals;
        },
        {} as Record<CapabilityKey, number>,
      ),
    [dateGames, market],
  );
  const visibleSetupKeys = showAllSetup
    ? capabilityKeys
    : capabilityKeys.filter((key) => setupAvailability[key] > 0);

  function chooseDate(dateKey: string) {
    const firstGame = games.find((game) => localDateKey(game.kickoffUtc) === dateKey);
    setSelectedDate(dateKey);
    if (firstGame) setSelectedId(firstGame.id);
  }

  function toggleCapability(key: CapabilityKey) {
    setCapabilities((current) => ({ ...current, [key]: !current[key] }));
  }

  async function searchZip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedZip = zipInput.replace(/\D/g, "").slice(0, 5);
    setZipInput(normalizedZip);

    if (normalizedZip.length !== 5) {
      setZipStatus("Enter a 5-digit U.S. ZIP code.");
      return;
    }

    const knownMarket = knownMarkets.find((item) => item.zip === normalizedZip);
    if (knownMarket) {
      setMarket(knownMarket);
      setZipStatus(marketResolver.statusMessage(knownMarket));
      return;
    }

    setZipStatus("Looking up ZIP...");

    try {
      const response = await fetch(`https://api.zippopotam.us/us/${normalizedZip}`);
      if (!response.ok) throw new Error("ZIP lookup failed");
      const payload = (await response.json()) as {
        places?: Array<{
          "place name"?: string;
          "state abbreviation"?: string;
        }>;
      };
      const place = payload.places?.[0];
      const city = place?.["place name"] ?? "Unknown city";
      const state = place?.["state abbreviation"] ?? "US";
      const resolvedMarket = fallbackMarket(normalizedZip, city, state);
      setMarket(resolvedMarket);
      setZipStatus(marketResolver.statusMessage(resolvedMarket));
    } catch {
      const unverifiedMarket: ViewerMarket = {
        zip: normalizedZip,
        city: `ZIP ${normalizedZip}`,
        dma: "Provider confirmation needed",
        localAffiliate: "Confirm exact station with provider guide",
        verification: "unverified",
      };
      setMarket(unverifiedMarket);
      setZipStatus(marketResolver.statusMessage(unverifiedMarket));
    }
  }

  function downloadCalendar(game: Game) {
    const ics = createIcs(game, rankedPaths(game, capabilities, market)[0]);
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
        <div className="premium-ribbon">Premium match finder</div>
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            BF
          </div>
          <div>
            <p className="eyebrow">NFL Broadcast Finder</p>
            <h1>Game day access, ranked by your ZIP and subscriptions.</h1>
            <p className="hero-copy">
              Search any U.S. ZIP, compare TV and streaming paths, and jump straight to the official watch page.
            </p>
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
          <form className="zip-search" onSubmit={searchZip}>
            <label htmlFor="zip">ZIP</label>
            <div>
              <input
                id="zip"
                inputMode="numeric"
                maxLength={5}
                pattern="[0-9]{5}"
                placeholder="Enter any ZIP"
                type="search"
                value={zipInput}
                onChange={(event) => setZipInput(event.target.value.replace(/\D/g, "").slice(0, 5))}
              />
              <button type="submit">
                <Search aria-hidden="true" />
                <span>Search</span>
              </button>
            </div>
          </form>
          <p className="lookup-status">{zipStatus}</p>
          <dl className="context-list">
            <div>
              <dt>Location</dt>
              <dd>{market.city}</dd>
            </div>
            <div>
              <dt>TV market</dt>
              <dd>{market.dma}</dd>
            </div>
            <div>
              <dt>Match confidence</dt>
              <dd>
                <span className={`market-confidence ${marketResolver.confidenceTone(market)}`}>
                  {marketResolver.confidenceLabel(market)}
                </span>
              </dd>
            </div>
          </dl>
          <details className="market-detail">
            <summary>Market details</summary>
            <dl className="context-list">
              <div>
                <dt>Local station</dt>
                <dd>{market.localAffiliate}</dd>
              </div>
              <div>
                <dt>Resolver note</dt>
                <dd>{marketResolver.detail(market)}</dd>
              </div>
              <div>
                <dt>Channel guide</dt>
                <dd>Confirm exact channel number and game availability with your TV provider or antenna guide.</dd>
              </div>
            </dl>
          </details>
        </div>

        <div className="setup-panel">
          <div className="panel-title">
            <SlidersHorizontal aria-hidden="true" />
            <span>Watch Setup Filters</span>
          </div>
          <div className="setup-chip-row" aria-label="Watch setup filters">
            {visibleSetupKeys.map((key) => {
              const availableCount = setupAvailability[key];
              return (
              <button
                key={key}
                type="button"
                className={`setup-chip ${capabilities[key] ? "is-on" : ""} ${availableCount === 0 ? "is-empty" : ""}`}
                onClick={() => toggleCapability(key)}
                aria-pressed={capabilities[key]}
              >
                <span>{capabilityLabels[key]}</span>
                <small>{availableCount > 0 ? `${availableCount} game${availableCount === 1 ? "" : "s"}` : "No games"}</small>
              </button>
              );
            })}
            <button
              className="setup-chip more-chip"
              type="button"
              onClick={() => setShowAllSetup((current) => !current)}
              aria-expanded={showAllSetup}
            >
              <span>{showAllSetup ? "Less" : "More filters"}</span>
              <small>{showAllSetup ? "Hide unused" : "Add others"}</small>
            </button>
          </div>
          <p className="small-note">Selected chips rank matching watch paths higher.</p>
        </div>

        <div className="coverage-panel">
          <div className="panel-title">
            <Calendar aria-hidden="true" />
            <span>Game Date</span>
          </div>
          <label className="date-field" htmlFor="game-date">
            <span>{dateLabel(selectedDate)}</span>
            <input
              id="game-date"
              type="date"
              value={selectedDate}
              onChange={(event) => chooseDate(event.target.value || todayDateKey())}
            />
          </label>
          <div className="date-strip" aria-label="Available game dates">
            {availableDates.map((date) => (
              <button
                className={selectedDate === date ? "is-selected" : ""}
                key={date}
                type="button"
                onClick={() => chooseDate(date)}
              >
                {dateLabel(date)}
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
          <p className="small-note">{dateGames.length} modeled games on {dateLabel(selectedDate)}.</p>
        </div>
      </section>

      <section className="workbench">
        <aside className="game-rail" aria-label="Game ledger">
          <div className="rail-header">
            <div>
              <p className="eyebrow">Canonical Ledger</p>
              <h2>{dateLabel(selectedDate)} Slate</h2>
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
              const paths = rankedPaths(game, capabilities, market);
              const best = paths[0];
              const owned = best ? isOwned(best, capabilities) : false;
              const bestLogo = best ? logoForPath(best, game) : null;
              return (
                <button
                  type="button"
                  key={game.id}
                  className={`game-row ${selectedGame.id === game.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedId(game.id)}
                >
                  <span className={`status-dot ${game.status}`} />
                  <TeamPair game={game} />
                  <span>
                    <strong>{game.shortName}</strong>
                    <small>{formatTime(game.kickoffUtc)} - {best ? best.label : "No video path"}</small>
                  </span>
                  <span className="mini-outlet" aria-hidden="true">
                    {bestLogo ? <LogoImage src={bestLogo.src} alt="" /> : best ? mediumIcon(best.medium) : null}
                  </span>
                  <em>{owned ? "Ready" : "Add"}</em>
                </button>
              );
            })}
            {filteredGames.length === 0 ? (
              <div className="empty-slate">
                <strong>No modeled games</strong>
                <span>Pick another date or clear search.</span>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="result-pane" aria-label="Selected game broadcast result">
          <div className="game-heading">
            <TeamPair game={selectedGame} size="large" />
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
            <OutletLogo path={primaryPath} game={selectedGame} className="primary-icon" />
            <div>
              <p className="eyebrow">Best Path For {market.city}</p>
              <h3>{primaryPath ? primaryPath.label : "No verified outlet"}</h3>
              <p>
                {primaryPath
                  ? `${primaryPath.network} - ${primaryPath.territory}`
                  : "A verified video or audio path has not been attached yet."}
              </p>
            </div>
            {primaryPath?.href ? (
              <a className="watch-button" href={primaryPath.href} rel="noreferrer" target="_blank">
                {primaryPath.ctaLabel ?? "Watch"}
              </a>
            ) : null}
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
                    <OutletLogo path={path} game={selectedGame} className="path-icon" />
                    <span className={`confidence-pill ${path.confidence}`}>
                      {stateLabel(path.confidence)}
                    </span>
                  </div>
                  <h3>{path.label}</h3>
                  <p>{path.network}</p>
                  <span className={`access-line ${owned ? "is-ready" : ""}`}>
                    {owned ? "Available with setup" : `Needs ${capabilityLabels[path.requirement as CapabilityKey] ?? "review"}`}
                  </span>
                  {path.href ? (
                    <a className="card-action" href={path.href} rel="noreferrer" target="_blank">
                      {path.ctaLabel ?? "Open watch page"}
                    </a>
                  ) : null}
                  <details className="path-detail">
                    <summary>Details</summary>
                    <dl>
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
                  </details>
                </article>
              );
            })}
          </div>

          <details className="service-hub info-disclosure" aria-label="Streaming and network services">
            <summary className="section-kicker">
              <span>
                <span className="eyebrow">More Info</span>
                <strong>Streaming Matrix</strong>
              </span>
              <em>Network and package guide</em>
            </summary>
            <div className="service-grid">
              {servicePackages.map((service) => {
                const active =
                  service.id in capabilities
                    ? capabilities[service.id as CapabilityKey]
                    : service.id === "nbc" || service.id === "cbs" || service.id === "fox";
                return (
                  <a className="service-card" href={service.href} key={service.id} rel="noreferrer" target="_blank">
                    <span className={`service-logo ${service.tone ?? ""}`}>
                      {service.logo ? (
                        <LogoImage src={service.logo} alt={`${service.label} logo`} />
                      ) : (
                        <span className={`text-logo ${service.tone ?? ""}`} aria-label={`${service.label} logo`} role="img">
                          {service.mark}
                        </span>
                      )}
                    </span>
                    <span>
                      <strong>{service.label}</strong>
                      <small>{service.window}</small>
                    </span>
                    <em>{active ? "In setup" : "Guide"}</em>
                    <p>{service.detail}</p>
                  </a>
                );
              })}
            </div>
          </details>

          <div className="detail-grid">
            <details className="ops-panel info-disclosure" aria-label="Change ledger">
              <summary className="panel-title">
                <Clock3 aria-hidden="true" />
                <span>Change Ledger</span>
              </summary>
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
            </details>

            <details className="ops-panel info-disclosure" aria-label="Source health">
              <summary className="panel-title">
                <AlertTriangle aria-hidden="true" />
                <span>Verification Queue</span>
              </summary>
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
            </details>
          </div>
        </section>
      </section>
    </main>
  );
}
