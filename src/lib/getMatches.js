import * as cheerio from "cheerio";

const SCHEDULE_URL = "https://streamcrichd.com/update/schedule.php";

export async function getMatches() {
  try {
    const res = await fetch(SCHEDULE_URL, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const matches = [];

    $("article.event").each((i, el) => {
      const $el = $(el);
      const title = $el.find(".event-title").text().trim();
      const league = $el.find(".event-league").text().trim();
      const time = $el.find(".event-time").text().trim();
      const isLive = $el.hasClass("event-live");

      // Get channels from fetch.php links
      const channels = [];
      $el.find('a[href*="fetch.php"]').each((_, link) => {
        const href = $(link).attr("href") || "";
        const match = href.match(/hd=(\d+)/);
        if (match) {
          channels.push({
            id: match[1],
            url: href,
          });
        }
      });

      if (channels.length === 0) return;

      // Filter only cricket matches
      const isCricket =
        /cricket|ipl|psl|t20|odi|test match|bbl|cpl|wpl|sa20|hundred|blast|super\s*league|trophy|premier league.*cricket|kings|challengers|sunrisers|capitals|warriors|riders|titans|giants|royals|knight|daredevils|super kings|indians/i.test(
          title + " " + league
        );

      matches.push({
        id: `match-${i}`,
        title,
        league,
        time,
        isLive,
        isCricket,
        channels,
      });
    });

    return matches;
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}
