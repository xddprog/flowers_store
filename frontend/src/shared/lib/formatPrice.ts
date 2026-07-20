export const formatPrice = (
  price: number,
  priceTo?: number | null
): string => {
  if (priceTo != null && priceTo > price) {
    return `${price.toLocaleString("ru-RU")} – ${priceTo.toLocaleString(
      "ru-RU"
    )} ₽`;
  }
  return `${price.toLocaleString("ru-RU")} ₽`;
};
