const request = require("supertest");
const mongoose = require("mongoose");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const admin = require("../../middleware/admin");

let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../app");
  });
  afterEach(async () => {
    await server.close();
    await Genre.remove({});
  });

  describe("Get /", () => {
    it("should return all genres", async () => {
      Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
        { name: "genre3" },
      ]);

      const res = await request(server).get("/api/genres");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre3")).toBeTruthy();
    });
  });

  describe("Get /:id", () => {
    it("should return the specified genre if it exists in the database", async () => {
      const genre = new Genre({
        name: "genre1",
      });

      await genre.save();

      const res = await request(server).get("/api/genres/" + genre._id);

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty("name", genre.name);
    });

    it("should return 404 if invalid id is passed", async () => {
      // since we are testing for invalid genre id, it doesn't matter if the collection
      // is empty or has fifty properties, so we can write and execute this test without
      // creating a new genre

      const res = await request(server).get("/api/genres/1");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    it("should return 401 if the client is not logged in", async () => {
      const res = await request(server)
        .post("/api/genres")
        .send({ name: "genre1" });

      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is invalid(less than 5 chars)", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "1234" });

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is invalid(more than 50 chars)", async () => {
      const token = new User().generateAuthToken();

      const name = new Array(52).join("a");

      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: name });

      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "genre1" });

      const genre = await Genre.find({ name: "genre1" });

      expect(genre).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      // testing if the genre is present in the res.body for the line res.send(genre)
      // in the genres route
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "genre1" });

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  describe("PUT /:id", () => {
    it("should return 401 if the client is not logged in", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const res = await request(server)
        .put("/api/genres/" + genre._id)
        .send({ name: "genre2" });

      expect(res.status).toBe(401);
    });

    it("should return 400 if name is invalid(less than 5 characters)", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const token = new User().generateAuthToken();
      const res = await request(server)
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "1234" });

      expect(res.status).toBe(400);
    });

    it("should return 400 if name is invalid(more than 50 characters)", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const token = new User().generateAuthToken();

      const name = new Array(52).join("a");

      const res = await request(server)
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "name" });

      expect(res.status).toBe(400);
    });

    it("should update the genre if the id is valid", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const token = new User().generateAuthToken();

      const res = await request(server)
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "genre2" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "genre2");
    });

    it("should return 404 if genre is not found", async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .put("/api/genres/1")
        .set("x-auth-token", token)
        .send({ name: "genre1" });

      expect(res.status).toBe(404);
    });

    it("should return the genre after updation", async () => {
      const genre = new Genre({
        name: "genre1",
      });

      await genre.save();

      const token = new User().generateAuthToken();

      const res = await request(server)
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "genre2" });

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre2");
    });
  });

  describe("DELETE /:id", () => {
    it("should return 404 if id is invalid", async () => {
      const user = {
        _id: mongoose.Types.ObjectId().toHexString(),
        isAdmin: true,
      };

      const token = new User(user).generateAuthToken();
      const res = await request(server)
        .delete("/api/genres/1")
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });
    it("should return 401 if client is not logged in", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const res = await request(server)
        .put("/api/genres/" + genre._id)
        .send({ name: "genre2" });

      expect(res.status).toBe(401);
    });
    it("should return 403 if client is unauthorized(not an admin)", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const user = {
        _id: mongoose.Types.ObjectId().toHexString(),
        isAdmin: false,
      };

      const token = new User(user).generateAuthToken();

      const res = await request(server)
        .delete("/api/genres/" + genre._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(403);
    });
    it("should return 200 if genre was deleted", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const user = {
        _id: mongoose.Types.ObjectId().toHexString(),
        isAdmin: true,
      };

      const token = new User(user).generateAuthToken();

      const res = await request(server)
        .delete("/api/genres/" + genre._id)
        .set("x-auth-token", token);

      const response = await Genre.find({ name: "genre1" });

      expect(response.status).toBeUndefined();
      expect(res.status).toBe(200);
    });
    it("should return the genre after deletion", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const user = {
        _id: mongoose.Types.ObjectId().toHexString(),
        isAdmin: true,
      };

      const token = new User(user).generateAuthToken();

      const res = await request(server)
        .delete("/api/genres/" + genre._id)
        .set("x-auth-token", token);

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });
});
