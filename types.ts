import { User } from "firebase/auth";

export interface CustomUser extends User {
  name?: string;
  phone?: string;
}