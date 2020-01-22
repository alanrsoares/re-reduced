import mapObjIndexed from "ramda/src/mapObjIndexed";

/**
 * Represents a node in a Tree, a node can be either a Leaf or a Branch (wich is also a Tree)
 */
export type Node<TLeaf> = TLeaf | Tree<TLeaf>;

/**
 * Represents a tree-like structure where the leaves have type TLeaf
 */
export interface Tree<TLeaf> {
  [key: string]: Node<TLeaf>;
}

/**
 * Applies a transform function recursively to each leaf in a tree
 *
 * @param transform - a function to be applied to each leaf
 * @param tree - a tree-like object with deeply nested props
 */
export function transformTree<TLeft, TRight>(
  transform: (value: TLeft, key: string) => TRight,
  tree: Tree<TLeft>
): Tree<TRight> {
  return mapObjIndexed<Node<TLeft>, Node<TRight>>(
    (value, key) =>
      typeof value === "object"
        ? transformTree(transform, value as Tree<TLeft>)
        : transform(value, key),
    tree
  );
}

/**
 * Verifies whether the `target` has all the properties in `props`
 *
 * @param props
 * @param target
 */
export function hasOwnProps<T extends {}, P extends keyof T>(
  props: P[],
  target: T
) {
  const hasOwnProp = (prop: P) =>
    Object.prototype.hasOwnProperty.call(target, prop);

  return props.every(hasOwnProp);
}
