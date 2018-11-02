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
  <TProps = {}, TOwnProps = {}, TActions extends Tree<ActionCreator<any>> = {}>(
    actions: TActions
  ): InferableComponentEnhancerWithProps<TProps, TOwnProps>;

  <
    TProps = {},
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

/**
 * connectWithActions
 *
 * Wraps react-redux's connect binding dispatch to the action-creators
 *
 * @param actions - object of action-creators
 * @param mapStateToProps - receives redux state and maps to component props
 */
export const connectWithActions: ConnectWithActions = <
  TProps = {},
  TOwnProps = {},
  TState = {},
  TActions extends Tree<ActionCreator<any>> = {}
>(
  actions: TActions,
  mapStateToProps?: MapStateToProps<Partial<TProps>, TOwnProps, TState>
) => {
  const mapDisptachToProps = (dispatch: Dispatch) => ({
    actions: transformTree<ActionCreator, Dispatcher>(
      toDispatcher(dispatch),
      actions
    ) as Tree<ActionCreator<any>>
  });

  return connect(
    mapStateToProps,
    mapDisptachToProps
  );
};
