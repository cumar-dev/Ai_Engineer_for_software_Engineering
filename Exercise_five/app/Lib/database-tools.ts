import { Movies } from "../Models/Movies";
import { Users } from "../Models/Users";
import { connectDB } from "./MongoDB";

type QueryInput = {
  collection: "movies" | "users";
  genre?: string;
  minRating?: number;
  minYear?: number;
  maxYear?: number;
  minAge?: number;
  maxAge?: number;
};

export async function queryDatabase(input: QueryInput) {
  await connectDB();

  const limit = 20;

  if (input.collection === "movies") {
    const filter: Record<string, any> = {};

    if (input.genre) {
      filter.genre = {
        $regex: `^${input.genre}$`,
        $options: "i",
      };
    }

    if (input.minRating !== undefined) {
      if (input.minRating < 0 || input.minRating > 10) {
        throw new Error("Rating must be between 0 and 10");
      }

      filter.rating = { $gt: input.minRating };
    }

    if (input.minYear !== undefined || input.maxYear !== undefined) {
      filter.year = {};

      if (input.minYear !== undefined) {
        filter.year.$gte = input.minYear;
      }

      if (input.maxYear !== undefined) {
        filter.year.$lte = input.maxYear;
      }
    }

    const data = await Movies.find(filter)
      .select("title year genre rating director")
      .limit(limit)
      .lean();

    return {
      success: true,
      collection: "movies",
      operation: "find",
      count: data.length,
      limit,
      data,
    };
  }

  const filter: Record<string, any> = {};

  if (input.minAge !== undefined || input.maxAge !== undefined) {
    filter.age = {};

    if (input.minAge !== undefined) {
      filter.age.$gt = input.minAge;
    }

    if (input.maxAge !== undefined) {
      filter.age.$lt = input.maxAge;
    }
  }

  if (input.genre) {
    filter.favorite_genre = {
      $regex: `^${input.genre}$`,
      $options: "i",
    };
  }

  const data = await Users.find(filter)
    .select("name age favorite_genre")
    .limit(limit)
    .lean();

  return {
    success: true,
    collection: "users",
    operation: "find",
    count: data.length,
    limit,
    data,
  };
}

export async function findSciFiMovies() {
  await connectDB();

  const movies = await Movies.find({
    genre: { $regex: /^sci-fi$/i },
  })
    .select("title year genre rating director")
    .limit(20)
    .lean();

  return {
    success: true,
    collection: "movies",
    operation: "find",
    count: movies.length,
    data: movies,
  };
}

export async function findUsersOver25() {
  await connectDB();

  const users = await Users.find({
    age: { $gt: 25 },
  })
    .select("name age favorite_genre")
    .limit(20)
    .lean();

  return {
    success: true,
    collection: "users",
    operation: "find",
    count: users.length,
    data: users,
  };
}

export async function findHighlyRatedMovies() {
  await connectDB();

  const movies = await Movies.find({
    rating: { $gt: 8.5 },
  })
    .select("title year genre rating")
    .limit(20)
    .lean();

  return {
    success: true,
    collection: "movies",
    operation: "find",
    count: movies.length,
    data: movies,
  };
}

export async function countMoviesByGenre() {
  await connectDB();

  const results = await Movies.aggregate([
    {
      $group: {
        _id: "$genre",
        total: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  return {
    success: true,
    collection: "movies",
    operation: "aggregate",
    count: results.length,
    data: results.map((item) => ({
      genre: item._id,
      total: item.total,
    })),
  };
}
