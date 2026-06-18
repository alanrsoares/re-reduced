# @re-reduced/docs

The re-reduced documentation site — Next.js + [fumadocs](https://fumadocs.dev).
Content lives in `content/docs/*.mdx`.

```bash
bun run --filter @re-reduced/docs dev     # dev server
bun run --filter @re-reduced/docs build   # production build
```

Serves `/llms.txt`, `/llms-full.txt`, and per-page Markdown for coding agents
(see the **Agents & LLMs** page).
