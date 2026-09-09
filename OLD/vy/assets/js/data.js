/* ============================================================
   DATA.JS
   beehta.com app catalogue

   This file is the whole CMS. To add, remove or edit an app,
   just edit the array below and commit the change to GitHub.
   If the site is hosted on GitHub Pages, Netlify or similar,
   pushing this file is the entire publishing step, no build
   tools or database required.

   FIELD REFERENCE
   ----------------------------------------------------------
   id           string, unique, used internally (no spaces)
   name         string, shown as the app title
   category     string, must match one of CATEGORIES below
   description  string, one line, shown in the app list
   icon         string, one of the keys in ICONS (main.js)
   url          string, the app's real address, used for the
                "Open application" link
   demo.type    "iframe" to embed the live app, or "image" to
                show a screenshot instead (safer default, some
                apps block embedding)
   demo.src     iframe: the URL to embed
                image: path to a screenshot file
   demo.alt     short alt text for the image case
   ----------------------------------------------------------
============================================================ */

const CATEGORIES = ["Productivity", "Finance", "Utilities", "Developer"];

const APPS = [
  {
    id: "taskboard",
    name: "TaskBoard",
    category: "Productivity",
    description: "A column based task tracker for small teams that don't need the overhead of bigger project tools.",
    icon: "board",
    url: "https://example.com/taskboard",
    demo: {
      type: "image",
      src: "assets/img/screenshots/taskboard.svg",
      alt: "TaskBoard interface showing three columns of task cards"
    }
  },
  {
    id: "fintrack",
    name: "FinTrack",
    category: "Finance",
    description: "Tracks recurring expenses and income against a monthly budget, with no account linking required.",
    icon: "chart",
    url: "https://example.com/fintrack",
    demo: {
      type: "image",
      src: "assets/img/screenshots/fintrack.svg",
      alt: "FinTrack dashboard with a spending chart and category breakdown"
    }
  },
  {
    id: "quickconvert",
    name: "QuickConvert",
    category: "Utilities",
    description: "Converts units, currencies and file formats from one input box, no ads and no sign up.",
    icon: "swap",
    url: "https://example.com/quickconvert",
    demo: {
      type: "image",
      src: "assets/img/screenshots/quickconvert.svg",
      alt: "QuickConvert interface with an input field and converted result"
    }
  },
  {
    id: "codebox",
    name: "CodeBox",
    category: "Developer",
    description: "A scratch pad for running short snippets in a few languages, saved locally in the browser.",
    icon: "terminal",
    url: "https://example.com/codebox",
    demo: {
      type: "image",
      src: "assets/img/screenshots/codebox.svg",
      alt: "CodeBox editor with a code panel and output console"
    }
  },
  {
    id: "noteplex",
    name: "NotePlex",
    category: "Productivity",
    description: "Plain text notes with folders and fast search, built for people who type faster than they click.",
    icon: "notebook",
    url: "https://example.com/noteplex",
    demo: {
      type: "image",
      src: "assets/img/screenshots/noteplex.svg",
      alt: "NotePlex layout with a folder list and an open note"
    }
  },
  {
    id: "ledgerline",
    name: "LedgerLine",
    category: "Finance",
    description: "A single page for splitting shared costs between housemates or a small group of friends.",
    icon: "receipt",
    url: "https://example.com/ledgerline",
    demo: {
      type: "image",
      src: "assets/img/screenshots/ledgerline.svg",
      alt: "LedgerLine screen showing a list of shared expenses and balances"
    }
  }
];
