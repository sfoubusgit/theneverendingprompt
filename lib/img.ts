/** Cloudinary on-the-fly resize; other URLs pass through untouched. */
export function sized(url: string, width: number) {
  return url.includes('/image/upload/')
    ? url.replace('/image/upload/', `/image/upload/w_${width},q_auto,f_auto/`)
    : url
}
