# Router

**Location:** `src/router/index.ts`

Pure function: `resolveRoute(location: Location) → RouteDescriptor`

Exports:
- `resolveRoute(location: Location): RouteDescriptor`
- `interface RouteDescriptor { page: string; params: Record<string, string> }`

No SPA navigation. Reads `location.pathname` + `URLSearchParams` on page load.

## Route Table

| URL pattern       | Page key      | Params                       |
|-------------------|---------------|------------------------------|
| `/`               | `stories`     | `{ type: 'top' }`           |
| `/news`           | `stories`     | `{ type: 'top' }`           |
| `/newest`         | `stories`     | `{ type: 'new' }`           |
| `/front`          | `stories`     | `{ type: 'front' }`         |
| `/ask`            | `stories`     | `{ type: 'ask' }`           |
| `/show`           | `stories`     | `{ type: 'show' }`          |
| `/jobs`           | `stories`     | `{ type: 'jobs' }`          |
| `/shownew`        | `stories`     | `{ type: 'shownew' }`       |
| `/pool`           | `stories`     | `{ type: 'pool' }`          |
| `/active`         | `stories`     | `{ type: 'active' }`        |
| `/best`           | `stories`     | `{ type: 'best' }`          |
| `/bestcomments`   | `stories`     | `{ type: 'bestcomments' }`   |
| `/noobstories`    | `stories`     | `{ type: 'noobstories' }`   |
| `/newcomments`    | `newcomments` | `{}`                         |
| `/noobcomments`   | `newcomments` | `{ type: 'noob' }`          |
| `/item`           | `item`        | `{ id }`                     |
| `/reply`          | `reply`       | `{ id, goto }`               |
| `/user`           | `user`        | `{ id }`                     |
| `/submitted`      | `submitted`   | `{ id }`                     |
| `/threads`        | `threads`     | `{ id }`                     |
| `/favorites`      | `favorites`   | `{ id, comments? }`          |
| `/upvoted`        | `upvoted`     | `{ id }`                     |
| `/hidden`         | `hidden`      | `{ id }`                     |
| `/submit`         | `submit`      | `{}`                         |
| `/login`          | `login`       | `{}`                         |
| `/comment`        | `login`       | `{}`                         |
| `/changepw`       | `login`       | `{}`                         |
| `/forgot`         | `login`       | `{}`                         |
| `/newsfaq`        | `static`      | `{}`                         |
| `/newsguidelines` | `static`      | `{}`                         |
| `/leaders`        | `static`      | `{}`                         |
| `/formatdoc`      | `static`      | `{}`                         |
| default           | `static`      | `{}`                         |

## Notes

- `stories` page key covers all list-style pages — the `type` param determines which data is shown
- `submitted`, `upvoted`, `hidden`, `favorites` reuse the story-list parser (same DOM structure)
- `login` covers login, comment-requires-login, changepw, forgot — all auth form pages
- `static` is the catch-all for informational pages and unknown routes
- All pages are fully re-rendered — no passthrough
