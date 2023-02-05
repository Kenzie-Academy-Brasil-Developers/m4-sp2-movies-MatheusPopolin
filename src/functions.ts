import { Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import format from "pg-format";
import { iMovieResult, MovieRequiredKeys } from "./interfaces";

export const createMovie = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const requiredKeys: MovieRequiredKeys[] = [
    "description",
    "duration",
    "name",
    "price",
  ];
  try {
    const { name, description, duration, price } = request.body;

    const queryString: string = `
    INSERT INTO "movies"
      (name, duration, description, price)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *;
    `;

    const queryConfig: QueryConfig = {
      text: queryString,
      values: [name, duration, description, price],
    };

    const queryResult: iMovieResult = await client.query(queryConfig);

    return response.status(201).json(queryResult.rows);
  } catch (error) {
    return response.status(400).json({
      message: `Required keys are ${requiredKeys}.`,
    });
  }
};

export const readAllMovies = async (
  request: Request,
  response: Response
): Promise<Response> => {
  let page = request.query.page ? Number(request.query.page) : 1;
  let perPage = request.query.perPage ? Number(request.query.perPage) : 5;

  if (!page || page < 1) {
    page = 1;
  }

  if (!perPage || perPage < 1 || perPage > 5) {
    perPage = 5;
  }

  let queryString: string = `
  SELECT *
  FROM movies
  LIMIT $1 OFFSET $2;
  `;

  let queryConfig: QueryConfig = {
    text: queryString,
    values: [perPage, (page - 1) * perPage],
  };

  const sort: string | null =
    request.query.sort === "price" || request.query.sort === "duration"
      ? request.query.sort
      : null;

  if (sort) {
    const order: string =
      request.query.order === "asc" || request.query.order === "desc"
        ? request.query.order.toUpperCase()
        : "ASC";

    queryString = format(
      `
        SELECT *
        FROM movies
        ORDER BY %I %s 
        LIMIT $1 OFFSET $2;
        `,
      sort,
      order
    );

    queryConfig = {
      text: queryString,
      values: [perPage, (page - 1) * perPage],
    };
  }

  const queryResult: iMovieResult = await client.query(queryConfig);

  const previousPage =
    page > 1
      ? `http://localhost:3000/movies?page=${page - 1}&perPage${perPage}`
      : null;

  const nextPage =
    queryResult.rowCount === perPage
      ? `http://localhost:3000/movies?page=${page + 1}&perPage${perPage}`
      : null;

  return response.status(200).json({
    previousPage: previousPage,
    nextPage: nextPage,
    count: queryResult.rowCount,
    data: queryResult.rows,
  });
};

export const updateMovie = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id = Number(request.params.id);

  if (!(request.body === true)) {
    return response.status(400).json({
      message: `Body is required.`,
    });
  }

  const queryString: string = format(
    `
        UPDATE movies 
        SET (%I) = ROW (%L)
        WHERE id = $1
        RETURNING *;
    `,
    Object.keys(request.body),
    Object.values(request.body)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: iMovieResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

export const deleteMovie = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const id = Number(request.params.id);

  const queryString: string = `
        DELETE FROM movies 
        WHERE id = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  await client.query(queryConfig);

  return response.status(204).send();
};
