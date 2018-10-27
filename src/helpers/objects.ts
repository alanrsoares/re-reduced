import { mapObjIndexed } from "ramda";

export type Node<Leaf> = Leaf | Tree<Leaf>;

export interface Tree<Leaf> {
  [k: string]: Node<Leaf>;
}

export const transformTree = <TLeft, TRight>(
  transform: ((value: TLeft, key: string) => TRight),
  xs: Tree<TLeft>
): Tree<TRight> =>
  mapObjIndexed((value: Node<TLeft>, key: string): Node<TRight> => {
    return typeof value === "object"
      ? transformTree(transform, value as Tree<TLeft>)
      : (transform(value, key) as TRight);
  }, xs);
