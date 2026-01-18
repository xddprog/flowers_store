import {
  useDeleteBouquetImage,
  useUpdateBouquet,
  useUpdateImageOrder,
} from "@/entities/admin/hooks";
import {
  UpdateBouquetFormData,
  updateBouquetSchema,
} from "@/entities/admin/lib/updateBouquetSchema";
import { useBouquetTypes } from "@/entities/flowers/hooks/useBouquetTypes";
import { useFlowerTypes } from "@/entities/flowers/hooks/useFlowerTypes";
import { BouquetDetail, BouquetImage } from "@/entities/flowers/types/apiTypes";
import { cn } from "@/shared/lib/mergeClass";
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
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
  const updateImageOrder = useUpdateImageOrder();
  const deleteImage = useDeleteBouquetImage();
  const queryClient = useQueryClient();
  const { data: bouquetTypes, isLoading: isLoadingTypes } = useBouquetTypes();
  const { data: flowerTypes, isLoading: isLoadingFlowers } = useFlowerTypes();

  const [images, setImages] = useState<BouquetImage[]>([]);

  const form = useForm<UpdateBouquetFormData>({
    resolver: zodResolver(updateBouquetSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
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
        quantity: product.quantity,
        bouquet_type_id: product.bouquet_type.id,
        flower_type_ids: product.flower_types.map((ft) => ft.id),
      });
      setImages([...product.images].sort((a, b) => a.order - b.order));
    }
  }, [open, product, reset]);

  const handleMoveImage = async (imageId: string, direction: "up" | "down") => {
    const sortedImages = [...images].sort((a, b) => a.order - b.order);
    const currentIndex = sortedImages.findIndex((img) => img.id === imageId);

    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedImages.length) return;

    const targetImage = sortedImages[newIndex];
    const currentImage = sortedImages[currentIndex];

    try {
      const updatedImages = await updateImageOrder.mutateAsync({
        bouquetId: product.id,
        imageId: currentImage.id,
        orderData: { order: targetImage.order },
      });

      setImages(updatedImages.sort((a, b) => a.order - b.order));
      queryClient.invalidateQueries({
        queryKey: ["getAdminBouquetDetail", product.id],
      });
    } catch (error) {
      console.error("Ошибка при изменении порядка изображения:", error);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Вы уверены, что хотите удалить это изображение?")) {
      return;
    }

    try {
      await deleteImage.mutateAsync({
        bouquetId: product.id,
        imageId: imageId,
      });

      setImages(images.filter((img) => img.id !== imageId));
      queryClient.invalidateQueries({
        queryKey: ["getAdminBouquetDetail", product.id],
      });
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
    }
  };

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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Редактировать продукт
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

              {images.length > 0 && (
                <div className="space-y-3">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Изображения (порядок)
                  </FormLabel>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto border border-black rounded-none p-4">
                    {[...images]
                      .sort((a, b) => a.order - b.order)
                      .map((image, index) => (
                        <div
                          key={image.id}
                          className="flex items-center gap-3 p-2 border border-gray-300 rounded-none"
                        >
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-200 overflow-hidden">
                            <Image
                              src={image.image_path}
                              alt={`Изображение ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              №{image.order + 1}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(image.id, "up")}
                              disabled={
                                index === 0 ||
                                updateImageOrder.isPending ||
                                isSubmitting
                              }
                              className={cn(
                                "p-1 border border-black rounded-none hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                index === 0 && "opacity-50 cursor-not-allowed"
                              )}
                              title="Переместить вверх"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(image.id, "down")}
                              disabled={
                                index === images.length - 1 ||
                                updateImageOrder.isPending ||
                                isSubmitting
                              }
                              className={cn(
                                "p-1 border border-black rounded-none hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                index === images.length - 1 &&
                                "opacity-50 cursor-not-allowed"
                              )}
                              title="Переместить вниз"
                            >
                              <ChevronDown size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(image.id)}
                              disabled={
                                deleteImage.isPending ||
                                isSubmitting
                              }
                              className={cn(
                                "p-1 border border-red-500 text-red-500 rounded-none hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              )}
                              title="Удалить изображение"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-3 px-6 pb-6 pt-4 border-t">
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
