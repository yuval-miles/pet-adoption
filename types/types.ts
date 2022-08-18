export interface UserResponse {
  name: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string;
  image: string | null;
  accounts?: any;
  id?: string;
}

export interface PetSearchResponse {
  adoptionStatus: string;
  picture: string;
  breed: string;
  height: number;
  weight: number;
  type: string;
  name: string;
  petId: string;
}
