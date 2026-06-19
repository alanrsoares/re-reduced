import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Popup, PopupContent, PopupTrigger } from "fumadocs-twoslash/ui";
import type { MDXComponents } from "mdx/types";
import { Snippet } from "@/components/snippet";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Tab,
    Tabs,
    Step,
    Steps,
    // hover lenses emitted by transformerTwoslash for ```ts twoslash fences
    Popup,
    PopupContent,
    PopupTrigger,
    // <Snippet id="…" /> — render a generated, type-checked snippet module
    Snippet,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
