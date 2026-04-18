/* ============================================================
   DATA.JS - Editable app data and site configuration

   HOW TO USE:
   - Edit SITE_CONFIG to change site identity.
   - Add/edit/remove entries in APPS to manage the app grid.
   - Add a matching entry in CATEGORY_STYLES when using a new category.
============================================================ */

/* ── Site Configuration ────────────────────────────────── */
const SITE_CONFIG = {
  name:        "beehta.com",
  tagline:     "Your Digital Workspace",
  // authorName:  "kash-pram",
  authorEmail: "emails@beehta.com",
  // github:      "https://github.com/kash-pram",
  // linkedin:    "https://www.linkedin.com/in/kash-pram",
};

/* ── Category Styles ───────────────────────────────────────
   Keys must match the "category" field in APPS below.
   Add a new entry here whenever you introduce a new category.
   bg    - badge background colour (light pastel)
   color - badge text / icon colour (darker shade)
─────────────────────────────────────────────────────────── */
const CATEGORY_STYLES = {
  Productivity: { bg: "#E5F1FF", color: "#0066CC" },
  Finance:      { bg: "#E5F7EE", color: "#1B8A4C" },
  // Health:       { bg: "#F0E5FF", color: "#6A00E0" },
  Utilities:    { bg: "#FFF5E5", color: "#C97A00" },
  Social:    { bg: "#FFF0E5", color: "#D44E00" },
  // Analytics:    { bg: "#FFE5E5", color: "#CC1B1B" },
  // Education:    { bg: "#E5FFF0", color: "#00743A" },
  // Design:       { bg: "#FFF0E8", color: "#B84200" },
};

/* ── App List ───────────────────────────────────────────────
   Each object = one card on the landing page.

   Fields
   -------
   id          Unique integer
   name        Display name shown on the card
   tagline     Short subtitle beneath the name
   description 1–2 sentence blurb (supports basic HTML entities)
   category    Must match a key in CATEGORY_STYLES
   url         Where "Open →" links to. Use "#" as a placeholder.
   color       Pastel background fill for the icon square
   iconColor   Accent colour used inside the inline SVG logo
   rating      Star rating string, e.g. "4.8"
   reviews     Review-count string, e.g. "2.1k"
   isNew       true → green "New" badge
   isFeatured  true → orange "Featured" badge (overrides isNew)
   logo        Raw inline SVG string for the app icon
─────────────────────────────────────────────────────────── */
const APPS = [
  {
    id: 1,
    name: "ThruWifi",
    tagline: "Wifi P2P Transfer",
    description: "Share files and text between devices connected through same LAN / Wi-Fi.",
    category: "Utilities",
    url: "https://send.beehta.com",
    color: "#FFD6E7",
    iconColor: "#D63384",
    rating: "4.9",
    reviews: "2.1k",
    isNew: false,
    isFeatured: true,
    logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="9"  width="16" height="3" rx="1.5" fill="#D63384" opacity="0.25"/>
      <rect x="7" y="15" width="22" height="3" rx="1.5" fill="#D63384" opacity="0.55"/>
      <rect x="7" y="21" width="13" height="3" rx="1.5" fill="#D63384" opacity="0.80"/>
      <circle cx="28" cy="28" r="7" fill="#D63384"/>
      <path d="M24.5 28l2.8 2.8L31.5 24" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 2,
    name: "Authistant",
    tagline: "Logins Manager",
    description: "Manage all the logins at one place without having to save password but through password hints",
    category: "Utilities",
    url: "https://logins.beehta.com",
    color: "#C9F7DC",
    iconColor: "#1B8A4C",
    rating: "4.7",
    reviews: "1.8k",
    isNew: true,
    isFeatured: false,
    logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="19" cy="19" r="13" stroke="#1B8A4C" stroke-width="2.5" opacity="0.25"/>
      <circle cx="19" cy="19" r="13" stroke="#1B8A4C" stroke-width="2.5" stroke-dasharray="30 52" stroke-linecap="round"/>
      <path d="M19 9v2M19 27v2" stroke="#1B8A4C" stroke-width="2" stroke-linecap="round"/>
      <path d="M14.5 15h6a2.5 2.5 0 0 1 0 5h-3a2.5 2.5 0 0 0 0 5h6" stroke="#1B8A4C" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  // {
  //   id: 3,
  //   name: "CloudNotes",
  //   tagline: "Rich Text Note Taking",
  //   description: "Capture every idea with rich formatting, embedded images, inline code, and smart tags. Syncs instantly across all your devices.",
  //   category: "Productivity",
  //   url: "#",
  //   color: "#D0E9FF",
  //   iconColor: "#0066CC",
  //   rating: "4.8",
  //   reviews: "3.4k",
  //   isNew: false,
  //   isFeatured: false,
  //   logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <rect x="7" y="5" width="22" height="28" rx="3.5" fill="#0066CC" opacity="0.10"/>
  //     <rect x="7" y="5" width="22" height="28" rx="3.5" stroke="#0066CC" stroke-width="2.2"/>
  //     <path d="M12 14h14M12 19h14M12 24h9" stroke="#0066CC" stroke-width="2" stroke-linecap="round"/>
  //     <circle cx="27" cy="8" r="5.5" fill="#0066CC"/>
  //     <path d="M24.5 8h5M27 5.5V11" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
  //   </svg>`,
  // },
  // {
  //   id: 4,
  //   name: "WeatherVue",
  //   tagline: "Live Weather Dashboard",
  //   description: "Real-time conditions, hourly and 7-day forecasts, severe weather alerts, and animated radar maps for any location worldwide.",
  //   category: "Utilities",
  //   url: "#",
  //   color: "#FFF5CC",
  //   iconColor: "#C97A00",
  //   rating: "4.6",
  //   reviews: "987",
  //   isNew: false,
  //   isFeatured: false,
  //   logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <circle cx="19" cy="15" r="6" fill="#C97A00" opacity="0.9"/>
  //     <path d="M19 5v3M19 24v3M8 15H5M32 15h-3M11.5 7.5l2 2M25.5 23.5l2 2M25.5 7.5l-2 2M11.5 23.5l-2 2" stroke="#C97A00" stroke-width="2" stroke-linecap="round"/>
  //     <path d="M7 30c0-3.5 2.5-6 6-6 1.2 0 2.3.35 3.2.95C17 23.37 18.8 22 21 22c3.3 0 6 2.7 6 6" stroke="#C97A00" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
  //   </svg>`,
  // },
  // {
  //   id: 5,
  //   name: "FitTrack",
  //   tagline: "Fitness &amp; Health Monitor",
  //   description: "Log workouts, track macros, monitor body metrics with charts, and access hundreds of guided exercise plans tailored to your goals.",
  //   category: "Health",
  //   url: "#",
  //   color: "#EAD9FF",
  //   iconColor: "#6A00E0",
  //   rating: "4.9",
  //   reviews: "4.2k",
  //   isNew: false,
  //   isFeatured: true,
  //   logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <path d="M5 19h5l3.5-9 4.5 15.5L22 17l3 4.5H33" stroke="#6A00E0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  //     <circle cx="29" cy="10" r="4.5" fill="#6A00E0" opacity="0.2" stroke="#6A00E0" stroke-width="1.5"/>
  //     <circle cx="29" cy="10" r="2" fill="#6A00E0"/>
  //   </svg>`,
  // },
  // {
  //   id: 6,
  //   name: "RecipeBox",
  //   tagline: "Recipe Organiser &amp; Meal Planner",
  //   description: "Discover thousands of recipes, save favourites, plan your weekly meals, auto-generate shopping lists, and manage your pantry inventory.",
  //   category: "Social",
  //   url: "#",
  //   color: "#FFE3CC",
  //   iconColor: "#D44E00",
  //   rating: "4.5",
  //   reviews: "1.2k",
  //   isNew: true,
  //   isFeatured: false,
  //   logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <path d="M12 7c0 3.5-2.5 6-2.5 9.5S12 21 12 24.5V32" stroke="#D44E00" stroke-width="2.2" stroke-linecap="round"/>
  //     <path d="M19 7v7a4.5 4.5 0 0 1-4.5 4.5" stroke="#D44E00" stroke-width="2.2" stroke-linecap="round"/>
  //     <path d="M26 7v25" stroke="#D44E00" stroke-width="2.2" stroke-linecap="round"/>
  //     <path d="M22.5 7v9h7V7" stroke="#D44E00" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  //   </svg>`,
  // },
  // {
  //   id: 7,
  //   name: "CalPro",
  //   tagline: "Smart Calendar &amp; Scheduler",
  //   description: "Never miss an event with smart scheduling, cross-device sync, shared team calendars, meeting time finder, and automated follow-up reminders.",
  //   category: "Productivity",
  //   url: "#",
  //   color: "#C8F5F0",
  //   iconColor: "#007A70",
  //   rating: "4.7",
  //   reviews: "2.8k",
  //   isNew: false,
  //   isFeatured: false,
  //   logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <rect x="5" y="8" width="28" height="25" rx="4" stroke="#007A70" stroke-width="2.2"/>
  //     <path d="M5 15h28" stroke="#007A70" stroke-width="2.2"/>
  //     <path d="M13 5v6M25 5v6" stroke="#007A70" stroke-width="2.2" stroke-linecap="round"/>
  //     <rect x="10" y="20" width="5.5" height="5.5" rx="1.5" fill="#007A70" opacity="0.55"/>
  //     <rect x="22.5" y="20" width="5.5" height="5.5" rx="1.5" fill="#007A70" opacity="0.3"/>
  //     <rect x="10" y="27.5" width="5.5" height="2.5" rx="1" fill="#007A70" opacity="0.3"/>
  //   </svg>`,
  // },
  // {
  //   id: 8,
  //   name: "DataViz",
  //   tagline: "Analytics &amp; Chart Builder",
  //   description: "Transform raw data into beautiful interactive charts, graphs, and dashboards. Import CSV or Excel, or connect directly to your APIs.",
  //   category: "Analytics",
  //   url: "#",
  //   color: "#FFD8D8",
  //   iconColor: "#CC1B1B",
  //   rating: "4.8",
  //   reviews: "1.5k",
  //   isNew: false,
  //   isFeatured: false,
  //   logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <rect x="5"  y="22" width="6" height="11" rx="2" fill="#CC1B1B" opacity="0.4"/>
  //     <rect x="14" y="15" width="6" height="18" rx="2" fill="#CC1B1B" opacity="0.65"/>
  //     <rect x="23" y="8"  width="6" height="25" rx="2" fill="#CC1B1B"/>
  //     <path d="M8 22l5.5-7 3.5 6 6.5-10 4 5.5" stroke="#CC1B1B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/>
  //   </svg>`,
  // },
  // {
  //   id: 9,
  //   name: "FormCraft",
  //   tagline: "Drag &amp; Drop Form Builder",
  //   description: "Build beautiful responsive forms, surveys, and quizzes visually with no code. Collect responses, analyse results, and export data easily.",
  //   category: "Utilities",
  //   url: "#",
  //   color: "#D9F0FF",
  //   iconColor: "#0056A3",
  //   rating: "4.6",
  //   reviews: "890",
  //   isNew: true,
  //   isFeatured: false,
  //   logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <rect x="6" y="7" width="26" height="24" rx="4" stroke="#0056A3" stroke-width="2.2"/>
  //     <rect x="11" y="13" width="16" height="3.5" rx="1.5" stroke="#0056A3" stroke-width="1.8"/>
  //     <rect x="11" y="20" width="16" height="3.5" rx="1.5" stroke="#0056A3" stroke-width="1.8"/>
  //     <circle cx="29" cy="32" r="6" fill="#0056A3"/>
  //     <path d="M26.5 32h5M29 29.5V35" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
  //   </svg>`,
  // },
  // {
  //   id: 10,
  //   name: "LinkVault",
  //   tagline: "Bookmark Manager",
  //   description: "Save, tag, and rediscover your favourite links with smart folders, full-page search, reading time estimates, and one-click import.",
  //   category: "Utilities",
  //   url: "#",
  //   color: "#FCEAFF",
  //   iconColor: "#8B00CC",
  //   rating: "4.4",
  //   reviews: "640",
  //   isNew: false,
  //   isFeatured: false,
  //   logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <path d="M10 5h18a3 3 0 0 1 3 3v24l-12-7L7 32V8a3 3 0 0 1 3-3z" stroke="#8B00CC" stroke-width="2.2" stroke-linejoin="round"/>
  //     <path d="M14 14h10" stroke="#8B00CC" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  //     <path d="M14 19h6" stroke="#8B00CC" stroke-width="2" stroke-linecap="round" opacity="0.35"/>
  //   </svg>`,
  // },
  // {
  //   id: 11,
  //   name: "QuizMaster",
  //   tagline: "Interactive Quiz &amp; Learning",
  //   description: "Create engaging quizzes, flash cards, and learning paths. Track learner progress, add timers, and share with students or your team.",
  //   category: "Education",
  //   url: "#",
  //   color: "#D4F5E2",
  //   iconColor: "#00743A",
  //   rating: "4.7",
  //   reviews: "1.1k",
  //   isNew: true,
  //   isFeatured: false,
  //   logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <circle cx="19" cy="19" r="13" stroke="#00743A" stroke-width="2.2"/>
  //     <path d="M15 15.5a4 4 0 1 1 5.2 3.8c-.7.2-1.2.8-1.2 1.7V23" stroke="#00743A" stroke-width="2.2" stroke-linecap="round"/>
  //     <circle cx="19" cy="27" r="1.5" fill="#00743A"/>
  //   </svg>`,
  // },
  // {
  //   id: 12,
  //   name: "PixelCrop",
  //   tagline: "Online Image Editor",
  //   description: "Crop, resize, compress, and apply filters to images right in your browser. Batch process multiple files and export in any format.",
  //   category: "Design",
  //   url: "#",
  //   color: "#FFE8D0",
  //   iconColor: "#B84200",
  //   rating: "4.5",
  //   reviews: "760",
  //   isNew: false,
  //   isFeatured: false,
  //   logo: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <rect x="6" y="6" width="26" height="26" rx="4" stroke="#B84200" stroke-width="2.2"/>
  //     <circle cx="14" cy="14" r="3" fill="#B84200" opacity="0.5"/>
  //     <path d="M6 26l8-8 5 5 4-4 9 7" stroke="#B84200" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  //   </svg>`,
  // },
];
