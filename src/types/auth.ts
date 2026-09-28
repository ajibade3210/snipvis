export interface AuthSessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface AuthTokenPayload {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateUserCliInput {
  email: string;
  password: string;
  name?: string;
}
