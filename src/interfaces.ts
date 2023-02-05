import { QueryResult } from "pg";

export interface iMovie {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export type iMovieResult = QueryResult<iMovie>;

export type MovieRequiredKeys = "name" | "description" | "duration" | "price";
