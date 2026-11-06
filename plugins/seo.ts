import { createServer, type Plugin } from "vite";
import type { PageMetadata } from "../src/lib/seo";

const SEO_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

function renderHead(metadata: PageMetadata, structuredData: unknown) {
  const meta = (attribute: string, name: string, value: string) => `<meta ${attribute}="${name}" content="${escapeHtml(value)}" />`;
  const imageUrl = new URL(metadata.imagePath, metadata.canonicalUrl).href;
  return [
    "<!-- seo:start -->",
    `<title>${escapeHtml(metadata.title)}</title>`,
    meta("name", "description", metadata.description),
    meta("name", "keywords", metadata.keywords.join(", ")),
    meta("name", "robots", metadata.robots),
    meta("name", "author", "EDU.IDA"),
    `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`,
    meta("property", "og:type", "website"),
    meta("property", "og:site_name", "EDU.IDA"),
    meta("property", "og:locale", "mk_MK"),
    meta("property", "og:url", metadata.canonicalUrl),
    meta("property", "og:title", metadata.title),
    meta("property", "og:description", metadata.description),
    meta("property", "og:image", imageUrl),
    meta("property", "og:image:alt", metadata.imageAlt),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", metadata.title),
    meta("name", "twitter:description", metadata.description),
    meta("name", "twitter:image", imageUrl),
    meta("name", "twitter:image:alt", metadata.imageAlt),
    ...(structuredData ? [`<script id="page-structured-data" type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>`] : []),
    "<!-- seo:end -->",
  ].join("\n    ");
}

export function seoPages(): Plugin {
  let root: string;
  let seoModule: Promise<typeof import("../src/lib/seo")> | undefined;
  const loadSeo = () => seoModule ??= (async () => {
    // Vite's loader handles TypeScript and import.meta.env in the shared catalog.
    // Middleware mode creates no listening HTTP server.
    const server = await createServer({
      root, configFile: false, appType: "custom", logLevel: "error",
      server: { middlewareMode: true, watch: null, hmr: false },
    });
    try {
      return await server.ssrLoadModule("/src/lib/seo.ts") as typeof import("../src/lib/seo");
    } finally {
      await server.close();
    }
  })();

  return {
    name: "edu-ida-seo-pages",
    enforce: "post",
    configResolved(config) { root = config.root; },
    async transformIndexHtml(html, context) {
      const seo = await loadSeo();
      const metadata = seo.getPageMetadata(context.path === "/index.html" ? "/" : context.path);
      return html.replace(SEO_BLOCK, () => renderHead(metadata, seo.getStructuredData(metadata)));
    },
    async generateBundle(_options, bundle) {
      const seo = await loadSeo();
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") throw new Error("Missing HTML template for SEO pages");
      const template = String(index.source);
      if (!SEO_BLOCK.test(template)) throw new Error("Missing SEO metadata block in index.html");

      const paths = seo.getIndexablePaths();
      for (const pathname of seo.getStaticPaths().filter(path => path !== "/")) {
        const metadata = seo.getPageMetadata(pathname);
        this.emitFile({
          type: "asset",
          fileName: `${decodeURIComponent(pathname.slice(1))}index.html`,
          source: template.replace(SEO_BLOCK, () => renderHead(metadata, seo.getStructuredData(metadata))),
        });
      }
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path => `  <url><loc>${escapeHtml(seo.canonicalUrl(path))}</loc></url>`).join("\n")}\n</urlset>\n`,
      });
    },
  };
}
