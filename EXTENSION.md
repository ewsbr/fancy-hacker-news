# Fancy Hacker News

A fancy version of the original Hacker News UI. Works on top of the original site, without changing any of its requests or main interactions.
You can enjoy the same HN experience with theme support and many QoL improvements, and only a hefty amount of Javascript ;).

Boasts full feature parity with the original HN UI, including all logged-in features, and proper mobile device support.

## Features
- Themes: light, dark, nord, amoled
- Proper mobile device support
- Full feature parity with the original HN UI, including all logged-in features
- Search modal with `Cmd/Ctrl+K` shortcut

## Privacy and Safety
The extension does not collect any user data, does not track activity, and makes no network requests beyond those already performed natively by Hacker News.

Fancy Hacker News only parses the already-loaded page HTML and re-renders it with a custom UI. All interactions such as voting, flagging, commenting, and searching still go directly through news.ycombinator.com and hn.algolia.com as they would without the extension.

## Known issues
- Hacker News can emit incorrect `prev` / `next` comment links for logged-out users when dead or deleted comments affect thread visibility. When logged in with dead/deleted comments shown, those links can differ. This is a HN bug, not an issue with the extension.

## Disclaimer
Hacker News and the YC brand are property of Y Combinator.

This browser extension is an independent, open-source project and is not affiliated with, endorsed by, or associated with Y Combinator.