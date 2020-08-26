import { AsyncCollection } from "./types";

export const asyncCollectionToList = <T>(state: AsyncCollection<T>): T[] =>
  state.idList.map((id) => state.byId[id]);
