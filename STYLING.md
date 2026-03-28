# Design rules
This extension is for pedantic HackerNews users. While we may be re-rendering the entire page, our new layout should still feel familiar. The main directive is: all OG HN users must still like it. 

To maintain that utilitarian, classic *aesthetic*:
- No excessive padding or margins (preserve a high information density)
- No excessive border-radius (prefer sharp corners or very subtle rounding)
- No animations or heavy transitions (the UI should feel instantly snappy)
- For the main themes, keep colors strictly close to the original
- Good contrast

**However, we are NOT doing a 1:1 literal copy of HN's outdated layouts.**
You should fundamentally redesign the UX to be modern and highly usable:
- **Build new UI layouts from scratch.** (e.g. use proper multi-column layouts, fat footers, clean navigation paradigms instead of dense pipe-separated text strings).
- **Group elements logically.** Don't be afraid to separate metadata, resources, and actions into structurally sound components.
- **Move elements around** as much as you need to improve UX, as long as the color palette and austere vibes still make it unmistakably recognizable as HackerNews.

Ignore all of the current styles and elements. They're placeholders for your implementation.

Remember that this must work elegantly across all themes: light, dark, nord, and amoled black.