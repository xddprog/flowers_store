import {
  useArchiveBouquet,
  useDeleteBouquet,
  useGetAdminBouquetDetail,
  useUploadBouquetImages,
} from "@/entities/admin/hooks";
import { GET_ADMIN_BOUQUETS_QUERY } from "@/entities/admin/lib/queryKeys";
import { EditBouquetModal } from "@/entities/admin/ui/editBouquetModal";
import { ERouteNames } from "@/shared/lib/routeVariables";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel/carousel";
import { Image } from "@/shared/ui/image/image";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AdminProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: product,
    isLoading,
    error,
  } = useGetAdminBouquetDetail(id || "");
  const deleteBouquet = useDeleteBouquet();
  const archiveBouquet = useArchiveBouquet();
  const uploadImages = useUploadBouquetImages();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!id || !confirm("Вы уверены, что хотите удалить этот продукт?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteBouquet.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: [GET_ADMIN_BOUQUETS_QUERY] });
      navigate(
        `/${ERouteNames.ADMIN_DASHBOARD_ROUTE}/${ERouteNames.ADMIN_PRODUCTS_ROUTE}`,
      );
    } catch (error) {
      console.error("Ошибка при удалении продукта:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!id || !confirm("Вы уверены, что хотите архивировать этот продукт?")) {
      return;
    }

    setIsArchiving(true);
    try {
      await archiveBouquet.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: [GET_ADMIN_BOUQUETS_QUERY] });
      queryClient.invalidateQueries({
        queryKey: ["getAdminBouquetDetail", id],
      });
      navigate(
        `/${ERouteNames.ADMIN_DASHBOARD_ROUTE}/${ERouteNames.ADMIN_PRODUCTS_ROUTE}`,
      );
    } catch (error) {
      console.error("Ошибка при архивировании продукта:", error);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleUploadImages = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!id || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const files = Array.from(event.target.files);
    setIsUploading(true);
    try {
      await uploadImages.mutateAsync({ bouquetId: id, files });
      queryClient.invalidateQueries({
        queryKey: ["getAdminBouquetDetail", id],
      });
    } catch (error) {
      console.error("Ошибка при загрузке изображений:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [GET_ADMIN_BOUQUETS_QUERY] });
    queryClient.invalidateQueries({
      queryKey: ["getAdminBouquetDetail", id],
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Загрузка продукта...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">
            Ошибка при загрузке продукта или продукт не найден
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            navigate(
              `/${ERouteNames.ADMIN_DASHBOARD_ROUTE}/${ERouteNames.ADMIN_PRODUCTS_ROUTE}`,
            )
          }
          className="flex items-center cursor-pointer gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Назад к списку</span>
        </button>
      </div>

      <div className="bg-white p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {product.name}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Описание</p>
                <p className="text-gray-800">{product.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Цена</p>
                  <p className="text-lg font-semibold text-[#FF6600]">
                    {product.price.toLocaleString("ru-RU")} ₽
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Количество</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {product.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Просмотры</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {product.view_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Покупки</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {product.purchase_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Статус</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded ${
                      product.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {product.is_active ? "Активен" : "Неактивен"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Тип букета</p>
                <p className="text-gray-800">{product.bouquet_type.name}</p>
              </div>
              {product.flower_types && product.flower_types.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-1.5">Типы цветов</p>
                  <div className="flex flex-wrap gap-2">
                    {product.flower_types.map((flowerType) => (
                      <button
                        key={flowerType.id}
                        className="flex items-center gap-2 px-4 py-2 border border-black bg-white text-sm font-sans text-[#181818] hover:bg-gray-100 transition-colors"
                      >
                        <span>{flowerType.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className=" flex flex-col items-end justify-end">
            {product.images && product.images.length > 0 ? (
              <div className="max-w-[448px] w-full">
                <Carousel
                  className="w-full"
                  opts={{
                    align: "start",
                    loop: product.images.length > 1,
                  }}
                >
                  <CarouselContent className="-ml-0">
                    {[...product.images]
                      .sort((a, b) => a.order - b.order)
                      .map((image, index) => (
                        <CarouselItem
                          key={image.id}
                          className="pl-0 basis-full"
                        >
                          <div className="relative aspect-square overflow-hidden bg-gray-200">
                            <Image
                              src={image.image_path}
                              alt={`${product.name} - изображение ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading={index === 0 ? "eager" : "lazy"}
                            />
                            <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm font-semibold">
                              №{image.order + 1}
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                  </CarouselContent>
                  {product.images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2 bg-white/80 hover:bg-white border-gray-300" />
                      <CarouselNext className="right-2 bg-white/80 hover:bg-white border-gray-300" />
                    </>
                  )}
                </Carousel>
              </div>
            ) : (
              <div className="aspect-square max-w-[448px] w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Нет изображений</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full bg-[#FF6600] text-white cursor-pointer font-sans font-semibold py-3 px-4 hover:bg-[#E55A00] transition-colors"
        >
          {isUploading ? "Загрузка..." : "Загрузить фото"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleUploadImages}
          className="hidden"
        />
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="w-full border border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600] hover:text-white hover:border-white cursor-pointer font-sans font-semibold py-3 px-4 transition-colors"
        >
          Редактировать
        </button>
        <button
          onClick={handleArchive}
          disabled={isArchiving}
          className="w-full border border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600] hover:text-white hover:border-white cursor-pointer font-sans font-semibold py-3 px-4 transition-colors"
        >
          {isArchiving ? "Архивирование..." : "Архивировать"}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full bg-[#FF6600] text-white cursor-pointer font-sans font-semibold py-3 px-4 hover:bg-[#E55A00] transition-colors"
        >
          {isDeleting ? "Удаление..." : "Удалить"}
        </button>
      </div>

      {product && (
        <EditBouquetModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          product={product}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default AdminProductDetailPage;
