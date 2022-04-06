import * as React from "react";
import { Todo } from "./Todo";
import { ITodosProps, ITodo } from "../interfaces";
import { useTodoService } from "../todoService";
export const Todos: React.FC<ITodosProps> = (props) => {
  const { saveTodo, deleteTodo } = useTodoService();

  const handleCompletedChange = async (todoId: string, completed: boolean) => {
    const todo = props.todos?.find((todo) => todo.ID === todoId);
    if (todo) {
      try {
        await saveTodo(
          {
            ...todo,
            Completed: completed,
          },
          true
        );
      } catch (e) {
        e instanceof Error && props.errorHandler(e.message);
      }
    } else {
      props.errorHandler("Todo not found");
    }

    props.refreshTodos();
  };

  const handleDeleteChange = async (todo: ITodo) => {
    try {
      await deleteTodo(todo);
    } catch (e) {
      e instanceof Error && props.errorHandler(e.message);
    }

    props.refreshTodos();
  };

  return (
    <>
      {props.showCompleted &&
        props.todos
          ?.filter((todo) => todo.Completed)
          .map((todo) => {
            return (
              <Todo
                todo={todo}
                handleCompletedChange={handleCompletedChange}
                handleDeleteChange={handleDeleteChange}
                key={todo.ID}
              />
            );
          })}
      {props.showActive &&
        props.todos
          ?.filter((todo) => !todo.Completed)
          .map((todo) => {
            return (
              <Todo
                todo={todo}
                handleCompletedChange={handleCompletedChange}
                handleDeleteChange={handleDeleteChange}
                key={todo.ID}
              />
            );
          })}
    </>
  );
};
