export const imports = {
  'docs/core.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-core" */ 'docs/core.mdx'),
  'docs/index.mdx': () =>
    import(/* webpackPrefetch: true, webpackChunkName: "docs-index" */ 'docs/index.mdx'),
}
