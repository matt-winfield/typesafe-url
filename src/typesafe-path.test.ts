import { z } from "zod";
import { path } from ".";

describe("typesafe-path", () => {
  it("should return a string", () => {
    const test = path("/test/path", {
      query: z.object({
        test: z.string(),
        something: z.number(),
        blah: z.object({
          nested: z.string(),
        }),
      }),
    });
  });
});
