import { ExternalArticle } from "./external-article";

export interface Article extends ExternalArticle {
  pubmed_id: string;
  abstract: string | null;
  created_at: string;
  updated_at: string;
}