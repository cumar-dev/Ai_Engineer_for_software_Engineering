import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import "dotenv/config";
import { openRouter } from "@/app/Lib/ai";
import {
  countMoviesByGenre,
  findHighlyRatedMovies,
  findSciFiMovies,
  findUsersOver25,
  queryDatabase,
} from "@/app/Lib/database-tools";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: openRouter("nvidia/nemotron-3.5-lightning:free"),
      system: `
        You are a database assistant.
        Answer questions about movies, users, and movie statistics.
        Use the provided tools to retrieve real database results.
        Never invent database results.
        If a question is unrelated to these tools, explain what you can help with.
      `,
      messages: await convertToModelMessages(messages),
      tools: {
        findSciFiMovies: tool({
          description: "Find all science fiction movies.",
          inputSchema: z.object({}),
          execute: async () => findSciFiMovies(),
        }),

        findUsersOver25: tool({
          description: "Find users whose age is greater than 25.",
          inputSchema: z.object({}),
          execute: async () => findUsersOver25(),
        }),

        findHighlyRatedMovies: tool({
          description: "Find movies with a rating above 8.5.",
          inputSchema: z.object({}),
          execute: async () => findHighlyRatedMovies(),
        }),

        countMoviesByGenre: tool({
          description: "Count movies grouped by genre.",
          inputSchema: z.object({}),
          execute: async () => countMoviesByGenre(),
        }),
        queryDatabase: tool({
          description:
            "Search movies or users using genre, rating, release year, or age filters.",

          inputSchema: z.object({
            collection: z.enum(["movies", "users"]),
            genre: z.string().optional(),
            minRating: z.number().min(0).max(10).optional(),
            minYear: z.number().int().optional(),
            maxYear: z.number().int().optional(),
            minAge: z.number().int().min(0).max(130).optional(),
            maxAge: z.number().int().min(0).max(130).optional(),
          }),

          execute: async (input) => queryDatabase(input),
        }),
        getMovies: tool({
          description:
            "Search the OMDb API for a movie by title and year. Return movie details such as title, year, genre, IMDb rating, director, plot, and poster. Do not save the results to MongoDB.",

          inputSchema: z.object({
            title: z.string().min(1).describe("The movie title to search for"),
            year: z
              .number()
              .int()
              .optional()
              .describe("The movie release year"),
          }),

          execute: async ({ title, year }) => {
            const key = process.env.OMDB_API_KEY;

            if (!key) {
              throw new Error("OMDB_API_KEY is missing");
            }

            const url = new URL("https://www.omdbapi.com/");

            url.searchParams.set("apikey", key);
            url.searchParams.set("t", title);

            if (year) {
              url.searchParams.set("y", String(year));
            }

            const moviesResponse = await fetch(url.toString(), {
              cache: "no-store",
            });

            if (!moviesResponse.ok) {
              throw new Error("Failed to fetch data from OMDb API");
            }

            const data = await moviesResponse.json();

            console.log("Movies response:", data);

            if (data.Response === "False") {
              return {
                success: false,
                message: data.Error,
              };
            }

            return {
              success: true,
              movie: {
                title: data.Title,
                year: data.Year,
                genre: data.Genre,
                rating: data.imdbRating,
                director: data.Director,
                description: data.Plot,
                poster: data.Poster,
              },
            };
          },
        }),
        getDadJoke: tool({
          description: "Get a random dad joke or search for jokes by keyword.",

          inputSchema: z.object({
            term: z.string().optional().describe("Keyword to search for"),
          }),

          execute: async ({ term }) => {
            const url = new URL(
              term?.trim()
                ? "https://icanhazdadjoke.com/search"
                : "https://icanhazdadjoke.com/",
            );

            if (term?.trim()) {
              url.searchParams.set("term", term.trim());
            }

            const response = await fetch(url.toString(), {
              headers: {
                Accept: "application/json",
              },
              cache: "no-store",
            });

            if (!response.ok) {
              throw new Error("Failed to fetch dad jokes");
            }

            const data = await response.json();

            if (data.status !== 200) {
              return {
                success: false,
                message: "Could not retrieve dad jokes.",
              };
            }

            if (term?.trim()) {
              return {
                success: true,
                jokes: data.results.map(
                  (item: { id: string; joke: string }) => ({
                    id: item.id,
                    joke: item.joke,
                  }),
                ),
              };
            }

            return {
              success: true,
              joke: data.joke,
              id: data.id,
            };
          },
        }),
      },

      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Failed to process your question." },
      { status: 500 },
    );
  }
}
