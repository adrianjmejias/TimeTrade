import { add } from "../database/queries";

test("Testing the testing library with a simple add function", () => {
  expect(add(189, 200)).toBe(389);
});
