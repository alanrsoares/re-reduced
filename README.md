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
interface ActionCreator<T = void> {
  (): Action;
  (payload: T): Action<T>;
  type: string;
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

### ActionHandler<TPayload, TState>

```js
type ActionHandler<TPayload, TState> = (p: TPayload, s: TState) => TState;
```

### ActionHandlerMap<TState>

```js
interface ActionHandlerMap<TState> {
  [key: string]: ActionHandler<any, TState>;
}
```

## Api

### createAction<TPayload>(type: string): Action<T>

```js
const action = createAction();
```
