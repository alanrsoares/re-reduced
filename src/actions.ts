import { ActionCreator, AsyncActions } from "./core";

export function createAction<TPayload>(type: string): ActionCreator<TPayload> {
  const actionCreator = ((payload: TPayload) => ({
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

export function createAsyncActions<TRun, TSuccess>(
  type: string,
  domain: string
) {
  const fn = createAction<TRun>(`${domain}/${type}`) as AsyncActions<
    TRun,
    TSuccess
  >;
  fn.request = createAction(`${domain}/${type}_REQUEST`);
  fn.success = createAction<TSuccess>(`${domain}/${type}_SUCCESS`);
  fn.failure = createAction(`${domain}/${type}_FAILURE`);

  return fn;
}
