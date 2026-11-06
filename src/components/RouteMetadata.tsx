import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPageMetadata, getStructuredData, SITE_NAME, SITE_ORIGIN } from "@/lib/seo";

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

const RouteMetadata = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = getPageMetadata(pathname);
    const imageUrl = new URL(metadata.imagePath, SITE_ORIGIN).href;
    document.title = metadata.title;
    document.documentElement.lang = "mk";

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", metadata.canonicalUrl);
    upsertMeta("name", "author", SITE_NAME);
    upsertMeta("name", "description", metadata.description);
    upsertMeta("name", "keywords", metadata.keywords.join(", "));
    upsertMeta("name", "robots", metadata.robots);

    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "mk_MK");
    upsertMeta("property", "og:url", metadata.canonicalUrl);
    upsertMeta("property", "og:title", metadata.title);
    upsertMeta("property", "og:description", metadata.description);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:image:alt", metadata.imageAlt);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", metadata.title);
    upsertMeta("name", "twitter:description", metadata.description);
    upsertMeta("name", "twitter:image", imageUrl);
    upsertMeta("name", "twitter:image:alt", metadata.imageAlt);

    let schema = document.head.querySelector('script[id="page-structured-data"]');
    const structuredData = getStructuredData(metadata);
    if (!structuredData) {
      schema?.remove();
    } else {
      if (!schema) {
        schema = document.createElement("script");
        schema.setAttribute("id", "page-structured-data");
        schema.setAttribute("type", "application/ld+json");
        document.head.appendChild(schema);
      }
      schema.textContent = JSON.stringify(structuredData);
    }
  }, [pathname]);

  return null;
};

export default RouteMetadata;
