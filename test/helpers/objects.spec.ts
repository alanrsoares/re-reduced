import { transformTree } from "../../src/helpers/objects";

describe("Helpers - Objects", () => {
  describe("transformTree", () => {
    it("should apply a recursive transform function to nodes in a tree-like object", () => {
      const input = {
        a: {
          a1: {
            a1_1: "a1_1",
          },
        },
        b: {
          b1: {
            b1_1: "b1_1",
          },
        },
        c: "c",
      };

      const expected = {
        a: {
          a1: {
            a1_1: "A1_1",
          },
        },
        b: {
          b1: {
            b1_1: "B1_1",
          },
        },
        c: "C",
      };

      const transform = (x: string) => x.toUpperCase();
      const actual = transformTree(transform, input);

      expect(actual).toEqual(expected);
    });
  });
});
