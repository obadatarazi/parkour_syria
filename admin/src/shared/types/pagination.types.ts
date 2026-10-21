export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  /** Optional total unread count (e.g. notifications list responses). */
  unreadCount?: number;
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
