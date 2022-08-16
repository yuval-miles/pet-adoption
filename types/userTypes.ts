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
