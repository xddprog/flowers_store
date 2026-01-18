import { useCreateBouquet } from "@/entities/admin/hooks";
import {
  CreateBouquetFormData,
  createBouquetSchema,
} from "@/entities/admin/lib/createBouquetSchema";
import { useBouquetTypes } from "@/entities/flowers/hooks/useBouquetTypes";
import { useFlowerTypes } from "@/entities/flowers/hooks/useFlowerTypes";
import { cn } from "@/shared/lib/mergeClass";
import { ERouteNames } from "@/shared/lib/routeVariables";
import { Checkbox } from "@/shared/ui/checkbox/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form/form";
import { Image } from "@/shared/ui/image/image";
import { Input } from "@/shared/ui/input/input";
import { Label } from "@/shared/ui/label/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select/select";
import { Textarea } from "@/shared/ui/textarea/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateBouquetFormData>({
    resolver: zodResolver(createBouquetSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      bouquet_type_id: "",
      flower_type_ids: [],
      images: [],
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
      const { images, ...bouquetData } = data;
      const createdBouquet = await createBouquet.mutateAsync({
        bouquetData,
        files: images,
      });
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Добавить продукт
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="space-y-6 overflow-y-auto flex-1 px-6 pb-4">
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Количество
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Введите количество"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : Number(e.target.value)
                          )
                        }
                        className={cn(
                          "w-full px-4 h-[52px] border rounded-none font-sans text-base text-[#181818] focus:outline-none",
                          errors.quantity ? "border-red-500" : "border-black"
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

              <FormField
                control={control}
                name="images"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Изображения
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <label
                          className={cn(
                            "w-full h-[52px] border rounded-none font-sans text-base text-[#181818] focus-within:outline-none flex items-center justify-center cursor-pointer",
                            errors.images ? "border-red-500" : "border-black",
                            isSubmitting && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <span className="text-center">Выберите файлы</span>
                          <input
                            {...field}
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const newFiles = Array.from(e.target.files || []);
                              const existingFiles = value || [];
                              onChange([...existingFiles, ...newFiles]);
                              e.target.value = ""; // Сброс input для возможности повторного выбора тех же файлов
                            }}
                            className="hidden"
                            disabled={isSubmitting}
                          />
                        </label>
                        {value && value.length > 0 && (
                          <div className="space-y-3 mt-2">
                            <p className="text-sm text-gray-600 font-medium">
                              Выбрано файлов: {value.length}
                            </p>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto border border-gray-300 rounded-none p-4">
                              {Array.from(value).map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-2 border border-gray-300 rounded-none"
                                >
                                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 overflow-hidden">
                                    <Image
                                      src={URL.createObjectURL(file)}
                                      alt={`Превью ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">
                                      №{index + 1}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {file.name}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newFiles = Array.from(value).filter(
                                        (_, i) => i !== index
                                      );
                                      onChange(newFiles);
                                    }}
                                    className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1"
                                    disabled={isSubmitting}
                                  >
                                    Удалить
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            <DialogFooter className="gap-3 px-6 pb-6 pt-4 border-t">
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
