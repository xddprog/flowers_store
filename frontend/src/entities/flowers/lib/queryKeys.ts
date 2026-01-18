export const GET_BOUQUETS_SEARCH_QUERY = "getBouquetsSearch";
export const GET_POPULAR_BOUQUETS_QUERY = "getPopularBouquets";
export const GET_BOUQUET_DETAIL_QUERY = "getBouquetDetail";
export const GET_BOUQUET_TYPES_QUERY = "getBouquetTypes";
export const GET_FLOWER_TYPES_QUERY = "getFlowerTypes";
export const GET_PRICE_RANGE_QUERY = "getPriceRange";

export const queryKeys = {
  bouquetsSearch: () => [GET_BOUQUETS_SEARCH_QUERY] as const,
  popularBouquets: () => [GET_POPULAR_BOUQUETS_QUERY] as const,
  bouquetDetail: (id: string) => [GET_BOUQUET_DETAIL_QUERY, id] as const,
  bouquetTypes: () => [GET_BOUQUET_TYPES_QUERY] as const,
  flowerTypes: () => [GET_FLOWER_TYPES_QUERY] as const,
  priceRange: () => [GET_PRICE_RANGE_QUERY] as const,
};

