const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const auth = require("../../../middleware/auth");

describe("Auth middleware", () => {
  it("should populate req.user with the payload of a valid json web token", () => {
    const user = {
      _id: mongoose.Types.ObjectId().toHexString(),
      isAdmin: true,
    };
    const token = new User(user).generateAuthToken();

    const req = {
      header: jest.fn().mockReturnValue(token),
    };

    // we won't be using res object here, but we have to pass it
    // to the auth middleware
    const res = {};

    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toMatchObject(user);
  });
});
