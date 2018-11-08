export interface ToDo {
  id: string;
  title: string;
  isCompleted: boolean;
  tags: string[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export enum FILTERS {
  All = "All",
  Active = "Active",
  Completed = "Completed"
}

export type Filter = keyof typeof FILTERS;

export interface ToDosState {
  byId: {
    [id: string]: ToDo;
  };
  idList: string[];
  isFetching: boolean;
  isAdding: boolean;
}

export interface TagsState {
  byId: {
    [id: string]: Tag;
  };
  idList: string[];
}

export interface State {
  todos: ToDosState;
  tags: TagsState;
}
