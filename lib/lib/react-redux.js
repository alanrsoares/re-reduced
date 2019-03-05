"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const objects_1 = require("../helpers/objects");
const toDispatcher = (dispatch) => (action) => redux_1.compose(dispatch, action);
/**
 * bindActionCreators
 *
 * Monkeypatches dispatch to the actions making them self-dispachable
 *
 * @param actions
 */
exports.bindActionCreators = (actions) => (dispatch) => ({
    actions: objects_1.transformTree(toDispatcher(dispatch), actions)
});
exports.applySelectors = (spec) => ramda_1.applySpec(spec);
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
exports.connectWithActions = (actions, mapStateToProps) => {
    const stateToProps = typeof mapStateToProps === "object"
        ? exports.applySelectors(mapStateToProps)
        : mapStateToProps;
    return react_redux_1.connect(stateToProps, exports.bindActionCreators(actions));
};
