import { delay } from "./helpers";
import { ToDo, Tag } from "./types";

const LS_KEY = "re-reduced:todo_app";

const paths = {
  todos: `${LS_KEY}/todos`,
  tags: `${LS_KEY}/tags`
};

export const fetchToDos = async () => {
  await delay(1000);
  return JSON.parse(localStorage.getItem(paths.todos) || "[]") as ToDo[];
};

export const fetchTags = async () => {
  await delay(500);
  return JSON.parse(localStorage.getItem(paths.tags) || "[]") as Tag[];
};

export const addToDo = async (todo: Partial<ToDo>) => {
  const $todo = {
    ...todo,
    id: `todo-id-${Date.now()}`
  } as ToDo;

  const todos = await fetchToDos();

  localStorage.setItem(paths.todos, JSON.stringify(todos.concat($todo)));

  return $todo;
};

export const deleteToDo = async (id: string) => {
  const todos = await fetchToDos();
  const filtered = todos.filter(todo => todo.id !== id);

  localStorage.setItem(paths.todos, JSON.stringify(filtered));

  return id;
};

export const patchToDo = async (updatedToDo: ToDo) => {
  const todos = await fetchToDos();

  const updatedToDos = todos.map(
    todo => (todo.id === updatedToDo.id ? updatedToDo : todo)
  );

  localStorage.setItem(paths.todos, JSON.stringify(updatedToDos));

  return updatedToDo;
};
