import { UserData } from "./../model/User";
export interface AuthSignIn {
  email: string;
  password: string;
}

export interface TokenAndUser {
  token: string | boolean;
  userData: UserData | boolean;
}

export interface UpdatePassword {
  password: string;
  token: string;
}
