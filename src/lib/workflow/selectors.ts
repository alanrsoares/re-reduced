import { AsyncCollection } from "./types";

/**
 * Transforms a AsyncCollection state object to a plain array
 * by mapping the id list to the indexed map
 *
 * @param state
 */
export const asyncCollectionToList = <T>(state: AsyncCollection<T>): T[] =>
  state.idList.map((id) => state.byId[id]);
