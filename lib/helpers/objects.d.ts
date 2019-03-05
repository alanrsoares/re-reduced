/**
 * Represents a node in a Tree, a node can be either a Leaf or a Branch (wich is also a Tree)
 */
export declare type Node<TLeaf> = TLeaf | Tree<TLeaf>;
/**
 * Represents a tree-like structure where the leaves have type TLeaf
 */
export interface Tree<TLeaf> {
    [k: string]: Node<TLeaf>;
}
/**
 * Applies a transform function recursively to each leaf in a tree
 *
 * @param transform - a function to be applied to each leaf
 * @param tree - a tree-like object with deeply nested props
 */
export declare const transformTree: <TLeft, TRight>(transform: (value: TLeft, key: string) => TRight, tree: Tree<TLeft>) => Tree<TRight>;
