export function combineDraftPosts(posts: Array<{ content: string }>) {
  return posts
    .map((post) => post.content.trim())
    .filter(Boolean)
    .join("\n\n---\n\n");
}

export function splitDraftContent(content: string) {
  const parts = content
    .split(/\n\s*---\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [content.trim()].filter(Boolean);
}
