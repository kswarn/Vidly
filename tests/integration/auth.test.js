let server;
let token;

const { User } = require("../../models/user");
const { Genre } = require("../../models/genre");
const request = require("supertest");

describe("Authorization middleware", () => {
  beforeEach(() => {
    server = require("../../app");
    token = new User().generateAuthToken();
  });
  afterEach(async () => {
    await server.close();
    await Genre.remove({});
  });

  const exec = () => {
    //   no need to await the response here, as we don't have any other functionality to be carried out
    return request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  it("should return 401 if no token is given", async () => {
    token = "";

    //   we will await the promise returned by exec here
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if the token is invalid", async () => {
    token = "a";

    //   we will await the promise returned by exec here
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    //   we will await the promise returned by exec here
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
