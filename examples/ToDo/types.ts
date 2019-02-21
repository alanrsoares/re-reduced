export interface ToDo {
  id: string;
  title: string;
  isCompleted: boolean;
  tags: string[];
}

export interface ToDoMap {
  [id: string]: ToDo;
}

export enum FILTERS {
  All = "All",
  Active = "Active",
  Completed = "Completed"
}

export type Filter = keyof typeof FILTERS;

export interface State {
  byId: ToDoMap;
  idList: string[];
  isFetching: boolean;
  isAdding: boolean;
}
