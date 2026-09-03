import { ChangeEvent, useRef, useState } from "react";
import { Upload } from "lucide-react";
import {
  useGetImageStorageUsage,
  useGetSiteAssets,
  useUploadSiteAsset,
} from "@/entities/admin/hooks";
import type { SiteAsset } from "@/entities/admin/types/apiTypes";
import { Button } from "@/shared/ui/button/button";
import { cn } from "@/shared/lib/mergeClass";

const ACCEPTED_IMAGE_TYPES = "image/*,.heic,.heif";

const AdminMediaPage = () => {
  const { data, isLoading, isError } = useGetSiteAssets();
  const { data: storageUsage } = useGetImageStorageUsage();
  const uploadAsset = useUploadSiteAsset();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFileDialog = (key: string) => {
    setSelectedKey(key);
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedKey) {
      uploadAsset.mutate({ key: selectedKey, file });
    }
    event.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
          Медиа сайта
        </h1>
        <p className="text-gray-500">
          JPG, PNG, WebP и HEIC. Новое изображение сразу заменяет текущее на сайте.
        </p>
      </div>

      {storageUsage && (
        <div className="bg-white border border-gray-200 p-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-700">
            <span>
              Фотографии занимают {formatBytes(storageUsage.image_files_size)}
            </span>
            <span>
              Диск заполнен на {storageUsage.disk_used_percent}%:{" "}
              {formatBytes(storageUsage.disk_used)} из{" "}
              {formatBytes(storageUsage.disk_total)}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-[#FF6600]"
              style={{
                width: `${Math.min(storageUsage.disk_used_percent, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        className="hidden"
        onChange={handleFileChange}
      />

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-500">
          Загружаем изображения...
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-red-700">
          Не удалось загрузить список изображений.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data?.assets.map((asset) => (
          <MediaAssetCard
            key={asset.key}
            asset={asset}
            isUploading={uploadAsset.isPending && selectedKey === asset.key}
            onUpload={() => openFileDialog(asset.key)}
          />
        ))}
      </div>
    </div>
  );
};

interface MediaAssetCardProps {
  asset: SiteAsset;
  isUploading: boolean;
  onUpload: () => void;
}

const MediaAssetCard = ({
  asset,
  isUploading,
  onUpload,
}: MediaAssetCardProps) => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-gray-800">{asset.label}</h2>
          <p className="text-sm text-gray-500">{asset.key}</p>
        </div>
        <Button
          type="button"
          onClick={onUpload}
          disabled={isUploading}
          className={cn(
            "gap-2 bg-[#FF6600] hover:bg-[#E55A00]",
            isUploading && "opacity-70"
          )}
        >
          <Upload size={18} />
          {isUploading ? "Загрузка" : "Заменить"}
        </Button>
      </div>

      <div className="w-full h-[260px] bg-gray-100 overflow-hidden rounded">
        <img
          src={asset.url}
          alt={asset.label}
          className="block w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </section>
  );
};

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} ГБ`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  }
  return `${Math.round(bytes / 1024)} КБ`;
};

export default AdminMediaPage;
