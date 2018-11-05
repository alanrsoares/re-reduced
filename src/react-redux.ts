import { applySpec } from "ramda";
import {
  connect,
  InferableComponentEnhancerWithProps,
  MapStateToProps
} from "react-redux";
import { compose, Dispatch } from "redux";

import { ActionCreator } from "./core";
import { transformTree, Tree } from "./helpers/objects";

export type Dispatcher<T = any> = (payload: T) => void;

export type SelectorSpec<TProps, TState, TOwnProps = {}> = {
  [K in keyof TProps]: (state: TState, ownProps?: TOwnProps) => TProps[K]
};

export interface ConnectWithActions {
  <
    TProps extends { actions: TActions },
    TOwnProps = {},
    TActions extends Tree<ActionCreator<any>> = {}
  >(
    actions: TActions
  ): InferableComponentEnhancerWithProps<TProps, TOwnProps>;

  <
    TProps extends { actions: TActions },
    TState extends {} = any,
    TOwnProps = {},
    TActions extends Tree<ActionCreator<any>> = {}
  >(
    actions: TActions,
    mapStateToProps:
      | MapStateToProps<Partial<TProps>, TOwnProps, TState>
      | SelectorSpec<Partial<TProps>, TState, TOwnProps>
  ): InferableComponentEnhancerWithProps<TProps, {}>;
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
 * Wraps react-redux's connect binding dispatch to the action-creators
 *
 * @param actions - object of action-creators
 * @param mapStateToProps - receives redux state and maps to component props
 */
export const connectWithActions: ConnectWithActions = <
  TProps extends { actions: TActions },
  TState extends {} = any,
  TOwnProps = {},
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
