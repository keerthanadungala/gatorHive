module.exports = {
  testEnvironment: "jsdom", // Enables DOM simulation
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|scss|less)$": "<rootDir>/jest.mock.js", // Mock CSS imports
  },
  moduleFileExtensions: ["js", "jsx"],
};

