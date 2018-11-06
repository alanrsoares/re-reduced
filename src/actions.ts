import { ActionCreator, ActionCreatorOptions, AsyncAction } from "./core";

export function createAction<TPayload, TMeta = any>(
  type: string
): ActionCreator<TPayload, TMeta> {
  const actionCreator = ((
    payload: TPayload,
    options?: ActionCreatorOptions<TMeta>
  ) => ({
    error: typeof options !== "undefined" ? options.error : undefined,
    meta: typeof options !== "undefined" ? options.meta : undefined,
    payload,
    type
  })) as ActionCreator<TPayload, TMeta>;

  actionCreator.type = type;
  actionCreator.reduce = <TState>(
    handler: (state: TState, payload: TPayload) => TState
  ) => ({
    [type]: handler
  });

  return actionCreator;
}

export function createAsyncAction<TRun, TSuccess, TFailure = Error>(
  type: string,
  domain: string
) {
  const asyncAction = createAction<TRun>(`${domain}/${type}`) as AsyncAction<
    TRun,
    TSuccess,
    TFailure
  >;
  asyncAction.request = createAction(`${domain}/${type}_REQUEST`);
  asyncAction.success = createAction<TSuccess>(`${domain}/${type}_SUCCESS`);
  asyncAction.failure = createAction<TFailure>(`${domain}/${type}_FAILURE`);

  return asyncAction;
}
