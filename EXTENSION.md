**Fancy Hacker News**

A fancy version of the original Hacker News UI. It works on top of the original site without changing any of its requests or main interactions.
You can enjoy the same HN experience with theme support and many QoL improvements, and only a hefty amount of Javascript ;).

Boasts full feature parity with the original HN UI, including all logged-in features, and proper mobile device support.
This extension runs 100% client-side and does not proxy any requests.

**Features**

- Themes: light, dark, nord, amoled
- Proper mobile device support
- Full feature parity with the original HN UI, including all logged-in features
- Search modal with **Cmd/Ctrl+K** shortcut

**QoL improvements:**

- Readability is (arguably) improved on all pages
- Proper mobile support
- Low karma comments are more visible and show their downvote level - from 1 (least downvoted) to 9 (most downvoted)
- Most things have badges that indicate their status - dead, deleted, new users
- A **#** button for copying comment permalinks
- A button for scrolling back to top
- Footer now shows all relevant documentation links (that I know of)
- Documentation links are no longer raw HTML
- Algolia search can be triggered with **Cmd/Ctrl+K** and displays in a modal instead of a new tab

**Privacy and Safety**

The extension does not collect any user data, does not track activity, and makes no network requests beyond those already performed natively by Hacker News.

Fancy Hacker News only parses the already-loaded page HTML and re-renders it with a custom UI. All interactions such as voting, flagging, commenting, and searching still go directly through news.ycombinator.com and hn.algolia.com as they would without the extension.

**Known Issues**

- Dead and deleted comments still cause the **prev** and **next** buttons to be returned by HN, even when the user has them hidden. This is an existing HN bug we do not touch.
- I do not have enough Karma to properly test some features, such as: flagging, downvoting and top bar colors.

**Feedback**

If you encounter any issues or have suggestions, please open an issue on [GitHub](https://github.com/ewsbr/fancy-hacker-news).

**Disclaimer**

Hacker News and the YC brand are property of Y Combinator.

This browser extension is an independent, open-source project and is not affiliated with, endorsed by, or associated with Y Combinator.
