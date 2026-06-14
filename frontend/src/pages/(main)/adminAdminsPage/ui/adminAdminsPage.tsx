import { useState } from "react";
import type { FormEvent } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  useCreateAdmin,
  useDeleteAdmin,
  useGetAdmins,
  useGetCurrentUser,
  useUpdateAdmin,
} from "@/entities/admin/hooks";
import type {
  AdminUser,
  CreateAdminDto,
  UpdateAdminDto,
} from "@/entities/admin/types/apiTypes";
import { Button } from "@/shared/ui/button/button";
import { Input } from "@/shared/ui/input/input";

const AdminAdminsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);

  const {
    data: admins = [],
    isLoading,
    error,
  } = useGetAdmins({
    limit: 100,
    offset: 0,
  });
  const { data: currentUser } = useGetCurrentUser();
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
    setEditingAdmin(null);
    setUsername("");
    setPassword("");
    setFormError(null);
  };

  const openEditModal = (admin: AdminUser) => {
    setIsCreateModalOpen(false);
    setEditingAdmin(admin);
    setUsername(admin.username);
    setPassword("");
    setFormError(null);
  };

  const closeAdminModal = () => {
    setIsCreateModalOpen(false);
    setEditingAdmin(null);
    setUsername("");
    setPassword("");
    setFormError(null);
  };

  const handleSubmitAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const isCreateMode = isCreateModalOpen;

    if (!trimmedUsername) {
      setFormError("Укажите логин администратора");
      return;
    }

    if (isCreateMode && !trimmedPassword) {
      setFormError("Укажите пароль администратора");
      return;
    }

    if (trimmedPassword && trimmedPassword.length < 6) {
      setFormError("Пароль должен быть не короче 6 символов");
      return;
    }

    const adminData: UpdateAdminDto = {
      username: trimmedUsername,
    };

    if (trimmedPassword) {
      adminData.password = trimmedPassword;
    }

    try {
      if (isCreateMode) {
        await createAdmin.mutateAsync(adminData as CreateAdminDto);
      } else if (editingAdmin) {
        await updateAdmin.mutateAsync({
          adminId: editingAdmin.id,
          adminData,
        });
      }
      closeAdminModal();
    } catch (error) {
      console.error("Ошибка при сохранении администратора:", error);
      setFormError("Не удалось сохранить администратора");
    }
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (currentUser?.id === admin.id) {
      setFormError("Нельзя удалить текущего администратора");
      return;
    }

    const isConfirmed = window.confirm(
      `Удалить администратора "${admin.username}"?`
    );

    if (!isConfirmed) {
      return;
    }

    setDeletingAdminId(admin.id);
    setFormError(null);

    try {
      await deleteAdmin.mutateAsync(admin.id);
    } catch (error) {
      console.error("Ошибка при удалении администратора:", error);
      setFormError("Не удалось удалить администратора");
    } finally {
      setDeletingAdminId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Администраторы
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Загрузка администраторов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Администраторы
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">
            Ошибка при загрузке администраторов. Попробуйте обновить страницу.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Администраторы
          </h1>
          <p className="text-gray-500 mt-2">
            Просмотр, добавление, редактирование и удаление учетных записей
            админ-панели
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateModal}
          className="bg-[#FF6600] hover:bg-[#E55A00] text-white"
        >
          <Plus size={16} />
          Добавить администратора
        </Button>
      </div>

      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{formError}</p>
        </div>
      )}

      {admins.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-center py-8">
            Администраторы не найдены
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {admins.map((admin) => {
            const isCurrentAdmin = currentUser?.id === admin.id;
            const isDeleting = deletingAdminId === admin.id;

            return (
              <div
                key={admin.id}
                className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {admin.username}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 break-all">
                      ID: {admin.id}
                    </p>
                  </div>
                  {isCurrentAdmin && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF6600]/10 text-[#FF6600]">
                      Вы
                    </span>
                  )}
                </div>

                <div className="flex gap-3 pt-5 mt-5 border-t border-gray-100">
                  <Button
                    type="button"
                    onClick={() => openEditModal(admin)}
                    className="flex-1 bg-[#FF6600] hover:bg-[#E55A00] text-white"
                  >
                    <Pencil size={16} />
                    Изменить
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleDeleteAdmin(admin)}
                    disabled={isCurrentAdmin || isDeleting}
                    className="flex-1"
                  >
                    <Trash2 size={16} />
                    {isDeleting ? "Удаление..." : "Удалить"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(isCreateModalOpen || editingAdmin) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-800">
                {isCreateModalOpen
                  ? "Добавить администратора"
                  : "Изменить администратора"}
              </h2>
              <button
                type="button"
                onClick={closeAdminModal}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
                aria-label="Закрыть"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdmin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Логин
                </label>
                <Input
                  id="admin-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Введите логин"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {isCreateModalOpen ? "Пароль" : "Новый пароль"}
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isCreateModalOpen
                      ? "Введите пароль"
                      : "Оставьте пустым, чтобы не менять"
                  }
                />
                <p className="text-xs text-gray-500 mt-2">
                  Минимальная длина нового пароля - 6 символов
                </p>
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAdminModal}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={createAdmin.isPending || updateAdmin.isPending}
                  className="flex-1 bg-[#FF6600] hover:bg-[#E55A00] text-white"
                >
                  {createAdmin.isPending || updateAdmin.isPending
                    ? "Сохранение..."
                    : "Сохранить"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdminsPage;
