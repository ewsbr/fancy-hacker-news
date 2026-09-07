# Fixture Taxonomy

All committed fixtures must live under one of the categorized folders in this directory. Do not add new snapshot files at the root.

## Usage

Use `loadFixtureDocument()` or `loadFixtureHtml()` from [test/helpers/load-fixture.ts](../helpers/load-fixture.ts), passing a path relative to this directory. Parser tests use isolated documents in the default Node environment; only tests that need browser globals should opt into jsdom. See [Testing](../../README.md#testing).

Preserve the HN markup responsible for the behavior under test, including hidden field names and action URL parameters. Replace live credentials and CSRF tokens with inert fixture values before committing; assert that parsers preserve those values. Tests must not make live HN requests.

## Categories

- `comments/`: flat comment-list pages, user comment collections, and comment-row fragments.
- `stories/`: story-list pages, full item/thread pages, user story collections, and story/item fragments.
- `static/`: static informational pages such as FAQ, guidelines, and formatting docs.
- `misc/`: non-list utility pages and assets such as auth flows, forms, delete-confirm pages, profile pages, utility tables, and saved HN JS assets.

## Naming Rules

- Prefer route- or behavior-based names over vague labels.
- When two fixtures represent the same route in different states, encode the variant in the filename, for example `leaders-public.html` or `poll-classic.html`.
- Keep tiny partial fixtures in a local `fragments/` folder under the owning category.
- Keep auth-related fixtures under `misc/auth/`, profile fixtures under `misc/user/`, and form pages under `misc/forms/`.

## Duplicate Policy

- Do not keep two fixtures with the same basename in different folders unless the filenames encode distinct behavior.
- Remove empty placeholders and byte-for-byte duplicates instead of moving them.
- Before adding a new fixture, search `test/fixtures/` for an existing page or nearby edge-case variant that can be extended instead.
