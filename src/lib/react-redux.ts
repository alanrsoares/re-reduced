import applySpec from "ramda/es/applySpec";
import {
  connect,
  InferableComponentEnhancerWithProps,
  MapStateToProps
} from "react-redux";
import { compose, Dispatch } from "redux";

import { ActionCreator } from "./core";
import { transformTree, Tree } from "../helpers/objects";

export type Dispatcher<T = any> = (payload: T) => void;

export type SelectorSpec<TProps, TState, TOwnProps extends {} = any> = {
  [K in keyof TProps]: (state: TState, ownProps?: TOwnProps) => TProps[K]
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

const toDispatcher = (dispatch: Dispatch) => <TPayload>(
  action: ActionCreator<TPayload>
) =>
  compose<Dispatcher<TPayload>>(
    dispatch,
    action
  );

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
  ) as TActions
});

export const applySelectors = <TProps = {}, TState = {}, TOwnProps = {}>(
  spec: SelectorSpec<TProps, TState, TOwnProps>
): MapStateToProps<Partial<TProps>, TOwnProps, TState> => applySpec(spec);

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

  return connect(
    stateToProps,
    bindActionCreators(actions)
  );
};
