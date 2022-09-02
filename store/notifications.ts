import create from "zustand";

export interface NotificationType {
  createdAt: string;
  type: "addedPet" | "userChat" | "petStatusChange";
  userName?: string;
  petId?: string;
  petName?: string;
  statusAction?: "Adopted" | "Returned" | "Fostered";
}

interface NotificationStoreType {
  notifications: NotificationType[];
  addNotification: (notification: NotificationType) => void;
  clearNotifications: () => void;
}

export const useNotifications = create<NotificationStoreType>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      ...state,
      notifications: [...state.notifications, notification],
    })),
  clearNotifications: () =>
    set((state) => ({
      ...state,
      notifications: [],
    })),
}));
