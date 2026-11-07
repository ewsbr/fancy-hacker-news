A fancy Hacker News UI that runs on top of the original site. Works with Firefox for Android too!
Enjoy the same HN experience with theme support and many quality-of-life improvements, at the cost of a hefty amount of JavaScript ;).

Boasts full parity with the original UI, including (almost) all pages and logged-in features.
Everything runs in the browser, and requests go directly to Hacker News, with no proxy or telemetry.

» Features

- Themes: light, dark, nord, amoled
- Proper mobile device support
- Native HN links, forms, and account actions
- Settings for theme, content width, scroll-to-top, long-press comment collapse, and opening links in new tabs
- Search modal with <Cmd/Ctrl+K> shortcut

» QoL improvements

- Readability is (arguably) improved on all pages
- Proper mobile support
- Low karma comments are more visible and show their downvote level - from 1 (least downvoted) to 9 (most downvoted)
- Most things have badges that indicate their status - dead, deleted, new users
- A <#> button for copying comment permalinks
- A button for scrolling back to top
- Footer now shows all relevant documentation links (that I know of)
- Documentation links are no longer raw HTML
- Algolia search can be triggered with <Cmd/Ctrl+K> to open a search dialog

» Privacy and Safety

The extension does not collect analytics or track activity. Preferences are saved locally in browser extension storage. Page data comes from the already-loaded HN HTML. Account actions use HN endpoints, and submitted searches open hn.algolia.com.

Fancy Hacker News only parses the already-loaded page HTML and re-renders it with a custom UI. All interactions such as voting, flagging, commenting, and searching still go directly through news.ycombinator.com and hn.algolia.com as they would without the extension.

» Known Issues

- Dead and deleted comments still cause the <prev> and <next> buttons to be returned by HN, even when the user has them hidden. This is an existing HN bug we do not touch.
- I do not have enough Karma to properly test some features, such as: flagging, downvoting and top bar colors.

» Feedback

If you encounter any issues or have suggestions, please open an issue on GitHub: https://github.com/ewsbr/fancy-hacker-news

» Disclaimer

Hacker News and the YC brand are property of Y Combinator.

This browser extension is an independent, open-source project and is not affiliated with, endorsed by, or associated with Y Combinator.

» Versions
- 2026-09-07: Published v1.6.0
- 2026-07-09: Published v1.5.0
