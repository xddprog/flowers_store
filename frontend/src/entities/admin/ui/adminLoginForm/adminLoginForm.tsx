import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminService } from "@/entities/admin/api/adminService";
import { LoginDto } from "@/entities/admin/types/apiTypes";
import {
  setAccessToken,
  setRefreshToken,
} from "@/entities/token/lib/tokenService";
import {
  loginFormSchema,
  LoginFormData,
} from "@/entities/admin/lib/loginFormSchema";
import { Input } from "@/shared/ui/input/input";
import { cn } from "@/shared/lib/mergeClass";

interface AdminLoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const AdminLoginForm = ({ onSuccess, onError }: AdminLoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const loginData: LoginDto = {
        username: data.username,
        password: data.password,
      };

      const response = await adminService.login(loginData);
      setAccessToken(response.access_token);
      setRefreshToken(response.refresh_token);

      reset();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Произошла ошибка при входе";

      setApiError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="flex flex-col space-y-4">
        <div>
          <Input
            id="username"
            placeholder="Введите email"
            className={cn(
              "w-full px-4 h-[52px] border rounded-none font-sans text-base text-[#181818] focus:outline-none",
              errors.username ? "border-red-500" : "border-black"
            )}
            {...register("username")}
            disabled={isLoading}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <Input
            id="password"
            type="password"
            placeholder="Введите пароль"
            className={cn(
              "w-full px-4 h-[52px] border rounded-none font-sans text-base text-[#181818] focus:outline-none",
              errors.password ? "border-red-500" : "border-black"
            )}
            {...register("password")}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>
      </section>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#FF6600] text-white font-semibold py-3 px-6 hover:bg-[#E55A00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:ring-offset-2"
      >
        {isLoading ? "Вход..." : "Вход"}
      </button>
    </form>
  );
};
