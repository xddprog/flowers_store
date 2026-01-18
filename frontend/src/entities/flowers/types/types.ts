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
  bouquetTypeName?: string; // Название типа букета для сопоставления
}

export * from "./apiTypes";
