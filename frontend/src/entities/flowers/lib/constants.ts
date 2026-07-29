import { DEFAULT_SITE_ASSETS, SITE_ASSET_KEYS } from "@/entities/siteAssets";
import { Bouquet, GalleryCategory } from "../types/types";

export const POPULAR_BOUQUETS: Bouquet[] = [
  {
    id: "1",
    name: "Романтический",
    price: 5600,
    image: "/images/bouquet-1.jpg",
  },
  {
    id: "2",
    name: "Весенняя",
    price: 5600,
    image: "/images/bouquet-2.jpg",
  },
  {
    id: "3",
    name: "Классический",
    price: 5600,
    image: "/images/bouquet-3.jpg",
  },
  {
    id: "4",
    name: "Эксклюзивный",
    price: 5600,
    image: "/images/bouquet-4.jpg",
  },
  {
    id: "5",
    name: "Праздничная",
    price: 5600,
    image: "/images/bouquet-5.jpg",
  },
];

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  {
    id: "1",
    name: "Авторские букеты",
    image: DEFAULT_SITE_ASSETS[SITE_ASSET_KEYS.galleryAuthor],
    assetKey: SITE_ASSET_KEYS.galleryAuthor,
  },
  {
    id: "2",
    name: "Монобукеты",
    image: DEFAULT_SITE_ASSETS[SITE_ASSET_KEYS.galleryMono],
    assetKey: SITE_ASSET_KEYS.galleryMono,
  },
  {
    id: "3",
    name: "Композиции",
    image: DEFAULT_SITE_ASSETS[SITE_ASSET_KEYS.galleryComposition],
    assetKey: SITE_ASSET_KEYS.galleryComposition,
  },
];
