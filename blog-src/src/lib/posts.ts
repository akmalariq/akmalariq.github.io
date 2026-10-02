import type { CollectionEntry } from "astro:content";

/**
 * A post is live when it is not held AND its pubDate has arrived.
 *
 * The date half is what makes the cadence self-publishing: write a post with
 * `draft: false` and a future pubDate and it appears on the first build after
 * that date, with no flag to flip and nothing to remember. `draft: true` still
 * means "held" — a post that should never ship on a schedule (unfinished, or
 * being held for a specific reason).
 *
 * pubDate is a bare YYYY-MM-DD, so it resolves to 00:00 UTC. A post dated the
 * 6th therefore goes live at 07:00 WIB on the 6th. That is deliberate: the post
 * is never visible a day early because of it.
 *
 * Every listing must filter through this one predicate. A page that checks only
 * `draft` will happily build a future-dated post and advertise it in the RSS
 * feed and sitemap days before it exists as a page.
 */
export function isPublished(post: CollectionEntry<"blog">): boolean {
  return !post.data.draft && post.data.pubDate.valueOf() <= Date.now();
}