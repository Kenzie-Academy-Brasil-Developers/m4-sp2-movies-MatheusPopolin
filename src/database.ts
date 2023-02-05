import { Client } from "pg";

export const client = new Client({
  user: "User",
  password: "176767",
  host: "localhost",
  database: "m4_sp2",
  port: 5432,
});

export const startDatabase = async (): Promise<void> => {
  await client.connect();
  console.log("Database connected.");
};
