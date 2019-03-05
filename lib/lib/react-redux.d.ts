import { InferableComponentEnhancerWithProps, MapStateToProps } from "react-redux";
import { Dispatch } from "redux";
import { ActionCreator } from "./core";
import { Tree } from "../helpers/objects";
export declare type Dispatcher<T = any> = (payload: T) => void;
export declare type SelectorSpec<TProps, TState, TOwnProps = {}> = {
    [K in keyof TProps]: (state: TState, ownProps?: TOwnProps) => TProps[K];
};
export interface ConnectWithActions {
    <TProps extends {
        actions: TActions;
    }, TOwnProps = {}, TActions extends Tree<ActionCreator<any>> = {}>(actions: TActions): InferableComponentEnhancerWithProps<TProps, TOwnProps>;
    <TProps extends {
        actions: TActions;
    }, TOwnProps = {}, TState extends {} = any, TActions extends Tree<ActionCreator<any>> = {}>(actions: TActions, mapStateToProps: MapStateToProps<Partial<TProps>, TOwnProps, TState> | SelectorSpec<Partial<TProps>, TState, TOwnProps>): InferableComponentEnhancerWithProps<TProps, TOwnProps>;
}
/**
 * bindActionCreators
 *
 * Monkeypatches dispatch to the actions making them self-dispachable
 *
 * @param actions
 */
export declare const bindActionCreators: <TActions extends Tree<ActionCreator<any, any>>>(actions: TActions) => (dispatch: Dispatch<import("redux").AnyAction>) => {
    actions: TActions;
};
export declare const applySelectors: <TProps = {}, TState = {}, TOwnProps = {}>(spec: SelectorSpec<TProps, TState, TOwnProps>) => MapStateToProps<Partial<TProps>, TOwnProps, TState>;
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
export declare const connectWithActions: ConnectWithActions;
