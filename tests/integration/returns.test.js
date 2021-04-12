const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../models/user");
const { Rental } = require("../../models/rental");
const { Movie } = require("../../models/movie");
const moment = require("moment");

let server;
let rental;
let customerId;
let movieId;
let movie;
let token;

describe("Returning rentals /api/returns", () => {
  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    server = require("../../app");
    customerId = mongoose.Types.ObjectId().toHexString();
    movieId = mongoose.Types.ObjectId().toHexString();

    const user = {
      _id: mongoose.Types.ObjectId().toHexString(),
      isAdmin: false,
    };

    token = new User(user).generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: "12335",
      dailyRentalRate: 2,
      genre: { name: "123456" },
      numberInStock: 10,
    });

    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "99164540987",
        isGold: false,
      },
      movie: {
        _id: movieId,
        title: "12345",
        dailyRentalRate: 2,
      },
    });

    await rental.save();
  });

  afterEach(async () => {
    await server.close();
    await Rental.remove({});
    await Movie.remove({});
  });

  it("should return 401 if the client is not logged in", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if the customerId is not provided", async () => {
    customerId = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 400 if the movieId is not provided", async () => {
    movieId = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 404 if the rental is not found for the given customer/movie", async () => {
    await Rental.remove({});

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it("should return 400 if the return is already processed", async () => {
    rental.dateReturned = new Date();

    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if it is a valid request and update the rental doc", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should set the returnDate if the input is valid", async () => {
    const res = await exec();

    const rentalInDb = await Rental.findById(rental._id);

    const diff = new Date() - rentalInDb.dateReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should set the rentalFee if the input is valid", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();

    const res = await exec();

    const rentalInDb = await Rental.findById(rental._id);

    expect(rentalInDb.rentalFee).toBe(14);
  });

  it("should increment the movie stock by one if the movie was returned successfully", async () => {
    const res = await exec();

    const movieInDb = await Movie.findById(movieId);

    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rental summary to the client", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "dateOut",
        "dateReturned",
        "movie",
        "customer",
        "rentalFee",
      ])
    );
  });
});
