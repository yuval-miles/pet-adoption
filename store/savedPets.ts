import create from "zustand";
import { PetType } from "./userPets";

export interface SavedPets {
  pets: { [key: string]: PetType };
  hasFetched: boolean;
}

interface SavedPetsState {
  savedPets: SavedPets;
  setSavedPets: (pets: { [key: string]: PetType }) => void;
  clearSavedPets: () => void;
  addSavedPet: (petId: string, petData: PetType) => void;
  removeSavedPet: (petId: string) => void;
  setHasFetched: (status: boolean) => void;
}

export const useSavedPets = create<SavedPetsState>((set) => ({
  savedPets: { pets: {}, hasFetched: false },
  setSavedPets: (pets: { [key: string]: PetType }) =>
    set((state) => ({ ...state, savedPets: { ...state.savedPets, pets } })),
  clearSavedPets: () =>
    set((state) => ({ ...state, savedPets: { pets: {}, hasFetched: false } })),
  addSavedPet: (petId: string, petData: PetType) =>
    set((state) => {
      const newSavedPets = { ...state.savedPets.pets, [petId]: petData };
      return {
        ...state,
        savedPets: { ...state.savedPets, pets: newSavedPets },
      };
    }),
  removeSavedPet: (petId: string) =>
    set((state) => {
      const newSavedPets = { ...state.savedPets.pets };
      delete newSavedPets[petId];
      return {
        ...state,
        savedPets: { ...state.savedPets, pets: newSavedPets },
      };
    }),
  setHasFetched: (status: boolean) =>
    set((state) => ({
      ...state,
      savedPets: { ...state.savedPets, hasFetched: status },
    })),
}));
