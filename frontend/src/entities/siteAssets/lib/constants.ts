export const SITE_ASSET_KEYS = {
  hero: "hero",
  galleryAuthor: "gallery-author",
  galleryMono: "gallery-mono",
  galleryComposition: "gallery-composition",
  about: "about",
} as const;

export const DEFAULT_SITE_ASSETS: Record<string, string> = {
  [SITE_ASSET_KEYS.hero]: "/images/bg-dashboard.png",
  [SITE_ASSET_KEYS.galleryAuthor]: "/images/gallery/author-bouquet.jpg",
  [SITE_ASSET_KEYS.galleryMono]: "/images/gallery/monobouquet.jpg",
  [SITE_ASSET_KEYS.galleryComposition]: "/images/gallery/composition.jpg",
  [SITE_ASSET_KEYS.about]: "/images/flower.png",
};
