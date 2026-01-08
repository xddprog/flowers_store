export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length === 0) return "";
  if (numbers.length <= 1) return `+7 (${numbers}`;
  if (numbers.length <= 4) return `+7 (${numbers.slice(1)}`;
  if (numbers.length <= 7)
    return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4)}`;
  if (numbers.length <= 9)
    return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7)}`;
  return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`;
};

