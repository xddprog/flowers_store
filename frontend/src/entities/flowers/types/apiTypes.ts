export interface BouquetImage {
  id: string;
  image_path: string;
  order: number;
}

export interface BaseBouquet {
  id: string;
  name: string;
  price: number;
  main_image: BouquetImage | null;
}

export interface BouquetType {
  id: string;
  name: string;
}

export interface FlowerType {
  id: string;
  name: string;
}

export interface BouquetDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  purchase_count: number;
  view_count: number;
  bouquet_type: BouquetType;
  flower_types: FlowerType[];
  images: BouquetImage[];
}

export interface BouquetSearchParams {
  bouquet_type_ids?: string[] | null;
  flower_type_ids?: string[] | null;
  price_min?: number | null;
  price_max?: number | null;
  limit?: number;
  offset?: number;
}

export interface PopularBouquetsParams {
  limit?: number;
  offset?: number;
}

