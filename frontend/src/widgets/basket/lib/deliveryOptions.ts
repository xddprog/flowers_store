export const getDeliveryDateOptions = () => {
  const options = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const day = date.getDate();
    const month = date.toLocaleDateString("ru-RU", { month: "long" });
    const weekday = date.toLocaleDateString("ru-RU", { weekday: "long" });
    
    const label = i === 0 
      ? `Сегодня, ${day} ${month}`
      : i === 1
      ? `Завтра, ${day} ${month}`
      : `${weekday}, ${day} ${month}`;
    
    options.push({
      value: date.toISOString().split("T")[0],
      label,
      date,
    });
  }
  
  return options;
};

export const getDeliveryTimeSlots = () => {
  const slots = [];
  
  for (let hour = 10; hour <= 20; hour++) {
    const fromHour = hour.toString().padStart(2, "0");
    const toHour = (hour + 1).toString().padStart(2, "0");
    
    slots.push({
      value: `${fromHour}:00-${toHour}:00`,
      label: `С ${fromHour}:00 до ${toHour}:00`,
      timeFrom: `${fromHour}:00`,
      timeTo: `${toHour}:00`,
    });
  }
  
  return slots;
};

export const cities = [
  { value: "Москва", label: "Москва" },
  { value: "Санкт-Петербург", label: "Санкт-Петербург" },
  { value: "Екатеринбург", label: "Екатеринбург" },
  { value: "Казань", label: "Казань" },
  { value: "Новосибирск", label: "Новосибирск" },
];

export const parseTimeSlot = (timeSlot: string) => {
  const [timeFrom, timeTo] = timeSlot.split("-");
  return { timeFrom: timeFrom || "10:00", timeTo: timeTo || "11:00" };
};

