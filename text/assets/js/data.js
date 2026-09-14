/* ============================================================
   DATA.JS
   The beehta.com catalogue

   This file is the whole CMS. To add, rename or remove something,
   edit the array below and commit. There is no build step and no
   database: pushing this file is the entire publishing act.

   ------------------------------------------------------------
   TWO KINDS OF THING LIVE HERE
   ------------------------------------------------------------
   beehta.com is not only a shelf of full web apps. Roughly half
   of it is single-purpose pages: a calculator, a generator, an
   editor. You open one, get your answer, and close the tab. They
   have no account, keep nothing, and are finished in the sense
   that a hammer is finished.

   The rest are proper web apps: they hold your work, they have
   an account behind them, and you come back to them for months.

   kind decides which of the two an entry is, and the page says so
   plainly rather than pretending everything on the shelf is the
   same size.

     "page"  a single-purpose static page. No account, nothing
             saved, nothing sent. Loads in one request.
     "app"   a full web app with an account behind it.

   ------------------------------------------------------------
   THE OTHER FIELDS
   ------------------------------------------------------------
   id        short, unique, no spaces. Used as the subdomain and
             in the URL hash, so a single entry can be linked to.
   name      shown as the entry heading and in the mobile pager.
   category  free text. Anything used here becomes a filter.
   summary   what problem this solves, in a sentence or two.
   colour    the entry's colour, used for its marker in the list.
   status    "live"  ready to use, listed under Available now
             "soon"  listed under Coming soon, with no preview
   url       where "Open" goes. Omit for a "soon" entry.
   demo      id of a preview registered on window.BeehtaDemos.
   added     the day it went live, as YYYY-MM-DD. Shown on the
             entry, and anything added inside the last month is
             marked NEW in the list. Omit for a "soon" entry:
             nothing has been released yet.
   updated   the day it last changed, as YYYY-MM-DD. Shown on the
             entry beside the release date. Keep it honest; a date
             that never moves says more than a wrong one.
   ------------------------------------------------------------
============================================================ */

/* How long an entry wears the NEW mark, in days. One month is
   long enough for somebody who visits now and then to notice, and
   short enough that the mark still means something. */
var NEW_FOR_DAYS = 31;

var APPS = [

  /* ---------- pages: open it, use it, close it ---------- */

  {
    id: "average",
    name: "Average Down",
    kind: "page",
    category: "Money",
    summary: "Work out your new average price after buying more of something that has fallen, and see exactly where you break even.",
    colour: "#d7e2ce",
    status: "live",
    url: "https://average.beehta.com",
    demo: "average",
    added: "2026-03-14",
    updated: "2026-07-02"
  },
  {
    id: "split",
    name: "Split",
    kind: "page",
    category: "Money",
    summary: "Split a bill between people who did not all order the same thing. Put the extras against whoever had them and the rest divides evenly.",
    colour: "#e8d3c0",
    status: "live",
    url: "https://split.beehta.com",
    demo: "split",
    added: "2026-05-02",
    updated: "2026-08-19"
  },
  {
    id: "numerology",
    name: "Numerology",
    kind: "page",
    category: "Curiosities",
    summary: "Reduce a name and a date of birth to their numbers, with every step of the arithmetic shown rather than hidden.",
    colour: "#e0d8e6",
    status: "live",
    url: "https://numerology.beehta.com",
    demo: "numerology",
    added: "2026-06-21",
    updated: "2026-06-21"
  },
  {
    id: "json",
    name: "JSON Kit",
    kind: "page",
    category: "Developer",
    summary: "Paste JSON to format, minify or check it, and see where a broken one actually breaks instead of guessing.",
    colour: "#d2dfe8",
    status: "live",
    url: "https://json.beehta.com",
    demo: "json",
    added: "2026-08-25",
    updated: "2026-09-01"
  },
  {
    id: "itinerary",
    name: "Itinerary",
    kind: "page",
    category: "Travel",
    summary: "Lay a trip out day by day, move things about until the order makes sense, and take the plan away as plain text.",
    colour: "#efe3c4",
    status: "live",
    url: "https://itinerary.beehta.com",
    demo: "itinerary",
    added: "2026-09-01",
    updated: "2026-09-04"
  },
  {
    id: "convert",
    name: "Convert",
    kind: "page",
    category: "Everyday",
    summary: "Units, sizes and the handful of conversions worth having on one page instead of five search results.",
    colour: "#e6eee0",
    status: "soon"
  },
  {
    id: "timezones",
    name: "Timezones",
    kind: "page",
    category: "Travel",
    summary: "Line several cities up against each other and find the hour that is not the middle of the night for somebody.",
    colour: "#e4ecf2",
    status: "soon"
  },
  {
    id: "loan",
    name: "Loan",
    kind: "page",
    category: "Money",
    summary: "What a loan actually costs over its life, and what one extra payment a year takes off the end of it.",
    colour: "#f2e6da",
    status: "soon"
  },

  /* ---------- apps: an account, and your work kept ---------- */

  {
    id: "logins",
    name: "Logins",
    kind: "app",
    category: "Everyday",
    summary: "Keep track of the accounts you have, what each one signs in with, and what breaks if you lose the email behind them.",
    colour: "#c98a5e",
    status: "live",
    url: "https://logins.beehta.com",
    demo: "logins",
    added: "2026-01-20",
    updated: "2026-08-30"
  },
  {
    id: "portfolio",
    name: "Portfolio",
    kind: "app",
    category: "Money",
    summary: "One view of what you hold, what it cost and what it is doing now, without a broker dashboard shouting at you.",
    colour: "#7a9a6b",
    status: "soon"
  },
  {
    id: "trips",
    name: "Trips",
    kind: "app",
    category: "Travel",
    summary: "Keep a trip's bookings, plans and costs together from the first idea to the last receipt, and share it with whoever is coming.",
    colour: "#c0574a",
    status: "soon"
  },
  {
    id: "reviews",
    name: "Reviews",
    kind: "app",
    category: "Work",
    summary: "Run a performance review cycle end to end: goals, self assessment, manager notes, and a record that survives the reorganisation.",
    colour: "#5d7a92",
    status: "soon"
  },
  {
    id: "circles",
    name: "Circles",
    kind: "app",
    category: "People",
    summary: "A small social network built around the people you actually know, with no ranked feed and nothing to go viral on.",
    colour: "#8d7aa3",
    status: "soon"
  },
  {
    id: "notes",
    name: "Notes",
    kind: "app",
    category: "Everyday",
    summary: "A deliberately plain place for notes and snippets that follows you between machines and stays out of the way.",
    colour: "#6f8f7a",
    status: "soon"
  }
];

/* ------------------------------------------------------------
   The background palette

   Kept separate from the entry colours. There are fourteen of
   those now, and a background built out of all of them would be a
   fruit salad. This is a chosen set the tiles can shuffle without
   ever landing on an ugly pair.
------------------------------------------------------------ */

var TILE_COLOURS = [
  "#e8d3c0",  // clay
  "#efe3c4",  // wheat
  "#d7e2ce",  // sage
  "#d2dfe8",  // sky
  "#e0d8e6",  // lilac
  "#f2e6da",  // clay, lighter
  "#f6efdc",  // wheat, lighter
  "#e6eee0",  // sage, lighter
  "#e4ecf2",  // sky, lighter
  "#ece6f0",  // lilac, lighter
  "#f2ede3",  // paper
  "#eae4d8"   // paper, deeper
];

window.APPS = APPS;
window.TILE_COLOURS = TILE_COLOURS;
window.NEW_FOR_DAYS = NEW_FOR_DAYS;
