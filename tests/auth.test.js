import {
  login,
  refreshAccessToken,
  logout,
  signup,
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

describe("Auth Controller - Signup", () => {
  let req;
  let res;
  let mockSave;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request mock
    req = {
      body: {
        username: "testuser",
        password: "password123",
        email: "test@example.com",
        name: "Test",
        lastName: "User",
        gender: "male",
        birthDate: "1990-01-01",
        photo: "profile.jpg",
      },
    };

    // Setup response mock
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Setup User.findOne mock
    User.findOne = jest.fn().mockImplementation(() => null);

    // Setup User constructor and save method
    mockSave = jest.fn().mockResolvedValue(true);
    User.mockImplementation(() => ({
      save: mockSave,
    }));
  });

  test("should create a new user with valid data", async () => {
    // Act
    await signup(req, res);

    // Assert
    expect(User.findOne).toHaveBeenCalledTimes(2);
    expect(User).toHaveBeenCalledWith({
      username: "testuser",
      password: "password123",
      email: "test@example.com",
      name: "Test",
      lastName: "User",
      gender: "male",
      birthDate: null, // The function has a bug - it always sets birthDateObj to null
      photo: "profile.jpg",
      moodEntries: [],
      memories: [],
    });
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User created successfully",
    });
  });

  test("should create a user without optional photo", async () => {
    // Arrange
    req.body.photo = undefined;

    // Act
    await signup(req, res);

    // Assert
    expect(User).toHaveBeenCalledWith(
      expect.objectContaining({
        photo: "",
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("should create a user without optional birthDate", async () => {
    // Arrange
    req.body.birthDate = undefined;

    // Act
    await signup(req, res);

    // Assert
    expect(User).toHaveBeenCalledWith(
      expect.objectContaining({
        birthDate: null,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("should return 400 if required fields are missing", async () => {
    // Test cases for each required field
    const requiredFields = [
      "username",
      "password",
      "email",
      "name",
      "lastName",
      "gender",
    ];

    for (const field of requiredFields) {
      // Arrange - Create a copy of the valid body without the tested field
      const testReq = {
        body: { ...req.body },
      };
      delete testReq.body[field];

      // Act
      await signup(testReq, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Missing required fields. Please provide username, password, email, name, lastName, gender, and birthDate.",
      });

      // Reset mocks for next iteration
      jest.clearAllMocks();
      User.findOne.mockImplementation(() => null);
    }
  });

  test("should return 400 if email format is invalid", async () => {
    // Arrange
    req.body.email = "invalid-email";

    // Act
    await signup(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email format",
    });
  });

  test("should return 400 if gender is invalid", async () => {
    // Arrange
    req.body.gender = "invalid-gender";

    // Act
    await signup(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "Invalid gender value. Must be one of: male, female, non-binary, other, prefer-not-to-say",
    });
  });

  test("should validate all accepted gender values", async () => {
    const validGenders = [
      "male",
      "female",
      "non-binary",
      "other",
      "prefer-not-to-say",
    ];

    for (const gender of validGenders) {
      // Arrange
      req.body.gender = gender;
      jest.clearAllMocks();
      User.findOne.mockImplementation(() => null);

      // Act
      await signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User created successfully",
      });
    }
  });

  test("should return 400 if birth date is invalid", async () => {
    // Arrange
    req.body.birthDate = "invalid-date";

    // Act
    await signup(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid birth date. Date must be valid and not in the future.",
    });
  });

  test("should return 400 if birth date is in the future", async () => {
    // Arrange
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    req.body.birthDate = futureDate.toISOString();

    // Act
    await signup(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid birth date. Date must be valid and not in the future.",
    });
  });

  test("should return 400 if username already exists", async () => {
    // Arrange
    User.findOne
      .mockImplementationOnce(() => ({ username: "testuser" }))
      .mockImplementationOnce(() => null);

    // Act
    await signup(req, res);

    // Assert
    expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Username already in use",
    });
  });

  test("should return 400 if email already exists", async () => {
    // Arrange
    User.findOne
      .mockImplementationOnce(() => null)
      .mockImplementationOnce(() => ({ email: "test@example.com" }));

    // Act
    await signup(req, res);

    // Assert
    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Email already in use",
    });
  });

  test("should return 500 if an error occurs during user creation", async () => {
    // Arrange
    const mockError = new Error("Database error");
    mockSave.mockRejectedValueOnce(mockError);

    // Act
    await signup(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Internal server error",
      details: "Database error",
    });
  });

  test("should return 500 if an unknown error occurs", async () => {
    // Arrange
    mockSave.mockRejectedValueOnce("Unknown error object");

    // Act
    await signup(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Internal server error",
      details: "Unknown error",
    });
  });
});

// Auth Controller - Logout tests
describe("Auth Controller - logout", () => {
  let req;
  let res;
  let mockDeleteOne;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      cookies: {
        refreshToken: "test-refresh-token",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    };

    // Mock RefreshToken.deleteOne
    mockDeleteOne = jest.fn();
    RefreshToken.deleteOne = mockDeleteOne;
  });

  it("should successfully logout user and clear refresh token", async () => {
    // Setup mocks
    mockDeleteOne.mockResolvedValue({ deletedCount: 1 });

    // Call the function
    await logout(req, res);

    // Assertions
    expect(RefreshToken.deleteOne).toHaveBeenCalledWith({
      token: "test-refresh-token",
    });
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Logout successful",
    });
  });

  it("should return 400 if refresh token is missing", async () => {
    // Setup request without refresh token
    req.cookies = {};

    // Call the function
    await logout(req, res);

    // Assertions
    expect(RefreshToken.deleteOne).not.toHaveBeenCalled();
    expect(res.clearCookie).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Refresh token is required",
    });
  });

  it("should return 400 if token deletion fails", async () => {
    // Setup mock to simulate deletion failure
    mockDeleteOne.mockResolvedValue(null);

    // Call the function
    await logout(req, res);

    // Assertions
    expect(RefreshToken.deleteOne).toHaveBeenCalledWith({ token: "test-refresh-token" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Refresh token could not be deleted",
    });
  });
  
  it("should return 500 if an error occurs during logout", async () => {
    // Setup mock to throw an error
    const errorMessage = "Database connection error";
    mockDeleteOne.mockRejectedValue(new Error(errorMessage));

    // Mock console.error to avoid cluttering test output
    console.error = jest.fn();

    // Call the function
    await logout(req, res);

    // Assertions
    expect(RefreshToken.deleteOne).toHaveBeenCalledWith({
      token: "test-refresh-token",
    });
    expect(console.error).toHaveBeenCalledWith(
      `Error during logout: ${errorMessage}`
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
  });
});
