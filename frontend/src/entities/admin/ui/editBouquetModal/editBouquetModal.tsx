import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useUpdateBouquet } from "@/entities/admin/hooks";
import { useBouquetTypes } from "@/entities/flowers/hooks/useBouquetTypes";
import { useFlowerTypes } from "@/entities/flowers/hooks/useFlowerTypes";
import { BouquetDetail } from "@/entities/flowers/types/apiTypes";
import {
  updateBouquetSchema,
  UpdateBouquetFormData,
} from "@/entities/admin/lib/updateBouquetSchema";
import { cn } from "@/shared/lib/mergeClass";

interface EditBouquetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: BouquetDetail;
  onSuccess?: () => void;
}

export const EditBouquetModal = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}: EditBouquetModalProps) => {
  const updateBouquet = useUpdateBouquet();
  const { data: bouquetTypes, isLoading: isLoadingTypes } = useBouquetTypes();
  const { data: flowerTypes, isLoading: isLoadingFlowers } = useFlowerTypes();

  const form = useForm<UpdateBouquetFormData>({
    resolver: zodResolver(updateBouquetSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      price: product.price,
      bouquet_type_id: product.bouquet_type.id,
      flower_type_ids: product.flower_types.map((ft) => ft.id),
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  useEffect(() => {
    if (open && product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        bouquet_type_id: product.bouquet_type.id,
        flower_type_ids: product.flower_types.map((ft) => ft.id),
      });
    }
  }, [open, product, reset]);

  const onSubmit = async (data: UpdateBouquetFormData) => {
    try {
      await updateBouquet.mutateAsync({
        bouquetId: product.id,
        bouquetData: data,
      });
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Ошибка при обновлении продукта:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Редактировать продукт
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
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                onClick={() => onOpenChange(false)}
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
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
