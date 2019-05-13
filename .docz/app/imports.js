export const imports = {
  'docs/api-reference.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "docs-api-reference" */ 'docs/api-reference.mdx'
    ),
  'docs/examples-todo.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "docs-examples-todo" */ 'docs/examples-todo.mdx'
    ),
  'docs/getting-started.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "docs-getting-started" */ 'docs/getting-started.mdx'
    ),
  'docs/index.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "docs-index" */ 'docs/index.mdx'
    ),
  'docs/type-reference.mdx': () =>
    import(
      /* webpackPrefetch: true, webpackChunkName: "docs-type-reference" */ 'docs/type-reference.mdx'
    ),
}
