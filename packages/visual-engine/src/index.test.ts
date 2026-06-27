import { expect, test } from "bun:test";
import { createVisualEngine } from "./index";

test("createVisualEngine returns lifecycle methods", () => {
  const engine = createVisualEngine();

  expect(typeof engine.update).toBe("function");
  expect(typeof engine.resize).toBe("function");
  expect(typeof engine.dispose).toBe("function");
});
