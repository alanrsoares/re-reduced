"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
/**
 * Applies a transform function recursively to each leaf in a tree
 *
 * @param transform - a function to be applied to each leaf
 * @param tree - a tree-like object with deeply nested props
 */
exports.transformTree = (transform, tree) => ramda_1.mapObjIndexed((value, key) => {
    return typeof value === "object"
        ? exports.transformTree(transform, value)
        : transform(value, key);
}, tree);
