import { connect, MapStateToProps } from "react-redux";
import { compose, Dispatch } from "redux";

import { ActionCreator } from "./core";
import { transformTree, Tree } from "./helpers/objects";

export type Dispatcher<T = any> = (payload: T) => void;

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
export function connectWithActions<
  TProps,
  TState = {},
  TOwnProps = {},
  TActions extends Tree<ActionCreator<any>> = {}
>(
  actions: TActions,
  mapStateToProps?: MapStateToProps<Partial<TProps>, TOwnProps, TState>
) {
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
