import { ipcMain } from 'electron';
import { Innertube, UniversalCache } from 'youtubei.js';

let youtube: Innertube;

(async () => {
  youtube = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true
  });
})();

export default function init() {
  ipcMain.handle('ytm.search', async (_, query: string) => {
    try {
      if (!youtube) return { results: [] };
      const suggestions = await youtube.music.getSearchSuggestions(query);

      const localResults: any[] = [];

      if (Array.isArray(suggestions)) {
        suggestions.forEach((section: any) => {
          if (section.contents && Array.isArray(section.contents)) {
            section.contents.forEach((item: any) => {
              if (item.type === 'SearchSuggestion') {
                localResults.push({
                  text: item.suggestion?.text,
                  type: 'suggestion'
                });
              } else if (item.type === 'MusicResponsiveListItem') {
                // Extract text (title) and artist/subtitle
                const text = item.flex_columns?.[0]?.title?.text;
                const subtitle = item.flex_columns?.[1]?.title?.text;
                const thumbnail = item.thumbnail?.contents?.[0]?.url;
                const browseId = item.endpoint?.payload?.browseId;
                const itemType = item.item_type;

                // Extract artist name
                let artist = '';
                if (item.artists && Array.isArray(item.artists) && item.artists.length > 0) {
                  artist = item.artists.map((a: any) => a.name).join(', ');
                } else if (subtitle) {
                  // Fallback: try to extract from subtitle string "Song • Artist • Plays"
                  const parts = subtitle.split(' • ');
                  if (parts.length >= 2) {
                    artist = parts[1]; // usually the second part
                  }
                }

                localResults.push({
                  text: text,
                  subtitle: subtitle,
                  artist: artist,
                  thumbnail: thumbnail,
                  browseId: browseId,
                  itemType: itemType,
                  type: 'result',
                  id: item.id
                });
              }
            });
          }
        });
      }

      return { results: localResults };
    } catch (error) {
      console.error('Search error:', error);
      return { results: [] };
    }
  });
}
