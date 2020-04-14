export type Nullable<T> = T | null;

export type Optional<T> = Nullable<void | undefined | T>;

export const REQUEST_STATUS = {
  Idle: "Idle",
  Pending: "Pending",
  Failed: "Failed",
  Fulfilled: "Fulfilled",
  Cancelled: "Cancelled",
} as const;

export const INITIAL_REQUEST_STATE: RequestState = {
  status: "Idle",
};

export type RequestStatus = keyof typeof REQUEST_STATUS;

export interface RequestState<TError = Error> {
  status: RequestStatus;
  error?: TError;
  lastExecuted?: number;
  lastRequested?: number;
}

export interface AsyncCollection<TResult, TError = Error> {
  byId: Record<string, TResult>;
  idList: string[];
  request: RequestState<TError>;
}

export interface Result<T> {
  items: T;
}

export type PaginationQuery = Optional<{
  pageIndex: number;
  pageSize: number;
}>;

export type PaginationState =
  | null
  | (PaginationQuery & {
      total: number;
    });

export interface PaginatedResult<T> extends Result<T> {
  pagination: PaginationState;
}

export type CacheControl = void | {
  /**
   * Whether the saga should ignore cache validation for this action
   */
  ignoreCache?: boolean;
};
