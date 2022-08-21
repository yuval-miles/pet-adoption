import create from "zustand";

export interface PetType {
  adoptionStatus: string;
  picture: string;
  breed: string;
  height: number;
  weight: number;
  type: string;
  name: string;
  id: string;
}

export interface UserPetsType {
  adoptedPets: { [key: string]: PetType };
  fosteredPets: { [key: string]: PetType };
  hasFetched: boolean;
}

interface UserStateType {
  usersPets: UserPetsType;
  setUsersPets: (usersPets: UserPetsType) => void;
  clearUsersPets: () => void;
  addPet: (
    type: "adoptedPets" | "fosteredPets",
    petId: string,
    petData: PetType
  ) => void;
  removePet: (type: "adoptedPets" | "fosteredPets", petId: string) => void;
}

export const useUsersPets = create<UserStateType>((set) => ({
  usersPets: { adoptedPets: {}, fosteredPets: {}, hasFetched: false },
  setUsersPets: (usersPets: UserPetsType) =>
    set((state) => ({ ...state, usersPets })),
  clearUsersPets: () =>
    set((state) => ({
      ...state,
      usersPets: { adoptedPets: {}, fosteredPets: {}, hasFetched: false },
    })),
  addPet: (
    type: "adoptedPets" | "fosteredPets",
    petId: string,
    petData: PetType
  ) =>
    set((state) => ({
      ...state,
      usersPets: {
        ...state.usersPets,
        [type]: { ...state.usersPets[type], [petId]: petData },
      },
    })),
  removePet: (type: "adoptedPets" | "fosteredPets", petId: string) =>
    set((state) => {
      const newObj = { ...state.usersPets[type] };
      delete newObj[petId];
      return { ...state, usersPets: { ...state.usersPets, [type]: newObj } };
    }),
}));
