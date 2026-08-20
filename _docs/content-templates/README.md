# Content templates

Copy one into `src/content/<type>/` and rename it to the slug you want —
lowercase, hyphens only.

| File         | Goes to                         | Notes                                                               |
| ------------ | ------------------------------- | ------------------------------------------------------------------- |
| `blog.mdx`   | `src/content/blog/<slug>.mdx`   |                                                                     |
| `issues.mdx` | `src/content/issues/<slug>.mdx` | Issue numbers come from publish order, so there is no field for one |
| `shop.mdx`   | `src/content/shop/<slug>.mdx`   | `canonicalUrl` must be the matching `www.timonwa.com/shop` URL      |
| `tools.mdx`  | `src/content/tools/<slug>.mdx`  | Slug must match `lib/config/tools.ts`; metadata lives in `TOOL_SEO` |

Keep them out of `src/content/` — the pages import MDX by template literal
(``import(`@/content/tools/${slug}.mdx`)``), so the bundler compiles every `.mdx`
in those directories and a placeholder file fails the build.

Work in progress goes in `src/content/<type>/_drafts/`, which is gitignored and
read only by the dev server. Those pages carry a **Draft** badge.
