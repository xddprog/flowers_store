export interface Bouquet {
  id: string;
  name: string;
  price: number;
  price_to?: number | null;
  image?: string;
  availability_status?: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  image?: string;
  bouquetTypeName?: string; // Название типа букета для сопоставления
}

export * from "./apiTypes";
