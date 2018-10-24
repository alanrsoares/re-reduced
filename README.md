[![npm module](https://badge.fury.io/js/re-reduced.svg)](https://www.npmjs.org/package/re-reduced)
![travis](https://travis-ci.org/alanrsoares/re-reduced.svg?branch=master)

# Re-reduced

A type-safe functional toolbelt for Redux applications

## Type reference

### Action<T = void>

```js
interface Action<T = void> {
  type: string;
  payload: T;
}
```

### ActionCreator<T = void>

```js
interface ActionCreator<TPayload = void> {
  (): Action;
  (payload: TPayload): Action<TPayload>;
  type: string;
  reduce: <TState>(
    handler: ActionReducer<TPayload, TState>
  ) => {
    [key: string]: ActionReducer<TPayload, TState>
  };
}
```

### AsyncActions<TRun, TSuccess>

```js
interface AsyncActions<TRun, TSuccess> extends ActionCreator<TRun> {
  request: ActionCreator;
  success: ActionCreator<TSuccess>;
  failure: ActionCreator<Error>;
}
```

### ActionReducer<TPayload, TState>

```js
type ActionReducer<TPayload, TState> = (s: TState, p: TPayload) => TState;
```

### ActionReducerMap<TState>

```js
interface ActionReducerMap<TState> {
  [key: string]: ActionReducer<any, TState>;
}
```

## Api

### createAction<TPayload>(type: string): Action<T>

```js
const action = createAction();
```
