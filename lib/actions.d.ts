import { ActionCreator, AsyncActions } from "./core";
export declare function createAction<TPayload>(type: string): ActionCreator<TPayload>;
export declare function createAsyncActions<TRun, TSuccess>(type: string, domain: string): AsyncActions<TRun, TSuccess>;
