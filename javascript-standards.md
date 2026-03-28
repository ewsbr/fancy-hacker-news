# Bare Minimum JavaScript Standards (2026)

Use this as the default baseline for any JavaScript code in this repo: frontend, backend, workers, scripts, and extensions.

## Baseline

- Write for modern runtimes, not 2020-era compatibility constraints.
- Use current JavaScript features when they improve clarity.
- If an older target forces a workaround, isolate it instead of lowering the standard for the whole codebase.

## Modules

- Default to ESM for new code.
- Do not mix ESM and CommonJS casually.
- Keep imports explicit and keep aliases minimal.
- In Node code, import built-ins from the `node:` namespace.

## Language

- Use `const` by default and `let` only when reassignment is required.
- Prefer `async` and `await` over raw promise chains.
- Use modern syntax where it helps: optional chaining, nullish coalescing, destructuring, top-level `await`, and `for...of`.
- Prefer small focused functions and predictable data flow over clever abstractions.

## Platform APIs

- Prefer native platform APIs before adding dependencies.
- Default to modern built-ins such as `fetch`, `URL`, `URLSearchParams`, `AbortController`, streams, and `TextEncoder` or `TextDecoder` where available.
- Use `Temporal` when the target runtime supports it; otherwise use a small focused polyfill.

## Boundaries

- Validate data at boundaries: environment, network, storage, messages, and user input.
- Parse external input into trusted internal shapes.
- Standardize error handling instead of leaking framework or transport-specific errors into business logic.
- Use timeouts and cancellation for async work that can hang or outlive its caller.

## Quality

- Optimize for clarity first.
- Make impossible states explicit with assertions or invariant checks.
- Validate configuration once and reuse the validated result instead of reading raw config everywhere.
- Keep comments for non-obvious intent, not obvious mechanics.

## Tooling

- Use a current toolchain.
- Prefer `pnpm` for package management.
- Use ESLint flat config.
- Run lint, tests, and build or typecheck in CI.
- Commit the lockfile.

## Avoid

- Do not code as if legacy browsers or old Node versions are the default target.
- Do not add dependencies for problems the platform already solves well.
- Do not rely on large mutable shared state when a local or explicit data flow is clearer.
- Do not pass raw unvalidated external data through the app.