import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { transformerTwoslash } from 'fumadocs-twoslash';
import { twoslashCompilerOptions } from './lib/twoslash';

// You can customize Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // `transformerTwoslash` compiles every ```ts twoslash fence against the real
    // @re-reduced source (lib/twoslash.ts paths), so a doc snippet that no longer
    // type-checks fails the build instead of going stale.
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash({
          twoslashOptions: { compilerOptions: twoslashCompilerOptions },
        }),
      ],
    },
  },
});
