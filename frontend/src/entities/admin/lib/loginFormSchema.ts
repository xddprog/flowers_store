import { z } from "zod";

export const loginFormSchema = z.object({
  username: z.string().min(1, "Email обязателен для заполнения"),
  password: z
    .string()
    .min(1, "Пароль обязателен для заполнения")
    .min(5, "Пароль должен содержать минимум 5 символов"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
