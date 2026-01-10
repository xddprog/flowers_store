import { useMemo, useState, useEffect, useRef } from "react";
import {
  useGetAdminOrders,
  useUpdateOrderStatus,
} from "@/entities/admin/hooks";
import { OrderCard } from "@/entities/admin/ui/orderCard";
import { OrderDetailModal } from "@/entities/admin/ui/orderDetailModal";
import { useQueryClient } from "@tanstack/react-query";
import { GET_ADMIN_ORDERS_QUERY } from "@/entities/admin/lib/queryKeys";
import { AdminOrder } from "@/entities/admin/types";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
  KanbanOverlay,
} from "@/shared/ui/kanban";
import { cn } from "@/shared/lib/mergeClass";
import type {
  UniqueIdentifier,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";

const COLUMNS = [
  { id: "paid" as const, title: "Оплачен", status: "paid" as const },
  {
    id: "processing" as const,
    title: "Обрабатывается",
    status: "processing" as const,
  },
  { id: "completed" as const, title: "Выполнен", status: "completed" as const },
  { id: "cancelled" as const, title: "Отменен", status: "cancelled" as const },
];

const columnColors: Record<string, string> = {
  paid: "border-blue-200 bg-blue-50/30",
  processing: "border-[#FF6600]/30 bg-[#FF6600]/5",
  completed: "border-green-200 bg-green-50/30",
  cancelled: "border-gray-200 bg-gray-50/30",
};

const AdminOrdersPage = () => {
  const queryClient = useQueryClient();
  const updateOrderStatus = useUpdateOrderStatus();

  const {
    data: orders = [],
    isLoading,
    error,
  } = useGetAdminOrders({
    limit: 100,
    offset: 0,
  });

  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, AdminOrder[]> = {
      paid: [],
      processing: [],
      completed: [],
      cancelled: [],
    };

    orders.forEach((order) => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });

    return grouped as Record<UniqueIdentifier, AdminOrder[]>;
  }, [orders]);

  const [kanbanValue, setKanbanValue] =
    useState<Record<UniqueIdentifier, AdminOrder[]>>(ordersByStatus);

  const previousValueRef = useRef(ordersByStatus);
  const isUpdatingRef = useRef(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dragInfoRef = useRef<{
    isDragging: boolean;
    startTime: number | null;
    orderId: string | null;
  }>({
    isDragging: false,
    startTime: null,
    orderId: null,
  });

  useEffect(() => {
    if (!isUpdatingRef.current && orders.length > 0) {
      setKanbanValue(ordersByStatus);
      previousValueRef.current = ordersByStatus;
    }
  }, [ordersByStatus, orders.length]);

  const handleDragStart = (event: DragStartEvent) => {
    dragInfoRef.current = {
      isDragging: true,
      startTime: Date.now(),
      orderId: typeof event.active.id === "string" ? event.active.id : null,
    };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const dragInfo = dragInfoRef.current;
    const wasRealDrag = event.over && event.over.id !== event.active.id;
    const dragDuration = dragInfo.startTime
      ? Date.now() - dragInfo.startTime
      : 0;

    if (!wasRealDrag && dragDuration < 200 && dragInfo.orderId) {
      const clickedOrder = orders.find((o) => o.id === dragInfo.orderId);
      if (clickedOrder) {
        setTimeout(() => {
          setSelectedOrder(clickedOrder);
          setIsModalOpen(true);
        }, 10);
      }
    }

    setTimeout(() => {
      dragInfoRef.current = {
        isDragging: false,
        startTime: null,
        orderId: null,
      };
    }, 100);
  };

  const handleDragCancel = () => {
    dragInfoRef.current = {
      isDragging: false,
      startTime: null,
      orderId: null,
    };
  };

  const handleModalStatusChange = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId,
        statusData: { status: newStatus },
      });
      queryClient.invalidateQueries({
        queryKey: [GET_ADMIN_ORDERS_QUERY],
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Ошибка при изменении статуса заказа:", error);
    }
  };

  const handleValueChange = async (
    newValue: Record<UniqueIdentifier, AdminOrder[]>
  ) => {
    const previousValue = previousValueRef.current;

    setKanbanValue(newValue);

    let movedOrder: AdminOrder | null = null;
    let targetColumnId: string | null = null;

    for (const columnId of COLUMNS.map((col) => col.id)) {
      const previousOrders = previousValue[columnId] || [];
      const newOrders = newValue[columnId] || [];
      const previousIds = new Set(previousOrders.map((o) => o.id));

      for (const order of newOrders) {
        if (!previousIds.has(order.id)) {
          movedOrder = order;
          targetColumnId = columnId;
          break;
        }
      }
      if (movedOrder) break;
    }

    if (movedOrder && targetColumnId) {
      const originalOrder = orders.find((o) => o.id === movedOrder!.id);
      if (originalOrder && originalOrder.status !== targetColumnId) {
        isUpdatingRef.current = true;
        previousValueRef.current = newValue;

        try {
          await updateOrderStatus.mutateAsync({
            orderId: movedOrder.id,
            statusData: { status: targetColumnId },
          });
          queryClient.invalidateQueries({
            queryKey: [GET_ADMIN_ORDERS_QUERY],
          });
        } catch (error) {
          console.error("Ошибка при изменении статуса заказа:", error);
          setKanbanValue(previousValue);
          previousValueRef.current = previousValue;
        } finally {
          isUpdatingRef.current = false;
        }
      } else {
        previousValueRef.current = newValue;
      }
    } else {
      previousValueRef.current = newValue;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">Заказы</h1>
        <div className="flex items-center justify-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-[#FF6600]/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-[#FF6600] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">Заказы</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">
            Ошибка при загрузке заказов. Попробуйте обновить страницу.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[90vh]">
      <h1 className="text-3xl font-semibold text-gray-800">Заказы</h1>
      <Kanban
        value={kanbanValue}
        onValueChange={handleValueChange}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        getItemValue={(order: AdminOrder) => order.id}
        orientation="horizontal"
      >
        <KanbanBoard
          asChild
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-4 w-full"
        >
          <div>
            {COLUMNS.map((column) => {
              const columnOrders = kanbanValue[column.id] || [];
              return (
                <KanbanColumn
                  key={column.id}
                  value={column.id}
                  className={cn(
                    "w-full min-h-[600px] flex flex-col rounded-lg border-2 p-4",
                    columnColors[column.id] || columnColors.cancelled
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {column.title}
                    </h2>
                    <span className="px-2.5 py-1 bg-white rounded-full text-sm font-medium text-gray-600 border border-gray-200 min-w-[28px] text-center">
                      {columnOrders.length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    {columnOrders.length > 0 ? (
                      columnOrders.map((order) => (
                        <KanbanItem key={order.id} value={order.id} asHandle>
                          <OrderCard order={order} />
                        </KanbanItem>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Нет заказов
                      </div>
                    )}
                  </div>
                </KanbanColumn>
              );
            })}
          </div>
        </KanbanBoard>

        <KanbanOverlay>
          {({ value }) => {
            for (const columnOrders of Object.values(kanbanValue)) {
              const order = columnOrders.find((o) => o.id === value);
              if (order) {
                return <OrderCard order={order} />;
              }
            }
            return null;
          }}
        </KanbanOverlay>
      </Kanban>

      <OrderDetailModal
        order={selectedOrder}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onStatusChange={handleModalStatusChange}
      />
    </div>
  );
};

export default AdminOrdersPage;
