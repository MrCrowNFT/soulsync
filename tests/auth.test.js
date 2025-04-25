import {
  login,
  refreshAccessToken,
} from "../backend/controller/auth.controller.js";
import RefreshToken from "../backend/models/refresh-token.model.js";
import { generateTokens } from "../backend/helpers/auth.helpers.js";
import { User } from "../backend/models/user.model.js";
import { generateAccessToken } from "../backend/helpers/auth.helpers.js";
import jwt from "jsonwebtoken";

// Mock dependencies
jest.mock("../backend/models/user.model.js");
jest.mock("../backend/models/refresh-token.model.js");
jest.mock("../backend/helpers/auth.helpers.js");
jest.mock("jsonwebtoken");

describe("Auth Controller - Login", () => {
  // test variables
  let req;
  let res;
  let mockUser;
  let mockTokens;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {
        username: "testuser",
        password: "password123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };

    // Mock user returned from database
    mockUser = {
      _id: "user_id_123",
      username: "testuser",
      email: "test@example.com",
      comparePassword: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnValue({
        _id: "user_id_123",
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword",
      }),
    };

    // Mock token generation
    mockTokens = {
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
    };

    // Setup mock implementations
    User.findOne = jest.fn().mockReturnThis();
    User.select = jest.fn().mockResolvedValue(mockUser);
    generateTokens.mockReturnValue(mockTokens);
    RefreshToken.create = jest.fn().mockResolvedValue({
      token: mockTokens.refreshToken,
      user: mockUser._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  });

  test("should successfully log in a user with valid credentials", async () => {
    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
    expect(mockUser.comparePassword).toHaveBeenCalledWith("password123");
    expect(generateTokens).toHaveBeenCalledWith(mockUser);
    expect(RefreshToken.create).toHaveBeenCalledWith({
      token: mockTokens.refreshToken,
      user: mockUser._id,
      expiresAt: expect.any(Date),
    });
    expect(res.cookie).toHaveBeenCalledWith(
      "refreshToken",
      mockTokens.refreshToken,
      {
        httpOnly: true,
        secure: expect.any(Boolean),
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      accessToken: mockTokens.accessToken,
      data: expect.objectContaining({
        _id: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
      }),
    });

    const userData = res.json.mock.calls[0][0].data;
    expect(userData.password).toBeUndefined();
  });

  test("should fail with 401 if user is not found", async () => {
    // Setup for this test case
    User.select = jest.fn().mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid username",
    });

    expect(generateTokens).not.toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });

  test("should fail with 401 if password is incorrect", async () => {
    mockUser.comparePassword = jest.fn().mockResolvedValue(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid password",
    });

    expect(generateTokens).not.toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });

  test("should return 400 if refresh token cannot be saved to database", async () => {
    RefreshToken.create = jest.fn().mockResolvedValue(null);

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to save refresh token on database",
    });

    expect(res.cookie).not.toHaveBeenCalled();
  });

  test("should handle server errors properly", async () => {
    // simulate a database error
    const errorMessage = "Database connection failed";
    User.select = jest.fn().mockRejectedValue(new Error(errorMessage));
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
    expect(generateTokens).not.toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });
});
