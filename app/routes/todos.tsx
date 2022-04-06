import { Todo } from "@prisma/client";
import { useEffect, useRef } from "react";
import {
  LinksFunction,
  ActionFunction,
  Form,
  json,
  useLoaderData,
  useSubmit,
  useTransition,
} from "remix";
import { db } from "~/utils/db.server";
import stylesUrl from "~/styles/todos.css";

type LoaderData = {
  todos: Array<Todo>;
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const loader = async () => {
  const data: LoaderData = {
    todos: await db.todo.findMany(),
  };

  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  let action = formData.get("_action");

  switch (action) {
    case "create": {
      const title = formData.get("title");

      if (typeof title !== "string" || title?.length === 0) {
        return json(
          {
            formError: "Form not submitted correctly",
          },
          {
            status: 400,
          }
        );
      }

      const newTodo = await db.todo.create({
        data: {
          title,
          completed: false,
        },
      });

      return json(newTodo, {
        status: 201,
      });
    }

    case "update": {
      const id = formData.get("id");
      const completed = formData.get("completed");

      if (
        typeof id !== "string" ||
        id?.length === 0 ||
        typeof completed !== "string" ||
        completed?.length === 0
      ) {
        return json(
          {
            formError: "Form not submitted correctly",
          },
          {
            status: 400,
          }
        );
      }

      const updatedTodo = await db.todo.update({
        where: {
          id: Number(id),
        },
        data: {
          completed: JSON.parse(completed),
        },
      });

      return json(updatedTodo, {
        status: 200,
      });
    }
    default: {
      throw new Error("Unexpected action");
    }
  }
};

export default function Todos() {
  const { todos } = useLoaderData<LoaderData>();
  const transition = useTransition();
  const submit = useSubmit();

  const isAdding =
    transition.state === "submitting" &&
    transition.submission.formData.get("_action") === "create";
  let formRef = useRef<HTMLFormElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);

  const handleChangeTodo = (e: React.ChangeEvent<HTMLFormElement>) => {
    submit(e.currentTarget);
  };

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [isAdding]);

  return (
    <div>
      <Form method="post" ref={formRef}>
        <input type="text" name="title" ref={inputRef} />
        <button type="submit" name="_action" value="create" disabled={isAdding}>
          Add
        </button>
      </Form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <Form method="post" onChange={handleChangeTodo}>
              <label htmlFor={`checkbox-${todo.id}`}>
                <input type="hidden" name="id" value={todo.id} />
                <input type="hidden" name="_action" value="update" />
                <input
                  name="completed"
                  type="hidden"
                  value={(!todo.completed).toString()}
                />
                <input
                  type="checkbox"
                  defaultChecked={todo.completed}
                  id={`checkbox-${todo.id}`}
                />
                {todo.title}
              </label>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}
