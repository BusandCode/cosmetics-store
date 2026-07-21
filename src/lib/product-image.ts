export function placeholderImage(seed: string, size = 600) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
}