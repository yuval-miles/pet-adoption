import create from "zustand";
import { RoomResponse, MessageType } from "../types/types";
import _ from "lodash";

interface ChatStoreType {
  chatState: {
    adminRooms: RoomResponse[];
    userRoom: RoomResponse | {};
    refeshUserRooms: Function | null;
  };
  setAdminRooms: (adminRooms: RoomResponse[]) => void;
  setUserRoom: (userMessages: RoomResponse) => void;
  changeRoomStatus: (roomStatus: boolean, roomIdx: number) => void;
  addMessageToRoom: (message: MessageType, roomIdx: number) => void;
  addMessage: (message: MessageType) => void;
  changeAdminRoomState: (
    roomState: "Open" | "Closed" | "Banned",
    roomIdx: number
  ) => void;
  changeUserRoomState: (roomState: "Open" | "Closed" | "Banned") => void;
  clearUserRoom: () => void;
  setRefeshUserRoom: (refetch: Function) => void;
}

export const useChatStore = create<ChatStoreType>((set) => ({
  chatState: {
    adminRooms: [],
    userRoom: {},
    refeshUserRooms: null,
  },
  setAdminRooms: (adminRooms) =>
    set((state) => ({
      ...state,
      chatState: { ...state.chatState, adminRooms },
    })),
  setUserRoom: (userRoom) =>
    set((state) => ({
      ...state,
      chatState: {
        ...state.chatState,
        userRoom,
      },
    })),
  changeRoomStatus: (roomStatus, roomIdx) =>
    set((state) => {
      const newState = _.cloneDeep(state);
      newState.chatState.adminRooms[roomIdx].online = roomStatus;
      return newState;
    }),
  changeAdminRoomState: (roomState, roomIdx) =>
    set((state) => {
      const newState = _.cloneDeep(state);
      newState.chatState.adminRooms[roomIdx].status = roomState;
      return newState;
    }),
  changeUserRoomState: (roomState) =>
    set((state) => ({
      ...state,
      chatState: {
        ...state.chatState,
        userRoom: { ...state.chatState.userRoom, status: roomState },
      },
    })),
  addMessageToRoom: (message, roomIdx) =>
    set((state) => {
      const newState = _.cloneDeep(state);
      newState.chatState.adminRooms[roomIdx].messages.unshift(message);
      return newState;
    }),
  addMessage: (message) =>
    set((state) => {
      const newState = _.cloneDeep(state);
      if ("messages" in newState.chatState.userRoom)
        newState.chatState.userRoom.messages.unshift(message);
      else {
        const newRoom = { messages: [message] };
        newState.chatState.userRoom = newRoom;
      }
      return newState;
    }),
  clearUserRoom: () =>
    set((state) => ({
      ...state,
      chatState: { ...state.chatState, userRoom: {} },
    })),
  setRefeshUserRoom: (refetch: Function) =>
    set((state) => ({
      ...state,
      chatState: { ...state.chatState, refeshUserRooms: refetch },
    })),
}));
