import { UserData } from "./../model/User";
export interface AuthSignIn {
  email: string;
  password: string;
}

export interface TokenAndUser {
  token: string | undefined;
  userData: UserData | undefined;
}

export interface UpdatePassword {
  password: string;
  token: string;
}
