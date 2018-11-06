import { ActionCreator, AsyncAction } from "./core";

export function createAction<TPayload, TMeta = any>(
  type: string
): ActionCreator<TPayload, TMeta> {
  const actionCreator = ((payload: TPayload, meta?: TMeta) => ({
    meta,
    payload,
    type
  })) as ActionCreator<TPayload>;

  actionCreator.type = type;
  actionCreator.reduce = <TState>(
    handler: (state: TState, payload: TPayload) => TState
  ) => ({
    [type]: handler
  });

  return actionCreator;
}

export function createAsyncAction<TRun, TSuccess>(
  type: string,
  domain: string
) {
  const fn = createAction<TRun>(`${domain}/${type}`) as AsyncAction<
    TRun,
    TSuccess
  >;
  fn.request = createAction(`${domain}/${type}_REQUEST`);
  fn.success = createAction<TSuccess>(`${domain}/${type}_SUCCESS`);
  fn.failure = createAction(`${domain}/${type}_FAILURE`);

  return fn;
}
