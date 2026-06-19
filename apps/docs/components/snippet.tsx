import { type SnippetId, snippets } from "@/lib/snippets.generated";
import { TwoslashSnippet } from "@/components/twoslash-snippet";

/**
 * Render a generated, type-checked snippet by id inside MDX — the code is
 * extracted from a real module in packages/demos/src/snippets, so it can't drift
 * from code that compiles. Use ```ts twoslash fences for inline examples; reach
 * for this when the doc should show a tested module verbatim.
 */
export function Snippet({
  id,
  lang = "ts",
}: {
  id: SnippetId;
  lang?: "ts" | "tsx";
}) {
  return <TwoslashSnippet code={snippets[id].twoslash} lang={lang} />;
}
