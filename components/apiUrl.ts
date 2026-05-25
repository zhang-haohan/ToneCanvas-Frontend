import config from "../public/config.json";

type CorpusRequest = {
  userId?: string;
  currentFileName?: string;
  currentIndex?: number;
};

export function buildApiUrl(endpoint: string, corpus?: CorpusRequest) {
  const params = new URLSearchParams();

  if (corpus?.userId) params.set("user_id", corpus.userId);
  if (corpus?.currentFileName) params.set("file_name", corpus.currentFileName);
  if (typeof corpus?.currentIndex === "number") {
    params.set("index", String(corpus.currentIndex));
  }

  const query = params.toString();
  return `${config.backendUrl}${endpoint}${query ? `?${query}` : ""}`;
}
