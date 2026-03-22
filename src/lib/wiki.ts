const imgCache: Record<string, string | null> = {};

export async function fetchWikiImage(wikiTitle: string): Promise<string | null> {
  if (imgCache[wikiTitle] !== undefined) return imgCache[wikiTitle];
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`
    );
    const data = await res.json();
    const url: string | null = data?.thumbnail?.source ?? null;
    imgCache[wikiTitle] = url;
    return url;
  } catch {
    imgCache[wikiTitle] = null;
    return null;
  }
}
