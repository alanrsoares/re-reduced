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

type StateToProps<TState, TProps extends object = {}> = (
  state: TState
) => TProps;

export function connectWithActions<
  TActions extends Tree<ActionCreator<any>>,
  TState,
  TProps extends object = {}
>(
  actions: TActions,
  mapStateToProps: StateToProps<TState, TProps> = (_: TState) => ({} as TProps)
) {
  const mapDisptachToProps = (dispatch: Dispatch) => ({
    actions: transformTree<ActionCreator, Dispatcher>({
      transformValue: toDispatcher(dispatch)
    })(actions) as Tree<ActionCreator<any>>
  });

  return connect(
    mapStateToProps,
    mapDisptachToProps
  );
}
