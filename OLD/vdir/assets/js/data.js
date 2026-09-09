/* ============================================================
   DATA.JS
   The beehta.com catalogue

   This file is the whole CMS. To add, rename or remove an app,
   edit the array below and commit. There is no build step and no
   database: pushing this file is the entire publishing act.

   ------------------------------------------------------------
   FIELDS
   ------------------------------------------------------------
   id        short, unique, no spaces. Used in the URL hash so a
             single app can be linked to, and as its subdomain.
   name      shown as the entry heading.
   category  free text. Anything used here becomes a filter, and
             is shown as the small label above the name.
   summary   what problem this app solves, in a sentence or two.
             Written for somebody who has never heard of it.
   colour    the app's colour. Also feeds the tile background.
   status    "live" ready to use, listed under Available now
             "soon" listed under Coming soon, with no preview
   url       where "Open" goes. Omit for a "soon" app.
   demo      id of a preview registered in assets/demos/. Omit and
             the entry is listed without one.
   note      one line under the preview. Optional.
   ------------------------------------------------------------
============================================================ */

/* The search box and the category filters appear once the
   catalogue is long enough to need them. Below this, the whole
   shelf fits on one screen of scrolling and a filter row is
   furniture. */
var TOOLS_FROM = 7;

var APPS = [
  {
    id: "logins",
    name: "Logins",
    category: "Personal",
    summary: "Keep your online accounts organised in one place. Store account details, group related services, and quickly find what you need.",
    colour: "#e8d3c0",
    status: "live",
    url: "https://logins.beehta.com",
    demo: "logins",
    note: "Logins never stores a password. It holds account details only, so there is nothing in it worth stealing."
  },

  /* ----------------------------------------------------------
     NOT BUILT YET

     The four below do not exist. The names and descriptions are
     invented so the shelf has something to show, and are meant
     to be rewritten or deleted. They are listed under Coming
     soon and carry no preview, because there is nothing to
     preview.
  ---------------------------------------------------------- */

  {
    id: "notes",
    name: "Notes",
    category: "Personal",
    summary: "A deliberately simple place for notes, snippets, and things you do not want to lose.",
    colour: "#efe3c4",
    status: "soon"
  },
  {
    id: "split",
    name: "Split",
    category: "Money",
    summary: "Split a dinner, a trip, rent, or any shared expense without doing the maths yourself.",
    colour: "#d7e2ce",
    status: "soon"
  },
  {
    id: "convert",
    name: "Convert",
    category: "Utilities",
    summary: "Convert units, currencies, and common formats from one place. No account required.",
    colour: "#d2dfe8",
    status: "soon"
  },
  {
    id: "shelf",
    name: "Shelf",
    category: "Personal",
    summary: "Keep track of books, films, and other things you own, have lent out, or want to get to someday.",
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
