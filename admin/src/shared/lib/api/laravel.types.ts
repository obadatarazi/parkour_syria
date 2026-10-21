export type LaravelEnumOption = {
  label: string;
  value: string;
};

export type LaravelSuccessResponse<T> = {
  success: true;
  message?: string | null;
  data: T;
};

export type LaravelPaginatedResponse<T> = {
  success: true;
  statusCode: number;
  /** Present on notification list responses (admin me / platform / customer). */
  unreadCount?: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
    totalItems: number;
    items: T[] | { data?: T[] };
  };
};

export type LaravelErrorResponse = {
  success: false;
  error: string;
};

export type ApiUser = {
  id: number;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  gender?: LaravelEnumOption | null;
  type?: LaravelEnumOption | null;
  avatarFileUrl?: string | null;
  dateOfBirth?: string | null;
  active?: boolean;
  verifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiLoginData = {
  user: ApiUser;
  token: string;
  refreshToken: string;
};

export type ApiProfileData = {
  user: ApiUser;
};

export type ApiRoleData = {
  id: number;
  name: string;
  permission?: string[];
  permissions?: string[];
};
