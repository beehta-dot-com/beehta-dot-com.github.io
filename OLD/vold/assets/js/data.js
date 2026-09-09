/* ============================================================
   DATA.JS
   The beehta.com catalogue  (stacked layout)

   This file is the whole CMS. To add, rename or remove an app,
   edit the array below and commit. There is no build step and no
   database: pushing this file is the entire publishing act.

   Same apps as the master-detail version, with four extra fields
   this layout has room for. Everything after `demo` is optional
   and is simply left out of the row when missing, so a new entry
   can start as three lines and grow.

   ------------------------------------------------------------
   FIELDS
   ------------------------------------------------------------
   id          short, unique, no spaces. Used in the URL hash so
               a single app can be linked to directly.
   name        shown as the row heading.
   tagline     three or four words under the name. What it is.
   category    free text. Anything used here becomes a filter.
   summary     a sentence or two. What it does.
   colour      the app's colour. Feeds the row icon, the featured
               wash, and the tile background.
   icon        one of the keys in ICONS at the top of explorer.js.
   status      "live"  the app exists and can be opened
               "beta"  usable, still moving
               "soon"  listed, nothing to open yet
   url         where "Open" goes. Omit for a "soon" app.
   demo        id of a demo registered in assets/demos/. Omit and
               the row shows the coming-soon panel instead.

   Optional extras
   ---------------
   version     shown next to the name, e.g. "v0.9.2"
   featured    true puts a badge on the row and a faint wash of
               the app's colour behind it
   domain      the address shown in the row and the preview bar.
               Defaults to <id>.beehta.com
   updated     free text, e.g. "Sep 2026"
   note        one line under the preview
   ------------------------------------------------------------
============================================================ */

var APPS = [
  {
    id: "logins",
    name: "Logins",
    tagline: "Account card board",
    category: "Personal",
    summary: "Keeps track of the accounts you have and how they connect to each other. It holds account details only, never a password.",
    colour: "#e8d3c0",
    icon: "key",
    status: "live",
    url: "https://logins.beehta.com",
    domain: "logins.beehta.com",
    demo: "logins",
    version: "v0.9.2",
    featured: true,
    updated: "Sep 2026",
    note: "Logins never stores a password. There is nothing in it worth stealing."
  },

  /* ----------------------------------------------------------
     PLACEHOLDERS

     The four below do not exist. The names and descriptions are
     invented so the page has something to show, and are meant to
     be rewritten or deleted. Each keeps its row and shows the
     coming-soon panel instead of a demo.
  ---------------------------------------------------------- */

  {
    id: "notes",
    name: "Notes",
    tagline: "Plain text, fast search",
    category: "Personal",
    summary: "Plain text notes with folders and fast search, for people who type quicker than they click.",
    colour: "#efe3c4",
    icon: "notebook",
    status: "soon"
  },
  {
    id: "split",
    name: "Split",
    tagline: "Shared costs",
    category: "Money",
    summary: "Work out who owes what after a shared trip, a shared flat, or a shared dinner.",
    colour: "#d7e2ce",
    icon: "split",
    status: "soon"
  },
  {
    id: "convert",
    name: "Convert",
    tagline: "One input box",
    category: "Utilities",
    summary: "Units, currencies and file formats from a single input box. No adverts, no sign up.",
    colour: "#d2dfe8",
    icon: "swap",
    status: "soon"
  },
  {
    id: "shelf",
    name: "Shelf",
    tagline: "Things you own",
    category: "Personal",
    summary: "A list of the books, films and things you own, lent out, or mean to get round to.",
    colour: "#e0d8e6",
    icon: "shelf",
    status: "soon"
  }
];

/* ------------------------------------------------------------
   The background palette

   The app colours, plus a lighter tint of each and two papers,
   so the tile field has range without drifting off the brand.
   tiles.js reads this. Changing an app's colour above changes
   the background too.
------------------------------------------------------------ */

var TILE_COLOURS = APPS.map(function (app) { return app.colour; }).concat([
  "#f2e6da",  // clay, lighter
  "#f6efdc",  // wheat, lighter
  "#e6eee0",  // sage, lighter
  "#e4ecf2",  // sky, lighter
  "#ece6f0",  // lilac, lighter
  "#f2ede3",  // paper
  "#eae4d8"   // paper, deeper
]);

window.APPS = APPS;
window.TILE_COLOURS = TILE_COLOURS;
