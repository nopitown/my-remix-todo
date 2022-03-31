import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

function getTodos() {
  return [
    {
      title: "Comprar comida para el perro",
      completed: false,
    },
    {
      title: "Limpiar la oficina",
      completed: true,
    },
  ];
}

async function seed() {
  await Promise.all(
    getTodos().map((todo) => {
      return db.todo.create({ data: todo });
    })
  );
}

seed();
