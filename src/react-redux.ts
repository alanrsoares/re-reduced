import { connect } from "react-redux";
import { compose, Dispatch } from "redux";

import { ActionCreator } from "./core";
import { transformTree, Tree } from "./helpers/objects";

export type Dispatcher<T = any> = (payload: T) => void;

const toDispatcher = (dispatch: Dispatch) => <T>(action: ActionCreator<T>) =>
  compose<Dispatcher<T>>(
    dispatch,
    action
  );

type StateToProps<TState, TProps> = (state: TState) => TProps;

/**
 * connectWithActions
 *
 * Wraps react-redux's connect binding dispatch to the action-creators
 *
 * @param actions - object of action-creators
 * @param mapStateToProps - receives redux state and maps to component props
 */
export function connectWithActions<
  TProps extends { actions: TActions },
  TActions extends Tree<ActionCreator<any>> = {},
  TState = {}
>(actions: TActions, mapStateToProps?: StateToProps<TState, TProps>) {
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
}
