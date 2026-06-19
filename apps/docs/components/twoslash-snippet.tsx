import { highlight } from "fumadocs-core/highlight";
import { transformerTwoslash } from "fumadocs-twoslash";
import { Popup, PopupContent, PopupTrigger } from "fumadocs-twoslash/ui";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { twoslashCompilerOptions } from "@/lib/twoslash";

/**
 * Server-renders a twoslash snippet (compiled against the real @re-reduced
 * source) with hover lenses — for use outside MDX, e.g. the landing page. The
 * input is the `twoslash` form from lib/snippets.generated.ts.
 */
export async function TwoslashSnippet({
  code,
  lang = "ts",
}: {
  code: string;
  lang?: "ts" | "tsx";
}) {
  return highlight(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    // emit both themes as CSS variables so it follows the .dark class instead of
    // baking only the first (light) theme.
    defaultColor: false,
    transformers: [
      transformerTwoslash({
        explicitTrigger: false,
        twoslashOptions: { compilerOptions: twoslashCompilerOptions },
      }),
    ],
    components: {
      pre: (props) => (
        <CodeBlock {...props}>
          <Pre>{props.children}</Pre>
        </CodeBlock>
      ),
      Popup,
      PopupContent,
      PopupTrigger,
    },
  });
}
