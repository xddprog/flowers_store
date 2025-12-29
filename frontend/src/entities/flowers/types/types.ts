export interface Bouquet {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  image?: string;
}

export * from "./apiTypes";