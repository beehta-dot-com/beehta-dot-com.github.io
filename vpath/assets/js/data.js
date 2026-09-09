/* ============================================================
   DATA.JS
   The beehta.com catalogue

   This file is the whole CMS. To add, rename or remove an app,
   edit the array below and commit. There is no build step and no
   database: pushing this file is the entire publishing act.

   ------------------------------------------------------------
   FIELDS
   ------------------------------------------------------------
   id          short, unique, no spaces. Used in the URL hash so
               a preview can be linked to directly.
   name        shown in the list, the tab strip and the preview.
   category    free text. Anything used here shows up as a filter
               once the catalogue passes TOOLS_FROM entries.
   summary     one line, shown under the name in the list.
   colour      the app's colour. Also feeds the tile background,
               so the page is literally made of these.
   status      "live"  the app exists and can be opened
               "soon"  listed, but nothing to open yet
   url         where "Open" goes. Omit for a "soon" app.
   demo        id of a demo registered in assets/demos/. Omit and
               the preview shows the coming-soon placeholder.
   note        one line under the preview. Optional.
   ------------------------------------------------------------
============================================================ */

/* Search and category filters stay hidden until the catalogue is
   big enough to need them. A filter row above five items is
   furniture, not help. */
var TOOLS_FROM = 7;

var APPS = [
  {
    id: "logins",
    name: "Logins",
    category: "Personal",
    summary: "A card board for keeping track of the accounts you have and how they connect to each other.",
    colour: "#e8d3c0",
    status: "live",
    url: "https://logins.beehta.com",
    demo: "logins",
    note: "Logins never stores a password. It holds account details only, so there is nothing in it worth stealing."
  },

  /* ----------------------------------------------------------
     PLACEHOLDERS

     The four below do not exist. The names and descriptions are
     invented so the page has something to show, and are meant to
     be rewritten or deleted. Each one keeps its slot in the list
     and shows the coming-soon panel instead of a demo.
  ---------------------------------------------------------- */

  {
    id: "notes",
    name: "Notes",
    category: "Personal",
    summary: "Plain text notes with folders and fast search, for people who type quicker than they click.",
    colour: "#efe3c4",
    status: "soon"
  },
  {
    id: "split",
    name: "Split",
    category: "Money",
    summary: "Work out who owes what after a shared trip, a shared flat, or a shared dinner.",
    colour: "#d7e2ce",
    status: "soon"
  },
  {
    id: "convert",
    name: "Convert",
    category: "Utilities",
    summary: "Units, currencies and file formats from a single input box. No adverts, no sign up.",
    colour: "#d2dfe8",
    status: "soon"
  },
  {
    id: "shelf",
    name: "Shelf",
    category: "Personal",
    summary: "A list of the books, films and things you own, lent out, or mean to get round to.",
    colour: "#e0d8e6",
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
window.TOOLS_FROM = TOOLS_FROM;
