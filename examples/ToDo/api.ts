import { delay } from "./helpers";
import { ToDo } from "./types";

const LS_KEY = "re-reduced:todo_app";

const paths = {
  todos: `${LS_KEY}/todos`,
  tags: `${LS_KEY}/tags`,
};

export async function fetchToDos(): Promise<ToDo[]> {
  await delay(1000);
  return JSON.parse(localStorage.getItem(paths.todos) || "[]") as ToDo[];
}

export async function addToDo(todo: Partial<ToDo>): Promise<ToDo> {
  const $todo = {
    ...todo,
    id: `todo-id-${Date.now()}`,
  } as ToDo;

  const todos = await fetchToDos();

  localStorage.setItem(paths.todos, JSON.stringify(todos.concat($todo)));

  return $todo;
}

export async function deleteToDo(id: string): Promise<string> {
  const todos = await fetchToDos();
  const filtered = todos.filter((todo) => todo.id !== id);

  localStorage.setItem(paths.todos, JSON.stringify(filtered));

  return id;
}

export async function patchToDo(updatedToDo: ToDo): Promise<ToDo> {
  const todos = await fetchToDos();

  const updatedToDos = todos.map((todo) =>
    todo.id === updatedToDo.id ? updatedToDo : todo
  );

  localStorage.setItem(paths.todos, JSON.stringify(updatedToDos));

  return updatedToDo;
}
