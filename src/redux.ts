import { compose, Dispatch } from "redux";
import {
  connect,
  InferableComponentEnhancerWithProps,
  MapStateToProps,
} from "react-redux";
import applySpec from "ramda/src/applySpec";

import { ActionCreator, AsyncActionCreator } from "./core";
import { transformTree, Tree, hasOwnProps } from "./helpers/objects";

export type Dispatcher<T = any> = (payload: T) => void;

export type SelectorSpec<TProps, TState, TOwnProps extends {} = any> = {
  [P in keyof TProps]: (state: TState, ownProps?: TOwnProps) => TProps[P];
};

export interface ConnectWithActions {
  <
    TProps extends { actions: TActions },
    TOwnProps extends {} = any,
    TActions extends Tree<ActionCreator<any>> = {}
  >(
    actions: TActions
  ): InferableComponentEnhancerWithProps<TProps, TOwnProps>;

  <
    TProps extends { actions: TActions },
    TOwnProps extends {} = any,
    TState extends {} = any,
    TActions extends Tree<ActionCreator<any>> = {}
  >(
    actions: TActions,
    mapStateToProps:
      | MapStateToProps<Partial<TProps>, TOwnProps, TState>
      | SelectorSpec<Partial<TProps>, TState, TOwnProps>
  ): InferableComponentEnhancerWithProps<TProps, TOwnProps>;
}

function isAsyncActionCreator<T>(
  action: AsyncActionCreator<unknown, T> | ActionCreator<T>
) {
  return hasOwnProps(
    ["request", "success", "failure", "cancel"],
    action as AsyncActionCreator<unknown, T>
  );
}

const toDispatcher = (dispatch: Dispatch) => <TPayload>(
  action: ActionCreator<TPayload> | AsyncActionCreator<any, TPayload>
) => {
  const baseDispatcher = compose<Dispatcher<TPayload>>(dispatch, action);

  if (!isAsyncActionCreator(action)) {
    return baseDispatcher;
  }

  const asyncAction = action as AsyncActionCreator<any, TPayload>;

  const extensions = {
    request: compose(dispatch, asyncAction.request),
    success: compose(dispatch, asyncAction.success),
    failure: compose(dispatch, asyncAction.failure),
    cancel: compose(dispatch, asyncAction.cancel),
  };

  return Object.assign(baseDispatcher, extensions);
};

/**
 * bindActionCreators
 *
 * Monkeypatches dispatch to the actions making them self-dispachable
 *
 * @param actions
 */
export const bindActionCreators = <TActions extends Tree<ActionCreator<any>>>(
  actions: TActions
) => (dispatch: Dispatch) => ({
  actions: transformTree<ActionCreator, Dispatcher>(
    toDispatcher(dispatch),
    actions
  ) as TActions,
});

export const applySelectors = <TProps = {}, TState = {}, TOwnProps = {}>(
  spec: SelectorSpec<TProps, TState, TOwnProps>
): MapStateToProps<Partial<TProps>, TOwnProps, TState> =>
  applySpec<Partial<TProps>>(spec);

/**
 * connectWithActions
 *
 * Wraps react-redux's "connect" helper, binding dispatch to the action-creators
 *
 * @param actions - object of action-creators
 * @param mapStateToProps -
 * It can either be a function that directly maps the app's State to a component's Props
 * or an object whose keys represent properties in the target component and values are functions
 * that take the application's State and optionally, the connected component's own Props.
 * Those functions then return a derived value that matches the component's contract.
 * Ideally should be used with redux selectors.
 *
 */
export const connectWithActions: ConnectWithActions = <
  TProps extends { actions: TActions },
  TOwnProps extends {} = any,
  TState extends {} = any,
  TActions extends Tree<ActionCreator<any>> = {}
>(
  actions: TActions,
  mapStateToProps?:
    | MapStateToProps<Partial<TProps>, TOwnProps, TState>
    | SelectorSpec<Partial<TProps>, TState, TOwnProps>
) => {
  const stateToProps =
    typeof mapStateToProps === "object"
      ? applySelectors(mapStateToProps)
      : mapStateToProps;

  return connect(stateToProps, bindActionCreators(actions));
};
