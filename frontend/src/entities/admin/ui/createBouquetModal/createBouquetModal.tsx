import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form/form";
import { Input } from "@/shared/ui/input/input";
import { Textarea } from "@/shared/ui/textarea/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select/select";
import { Checkbox } from "@/shared/ui/checkbox/checkbox";
import { Label } from "@/shared/ui/label/label";
import { useCreateBouquet } from "@/entities/admin/hooks";
import { useBouquetTypes } from "@/entities/flowers/hooks/useBouquetTypes";
import { useFlowerTypes } from "@/entities/flowers/hooks/useFlowerTypes";
import {
  createBouquetSchema,
  CreateBouquetFormData,
} from "@/entities/admin/lib/createBouquetSchema";
import { ERouteNames } from "@/shared/lib/routeVariables";
import { cn } from "@/shared/lib/mergeClass";

interface CreateBouquetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateBouquetModal = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateBouquetModalProps) => {
  const navigate = useNavigate();
  const createBouquet = useCreateBouquet();
  const { data: bouquetTypes, isLoading: isLoadingTypes } = useBouquetTypes();
  const { data: flowerTypes, isLoading: isLoadingFlowers } = useFlowerTypes();

  const form = useForm<CreateBouquetFormData>({
    resolver: zodResolver(createBouquetSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      bouquet_type_id: "",
      flower_type_ids: [],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  const onSubmit = async (data: CreateBouquetFormData) => {
    try {
      const createdBouquet = await createBouquet.mutateAsync(data);
      reset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
      // Перенаправляем на страницу созданного продукта
      navigate(
        `/${ERouteNames.ADMIN_DASHBOARD_ROUTE}/${ERouteNames.ADMIN_PRODUCTS_ROUTE}/${createdBouquet.id}`
      );
    } catch (error) {
      console.error("Ошибка при создании продукта:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Добавить продукт
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Название
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Введите название"
                      className={cn(
                        "w-full px-4 h-[52px] border rounded-none font-sans text-base text-[#181818] focus:outline-none",
                        errors.name ? "border-red-500" : "border-black"
                      )}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Описание
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Введите описание"
                      rows={4}
                      className={cn(
                        "w-full px-4 py-3 border rounded-none font-sans text-base text-[#181818] focus:outline-none resize-none",
                        errors.description ? "border-red-500" : "border-black"
                      )}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Цена
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Введите цену"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      className={cn(
                        "w-full px-4 h-[52px] border rounded-none font-sans text-base text-[#181818] focus:outline-none",
                        errors.price ? "border-red-500" : "border-black"
                      )}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="bouquet_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Тип букета
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || isLoadingTypes}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full min-h-[52px] px-4 border rounded-none font-sans text-base text-[#181818] focus:outline-none",
                          errors.bouquet_type_id
                            ? "border-red-500"
                            : "border-black"
                        )}
                      >
                        <SelectValue placeholder="Выберите тип букета" />
                      </SelectTrigger>
                      <SelectContent
                        side="bottom"
                        align="end"
                        position="popper"
                        className="border border-black rounded-none"
                      >
                        {bouquetTypes?.map((type) => (
                          <SelectItem
                            key={type.id}
                            value={type.id}
                            className="rounded-none cursor-pointer"
                          >
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="flower_type_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Типы цветов
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto border border-black rounded-none px-4 py-2">
                      {isLoadingFlowers ? (
                        <p className="text-sm text-gray-500">
                          Загрузка типов цветов...
                        </p>
                      ) : (
                        flowerTypes?.map((flowerType) => (
                          <div
                            key={flowerType.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={flowerType.id}
                              checked={field.value?.includes(flowerType.id)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                if (checked) {
                                  field.onChange([
                                    ...currentValues,
                                    flowerType.id,
                                  ]);
                                } else {
                                  field.onChange(
                                    currentValues.filter(
                                      (id) => id !== flowerType.id
                                    )
                                  );
                                }
                              }}
                              disabled={isSubmitting}
                            />
                            <Label
                              htmlFor={flowerType.id}
                              className="text-sm font-normal text-[#181818] cursor-pointer"
                            >
                              {flowerType.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-3">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
                className="px-6 py-3 border border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600] hover:text-white hover:border-white cursor-pointer font-sans font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingTypes || isLoadingFlowers}
                className="px-6 py-3 bg-[#FF6600] text-white cursor-pointer font-sans font-semibold hover:bg-[#E55A00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Создание..." : "Создать"}
              </button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
