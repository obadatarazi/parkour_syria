export type ApiListMeta = {
  total: number;
  page: number;
  pageSize: number;
};

export type ApiListResponse<T> = ApiListMeta & {
  data: T[];
};

export type ApiErrorBody = {
  code: string;
  message: string;
};
