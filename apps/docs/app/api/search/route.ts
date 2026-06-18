import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

export const revalidate = false;

// Static search index (built at export time, queried client-side) so the site
// runs on a static host like GitHub Pages.
export const { staticGET: GET } = createFromSource(source, {
  language: "english",
});
