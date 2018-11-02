import {
  connect,
  InferableComponentEnhancerWithProps,
  MapStateToProps
} from "react-redux";
import { compose, Dispatch } from "redux";

import { ActionCreator } from "./core";
import { transformTree, Tree } from "./helpers/objects";

export type Dispatcher<T = any> = (payload: T) => void;

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
    TOwnProps = {},
    TState = {},
    TActions extends Tree<ActionCreator<any>> = {}
  >(
    actions: TActions,
    mapStateToProps: MapStateToProps<Partial<TProps>, TOwnProps, TState>
  ): InferableComponentEnhancerWithProps<TProps, {}>;
}

const toDispatcher = (dispatch: Dispatch) => <TPayload>(
  action: ActionCreator<TPayload>
) =>
  compose<Dispatcher<TPayload>>(
    dispatch,
    action
  );

export const bindActionCreators = <TActions extends Tree<ActionCreator<any>>>(
  actions: TActions
) => (dispatch: Dispatch) => ({
  actions: transformTree<ActionCreator, Dispatcher>(
    toDispatcher(dispatch),
    actions
  ) as TActions
});

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
  TOwnProps = {},
  TState = {},
  TActions extends Tree<ActionCreator<any>> = {}
>(
  actions: TActions,
  mapStateToProps?: MapStateToProps<Partial<TProps>, TOwnProps, TState>
) => {
  return connect(
    mapStateToProps,
    bindActionCreators(actions)
  );
};
