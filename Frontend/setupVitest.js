

import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

// ✅ Ensure matchers are properly recognized
if (matchers) {
  expect.extend(matchers);
}

