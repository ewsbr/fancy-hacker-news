<template>
  <footer class="site-footer">
    <nav class="footer-nav">
      <a href="newsguidelines.html">Guidelines</a>
      <a href="newsfaq.html">FAQ</a>
      <a href="lists">Lists</a>
      <a href="https://github.com/HackerNews/API" target="_blank" rel="noopener noreferrer">API</a>
      <a href="security.html">Security</a>
      <a href="https://www.ycombinator.com/legal/" target="_blank" rel="noopener noreferrer">Legal</a>
      <a href="https://www.ycombinator.com/apply/" target="_blank" rel="noopener noreferrer">Apply to YC</a>
      <a href="mailto:hn@ycombinator.com">Contact</a>
    </nav>

    <form action="https://hn.algolia.com/" method="get" class="search-form">
      <label for="hn-search" class="search-label">Search:</label>
      <input
        id="hn-search"
        name="q"
        type="text"
        placeholder="Search Hacker News..."
        class="search-input"
      />
    </form>
  </footer>
</template>
