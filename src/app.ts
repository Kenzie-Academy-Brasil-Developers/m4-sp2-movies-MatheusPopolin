import express, { Application, json } from "express";
import { startDatabase } from "./database";
import { createMovie, readAllMovies, updateMovie, deleteMovie } from "./functions";
import { ensureMovieExists, ensureNameIsUnused, validateKeysType } from "./middlewares";

const app: Application = express();
app.use(json());

app.post("/movies", validateKeysType, ensureNameIsUnused, createMovie)
app.get("/movies", readAllMovies)
app.patch("/movies/:id", validateKeysType, ensureMovieExists, ensureNameIsUnused, updateMovie) 
app.delete("/movies/:id", ensureMovieExists, deleteMovie) 

const PORT: number = 3000;
const runningMsg: string = `Server running on http://localhost:${PORT}`;

app.listen(PORT, async () => {
    await startDatabase();
    console.log(runningMsg);
});
