export interface ToDo {
  id: string;
  title: string;
  isCompleted: boolean;
  tags: string[];
}

export interface ToDoMap {
  [id: string]: ToDo;
}

export const Filters = {
  All: "All",
  Active: "Active",
  Completed: "Completed",
};

export type Filter = keyof typeof Filters;

export interface State {
  byId: ToDoMap;
  idList: string[];
  isFetching: boolean;
  isAdding: boolean;
}
