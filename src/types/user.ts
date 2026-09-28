export interface UserRecord {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserProfileDto {
  id: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
  updatedAt?: Date | string;
}

export interface UpdateUserInput {
  name?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
}
