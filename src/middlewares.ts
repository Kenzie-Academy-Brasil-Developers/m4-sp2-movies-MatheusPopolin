import { NextFunction, Request, Response } from "express";
import { client } from "./database";
import { QueryConfig, QueryResult } from "pg";

export const ensureMovieExists = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const id = Number(request.params.id);

  const queryString: string = `
        SELECT *
        FROM movies
        WHERE id = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  if (queryResult.rowCount === 0) {
    return response.status(404).json({ message: "Movie not found." });
  }

  return next();
};

export const ensureNameIsUnused = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const name = request.body.name;

  const queryString: string = `
    SELECT *
    FROM movies
    WHERE name = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [name],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  if (queryResult.rowCount > 0) {
    return response.status(409).json({ message: "Movie already exists." });
  }

  return next();
};

export const validateKeysType = (
  request: Request,
  response: Response,
  next: NextFunction
): Response | void => {
  if (request.body.name && typeof request.body.name !== "string") {
    return response
      .status(400)
      .json({ message: `The item name need to be a string.` });
  }

  if (
    request.body.description &&
    typeof request.body.description !== "string"
  ) {
    return response
      .status(400)
      .json({ message: `The item description need to be a string.` });
  }

  if (request.body.duration && typeof request.body.duration !== "number") {
    return response
      .status(400)
      .json({ message: `The item duration need to be a number.` });
  }

  if (request.body.price && typeof request.body.price !== "number") {
    return response
      .status(400)
      .json({ message: `The item price need to be a number.` });
  }

  return next();
};
