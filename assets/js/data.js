/*
 * beehta.com application catalogue
 * --------------------------------
 * GitHub CMS:
 * 1. Edit this file in your GitHub repository.
 * 2. Add/remove objects in BEEHTA_APPS.
 * 3. Commit the change.
 * 4. GitHub Pages / your static host serves the updated catalogue.
 *
 * demo:
 * - Use a same-origin page when possible.
 * - External sites may refuse iframe embedding through X-Frame-Options/CSP.
 * - Set demoType to "image" if you want to use a screenshot instead.
 */

const BEEHTA_APPS = [
  {
    id: "average-down",
    name: "Average Down",
    category: "Finance",
    description: "Calculate the quantity and price needed to lower an average stock position.",
    demoType: "iframe",
    demo: "https://example.com/average-down",
    icon: "↘"
  },
  {
    id: "quick-convert",
    name: "Quick Convert",
    category: "Utilities",
    description: "Small, practical unit and number conversions without the clutter.",
    demoType: "iframe",
    demo: "https://example.com/quick-convert",
    icon: "↔"
  },
  {
    id: "note-box",
    name: "Note Box",
    category: "Productivity",
    description: "A lightweight place to write, keep and quickly find short notes.",
    demoType: "iframe",
    demo: "https://example.com/note-box",
    icon: "N"
  },
  {
    id: "protocol-runner",
    name: "Protocol Runner",
    category: "Developer",
    description: "Create and run structured protocols with a straightforward interface.",
    demoType: "iframe",
    demo: "https://example.com/protocol-runner",
    icon: ">"
  },
  {
    id: "portfolio",
    name: "Portfolio",
    category: "Finance",
    description: "Keep an eye on investments, allocation and the numbers that matter.",
    demoType: "iframe",
    demo: "https://example.com/portfolio",
    icon: "P"
  },
  {
    id: "name-lab",
    name: "Name Lab",
    category: "Utilities",
    description: "Generate and explore names when you need a little inspiration.",
    demoType: "iframe",
    demo: "https://example.com/name-lab",
    icon: "Aa"
  }
];
