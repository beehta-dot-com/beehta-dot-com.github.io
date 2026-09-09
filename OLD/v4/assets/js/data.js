/* ============================================================
   DATA.JS
   This file is the content source for beehta.com. There is no
   database and no admin backend: to add, edit, reorder, hide or
   remove an application, edit the APPS array below and commit
   the change. The public site (main.js) renders directly from
   this file. Think of it as a git-based CMS.

   ── Adding a new application ──────────────────────────────
   1. Copy an existing object in APPS as a template.
   2. Give it a unique numeric "id".
   3. Fill in every field (leave optional fields as null/"" if
      genuinely not applicable, don't invent data).
   4. If it introduces a new category, add a matching entry to
      CATEGORY_STYLES below.
   5. Set "sortOrder" to control its position (lower = earlier).

   ── Field reference ────────────────────────────────────────
   id            number   Unique, stable. Never reuse a retired id.
   name          string   Display name.
   shortName     string   Used in compact contexts (mobile chips).
   tagline       string   One line, shown under the name.
   description   string   1–2 factual sentences. What it does.
   category      string   Must match a CATEGORY_STYLES key.
   tags          string[] Lowercase, used for search.
   subdomain     string   e.g. "send.beehta.com" (display only).
   url           string   Full URL the "Open application" opens.
   demoUrl       string   Live demo URL, or "" if none exists.
   allowEmbed    bool     Reserved field; the directory now shows
                           an illustrative card for every app and
                           links out to demoUrl rather than
                           embedding it, so this is informational.
   thumbnail     string   Path to a real screenshot, or "" to
                           keep the illustrated icon card.
   previewAspect string   "16:9" | "9:16" | "4:3"
   status        string   "active" | "beta" | "maintenance" |
                           "archived" | "private" | "soon"
   version       string   e.g. "1.4.0", or "" if unversioned.
   launchDate    string   "YYYY-MM" or "".
   updatedDate   string   "YYYY-MM-DD" or "".
   docsUrl       string   Documentation URL, or "".
   repoUrl       string   Source repository URL, or "".
   featured      bool     Slightly higher editorial placement.
   visible       bool     false hides it from the public site
                           without deleting the record.
   sortOrder     number   Manual ordering, ascending.
   color         string   Card illustration background (soft tint).
   iconColor     string   Icon stroke/fill + blob accent.
   logo          string   Raw inline SVG markup for the icon.
─────────────────────────────────────────────────────────── */

/* ── Site Configuration ────────────────────────────────── */
const SITE_CONFIG = {
  name:        "beehta.com",
  tagline:     "A collection of small applications for everyday digital work.",
  authorEmail: "emails@beehta.com",
};

/* ── Category Styles ────────────────────────────────────── */
const CATEGORY_STYLES = {
  Productivity: { color: "#96762B" },
  Finance:      { color: "#5F7A54" },
  Utilities:    { color: "#C1614A" },
  Social:       { color: "#B15D82" },
  Security:     { color: "#4C6C8C" },
  Experimental: { color: "#8A7F98" },
};

/* ── Applications ───────────────────────────────────────── */
const APPS = [
  {
    id: 1,
    name: "ThruWifi",
    shortName: "ThruWifi",
    tagline: "Wi-Fi P2P transfer",
    description: "Share files and text between devices connected to the same LAN or Wi-Fi network. No account, no cloud upload.",
    category: "Utilities",
    tags: ["files", "transfer", "wifi", "lan", "p2p"],
    subdomain: "send.beehta.com",
    url: "https://send.beehta.com",
    demoUrl: "https://send.beehta.com/demo",
    allowEmbed: false,
    thumbnail: "",
    previewAspect: "16:9",
    status: "active",
    version: "1.4.0",
    launchDate: "2024-11",
    updatedDate: "2026-06-02",
    docsUrl: "",
    repoUrl: "",
    featured: true,
    visible: true,
    sortOrder: 1,
    color: "#F3DCD1",
    iconColor: "#C1614A",
    logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="9"  width="16" height="3" rx="1.5" fill="#C1614A" opacity="0.3"/>
      <rect x="7" y="15" width="22" height="3" rx="1.5" fill="#C1614A" opacity="0.6"/>
      <rect x="7" y="21" width="13" height="3" rx="1.5" fill="#C1614A" opacity="0.85"/>
      <circle cx="28" cy="28" r="7" fill="#C1614A"/>
      <path d="M24.5 28l2.8 2.8L31.5 24" stroke="#F3DCD1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 2,
    name: "Authistant",
    shortName: "Authistant",
    tagline: "Logins manager",
    description: "Keeps track of every login without storing passwords directly. Password hints only, decrypted locally when you need them.",
    category: "Security",
    tags: ["passwords", "logins", "security", "hints"],
    subdomain: "logins.beehta.com",
    url: "https://logins.beehta.com",
    demoUrl: "https://logins.beehta.com/demo",
    allowEmbed: false,
    thumbnail: "",
    previewAspect: "16:9",
    status: "beta",
    version: "0.9.2",
    launchDate: "2025-08",
    updatedDate: "2026-07-14",
    docsUrl: "",
    repoUrl: "",
    featured: false,
    visible: true,
    sortOrder: 2,
    color: "#DCE3EA",
    iconColor: "#4C6C8C",
    logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="19" cy="19" r="13" stroke="#4C6C8C" stroke-width="2.5" opacity="0.3"/>
      <circle cx="19" cy="19" r="13" stroke="#4C6C8C" stroke-width="2.5" stroke-dasharray="30 52" stroke-linecap="round"/>
      <path d="M19 9v2M19 27v2" stroke="#4C6C8C" stroke-width="2" stroke-linecap="round"/>
      <path d="M14.5 15h6a2.5 2.5 0 0 1 0 5h-3a2.5 2.5 0 0 0 0 5h6" stroke="#4C6C8C" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 3,
    name: "Star Birthday",
    shortName: "Star Birthday",
    tagline: "Star birthday calculator",
    description: "Calculates the date the light from a chosen star, visible on the day you were born, is currently reaching from that star's frame.",
    category: "Utilities",
    tags: ["astronomy", "calculator", "stars", "birthday"],
    subdomain: "star.beehta.com",
    url: "https://star.beehta.com",
    demoUrl: "https://star.beehta.com/demo",
    allowEmbed: false,
    thumbnail: "",
    previewAspect: "16:9",
    status: "active",
    version: "2.1.0",
    launchDate: "2023-05",
    updatedDate: "2026-03-11",
    docsUrl: "",
    repoUrl: "",
    featured: false,
    visible: true,
    sortOrder: 3,
    color: "#E6E1EF",
    iconColor: "#7A6A9E",
    logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="5" width="22" height="28" rx="3.5" fill="#7A6A9E" opacity="0.12"/>
      <rect x="7" y="5" width="22" height="28" rx="3.5" stroke="#7A6A9E" stroke-width="2.2"/>
      <path d="M12 14h14M12 19h14M12 24h9" stroke="#7A6A9E" stroke-width="2" stroke-linecap="round"/>
      <circle cx="27" cy="8" r="5.5" fill="#7A6A9E"/>
      <path d="M24.5 8h5M27 5.5V11" stroke="#E6E1EF" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 4,
    name: "AllCards",
    shortName: "AllCards",
    tagline: "Structured data as cards",
    description: "Turns tabular or structured data into a browsable card view, for cases where a spreadsheet is harder to scan than a stack of records.",
    category: "Productivity",
    tags: ["data", "cards", "spreadsheet", "browse"],
    subdomain: "cards.beehta.com",
    url: "https://cards.beehta.com",
    demoUrl: "https://cards.beehta.com/demo",
    allowEmbed: false,
    thumbnail: "",
    previewAspect: "16:9",
    status: "active",
    version: "1.0.3",
    launchDate: "2025-01",
    updatedDate: "2026-01-27",
    docsUrl: "",
    repoUrl: "",
    featured: false,
    visible: true,
    sortOrder: 4,
    color: "#F1E4C4",
    iconColor: "#96762B",
    logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="19" cy="15" r="6" fill="#96762B" opacity="0.9"/>
      <path d="M19 5v3M19 24v3M8 15H5M32 15h-3M11.5 7.5l2 2M25.5 23.5l2 2M25.5 7.5l-2 2M11.5 23.5l-2 2" stroke="#96762B" stroke-width="2" stroke-linecap="round"/>
      <path d="M7 30c0-3.5 2.5-6 6-6 1.2 0 2.3.35 3.2.95C17 23.37 18.8 22 21 22c3.3 0 6 2.7 6 6" stroke="#96762B" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
    </svg>`,
  },
];
