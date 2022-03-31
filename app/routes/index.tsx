import { Todo } from "@prisma/client";
import { json, useLoaderData } from "remix";

type LoaderData = {
  todos: Array<Todo>;
};

export const loader = async () => {
  const data: LoaderData = {
    todos: [],
  };

  return json(data);
};

export default function Index() {
  const { todos } = useLoaderData<LoaderData>();

  console.log(todos);
  return <div></div>;
}
