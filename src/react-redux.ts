import { connect } from "react-redux";
import { compose, Dispatch } from "redux";

import { ActionCreator, ActionHandlerMap } from "./core";
import { transformTree, Tree } from "./helpers/objects";

export type Dispatcher<T = any> = (payload: T) => void;

const toDispatcher = (dispatch: Dispatch) => <T>(action: ActionCreator<T>) =>
  compose<Dispatcher<T>>(
    dispatch,
    action
  );

export const connectWithActions = <T extends Tree<ActionCreator<any>>>(
  actions: T
) => <TState, TProps>(mapStateToProps: (state: TState) => TProps) => {
  const mapDisptachToProps = (dispatch: Dispatch) => ({
    actions: transformTree<ActionCreator, Dispatcher>({
      transformValue: toDispatcher(dispatch)
    })(actions) as Tree<ActionCreator<any>>
  });

  return connect(
    mapStateToProps,
    mapDisptachToProps
  );
};
