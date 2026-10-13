import mongoose from "mongoose";
import { connectDB } from "../Lib/MongoDB";
import { Reviews } from "../Models/Reviews";
import { Movies } from "../Models/Movies";
import { Users } from "../Models/Users";

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing sample data
    await Reviews.deleteMany({});
    await Movies.deleteMany({});
    await Users.deleteMany({});

    // Create 20 movies
    const movies = await Movies.insertMany([
      {
        title: "Interstellar",
        year: 2014,
        genre: "Sci-Fi",
        rating: 8.7,
        director: "Christopher Nolan",
        description: "A team travels through a wormhole to save humanity.",
      },
      {
        title: "Inception",
        year: 2010,
        genre: "Sci-Fi",
        rating: 8.8,
        director: "Christopher Nolan",
        description: "A thief enters dreams to steal secrets.",
      },
      {
        title: "The Dark Knight",
        year: 2008,
        genre: "Action",
        rating: 9.0,
        director: "Christopher Nolan",
        description: "Batman faces the Joker in Gotham City.",
      },
      {
        title: "Titanic",
        year: 1997,
        genre: "Romance",
        rating: 7.9,
        director: "James Cameron",
        description: "A romance unfolds aboard the Titanic.",
      },
      {
        title: "Avatar",
        year: 2009,
        genre: "Sci-Fi",
        rating: 7.9,
        director: "James Cameron",
        description: "Humans encounter the world of Pandora.",
      },
      {
        title: "The Matrix",
        year: 1999,
        genre: "Sci-Fi",
        rating: 8.7,
        director: "Lana and Lilly Wachowski",
        description: "A hacker discovers that reality is a simulation.",
      },
      {
        title: "Gladiator",
        year: 2000,
        genre: "Action",
        rating: 8.5,
        director: "Ridley Scott",
        description: "A betrayed Roman general seeks justice.",
      },
      {
        title: "The Shawshank Redemption",
        year: 1994,
        genre: "Drama",
        rating: 9.3,
        director: "Frank Darabont",
        description: "Two prisoners build a friendship over many years.",
      },
      {
        title: "The Godfather",
        year: 1972,
        genre: "Crime",
        rating: 9.2,
        director: "Francis Ford Coppola",
        description: "The story of a powerful Italian-American crime family.",
      },
      {
        title: "Forrest Gump",
        year: 1994,
        genre: "Drama",
        rating: 8.8,
        director: "Robert Zemeckis",
        description: "A man experiences major moments in American history.",
      },
      {
        title: "Jurassic Park",
        year: 1993,
        genre: "Adventure",
        rating: 8.2,
        director: "Steven Spielberg",
        description: "Scientists create a theme park with living dinosaurs.",
      },
      {
        title: "The Lion King",
        year: 1994,
        genre: "Animation",
        rating: 8.5,
        director: "Roger Allers",
        description: "A young lion learns to become king.",
      },
      {
        title: "Finding Nemo",
        year: 2003,
        genre: "Animation",
        rating: 8.2,
        director: "Andrew Stanton",
        description: "A clownfish searches the ocean for his son.",
      },
      {
        title: "The Avengers",
        year: 2012,
        genre: "Action",
        rating: 8.0,
        director: "Joss Whedon",
        description: "Superheroes unite to defend Earth.",
      },
      {
        title: "Joker",
        year: 2019,
        genre: "Crime",
        rating: 8.4,
        director: "Todd Phillips",
        description: "A troubled man transforms into a notorious criminal.",
      },
      {
        title: "La La Land",
        year: 2016,
        genre: "Romance",
        rating: 8.0,
        director: "Damien Chazelle",
        description: "Two artists pursue their dreams in Los Angeles.",
      },
      {
        title: "The Conjuring",
        year: 2013,
        genre: "Horror",
        rating: 7.5,
        director: "James Wan",
        description:
          "Paranormal investigators help a family in a haunted house.",
      },
      {
        title: "Toy Story",
        year: 1995,
        genre: "Animation",
        rating: 8.3,
        director: "John Lasseter",
        description: "Toys come to life when humans are not around.",
      },
      {
        title: "Mad Max: Fury Road",
        year: 2015,
        genre: "Action",
        rating: 8.1,
        director: "George Miller",
        description: "Survivors escape across a dangerous desert.",
      },
      {
        title: "The Martian",
        year: 2015,
        genre: "Sci-Fi",
        rating: 8.0,
        director: "Ridley Scott",
        description: "An astronaut struggles to survive alone on Mars.",
      },
    ]);

    // Create 15 users
    const users = await Users.insertMany([
      {
        name: "Ahmed",
        email: "ahmed@example.com",
        age: 28,
        favourite_genre: "Sci-Fi",
      },
      {
        name: "Amina",
        email: "amina@example.com",
        age: 22,
        favourite_genre: "Romance",
      },
      {
        name: "Mohamed",
        email: "mohamed@example.com",
        age: 35,
        favourite_genre: "Action",
      },
      {
        name: "Fatima",
        email: "fatima@example.com",
        age: 31,
        favourite_genre: "Drama",
      },
      {
        name: "Hassan",
        email: "hassan@example.com",
        age: 25,
        favourite_genre: "Crime",
      },
      {
        name: "Khadija",
        email: "khadija@example.com",
        age: 27,
        favourite_genre: "Animation",
      },
      {
        name: "Abdi",
        email: "abdi@example.com",
        age: 19,
        favourite_genre: "Action",
      },
      {
        name: "Maryan",
        email: "maryan@example.com",
        age: 42,
        favourite_genre: "Drama",
      },
      {
        name: "Yusuf",
        email: "yusuf@example.com",
        age: 33,
        favourite_genre: "Sci-Fi",
      },
      {
        name: "Hodan",
        email: "hodan@example.com",
        age: 24,
        favourite_genre: "Romance",
      },
      {
        name: "Omar",
        email: "omar@example.com",
        age: 29,
        favourite_genre: "Horror",
      },
      {
        name: "Sahra",
        email: "sahra@example.com",
        age: 38,
        favourite_genre: "Adventure",
      },
      {
        name: "Abdullahi",
        email: "abdullahi@example.com",
        age: 26,
        favourite_genre: "Crime",
      },
      {
        name: "Nimco",
        email: "nimco@example.com",
        age: 21,
        favourite_genre: "Animation",
      },
      {
        name: "Ismail",
        email: "ismail@example.com",
        age: 45,
        favourite_genre: "Action",
      },
    ]);

    // Create 30 reviews using actual MongoDB ObjectIds
    const reviewData = [
      [0, 0, 9, "An amazing science fiction movie."],
      [1, 1, 10, "A brilliant and creative story."],
      [2, 2, 9, "One of the best action movies."],
      [3, 3, 8, "A moving romantic story."],
      [4, 4, 8, "An impressive world and visuals."],
      [5, 5, 9, "A fascinating science fiction classic."],
      [6, 6, 8, "Great action and performances."],
      [7, 7, 10, "A powerful and inspiring drama."],
      [8, 8, 9, "An unforgettable crime classic."],
      [9, 9, 9, "A touching story about life."],
      [10, 10, 8, "An exciting adventure."],
      [11, 11, 9, "A wonderful animated film."],
      [12, 12, 8, "Funny, emotional, and entertaining."],
      [13, 13, 8, "An enjoyable superhero movie."],
      [14, 14, 8, "A dark and compelling character study."],
      [15, 0, 8, "Beautiful music and cinematography."],
      [16, 1, 7, "A spooky and suspenseful horror film."],
      [17, 2, 9, "A childhood favorite."],
      [18, 3, 8, "Excellent action sequences."],
      [19, 4, 8, "An interesting survival story."],
      [0, 5, 10, "I could watch this again and again."],
      [1, 6, 9, "Very clever and well directed."],
      [2, 7, 10, "An outstanding film."],
      [5, 8, 9, "One of my favorite movies."],
      [7, 9, 9, "Excellent storytelling."],
      [9, 10, 8, "Very entertaining from start to finish."],
      [11, 11, 9, "Great characters and animation."],
      [13, 12, 8, "A fun movie night choice."],
      [18, 13, 9, "Intense and visually impressive."],
      [19, 14, 8, "A great science fiction adventure."],
    ] as const;

    await Reviews.insertMany(
      reviewData.map(([movieIndex, userIndex, rating, comment], index) => ({
        id: `review${index + 1}`,
        movie_id: movies[movieIndex]._id,
        user_id: users[userIndex]._id,
        rating,
        comment,
      })),
    );

    console.log("Database seeded successfully!");
    console.log({
      movies: await Movies.countDocuments(),
      users: await Users.countDocuments(),
      reviews: await Reviews.countDocuments(),
    });
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
