import { SEO } from "./SEO";

type NoIndexSEOProps = {
  title: string;
  description: string;
  url: string;
};

export function NoIndexSEO({ title, description, url }: NoIndexSEOProps) {
  return <SEO title={title} description={description} url={url} noindex />;
}
