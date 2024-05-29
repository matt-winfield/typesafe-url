import { z } from "zod";
import { definePath, path } from "./path";

describe("path", () => {
  it("should serialize query params", () => {
    const testPath = definePath("/test/path", {
      query: z.object({
        test: z.string(),
        something: z.number(),
        blah: z.object({
          nested: z.string(),
        }),
      }),
    });

    const result = path(testPath, {
      query: {
        test: "test",
        something: 123,
        blah: {
          nested: "nested",
        },
      },
    });

    expect(result).toBe(
      "/test/path?test=test&something=123&blah[nested]=nested",
    );
  });

  it("should serialize deeply nested query params", () => {
    const testPath = definePath("/test/path", {
      query: z.object({
        nested: z.object({
          deeply: z.object({
            deeper: z.object({
              deepest: z.string(),
            }),
          }),
          test: z.object({
            nested: z.string(),
          }),
        }),
      }),
    });

    const result = path(testPath, {
      query: {
        nested: {
          deeply: {
            deeper: {
              deepest: "nested",
            },
          },
          test: {
            nested: "nested",
          },
        },
      },
    });

    expect(result).toBe(
      "/test/path?nested[deeply][deeper][deepest]=nested&nested[test][nested]=nested",
    );
  });

  it("should serialize query params with arrays", () => {
    const testPath = definePath("/test/path", {
      query: z.object({
        test: z.array(z.string()),
      }),
    });

    const result = path(testPath, {
      query: {
        test: ["test", "test2"],
      },
    });

    expect(result).toBe("/test/path?test[0]=test&test[1]=test2");
  });

  it("should replace path params", () => {
    const testPath = definePath("/test/:id/path", {
      params: z.object({
        id: z.string(),
      }),
    });

    const result = path(testPath, {
      params: {
        id: "test",
      },
    });

    expect(result).toBe("/test/test/path");
  });

  it("should replace multiple path params", () => {
    const testPath = definePath("/test/:id/:test/path", {
      params: z.object({
        id: z.string(),
        test: z.string(),
      }),
    });

    const result = path(testPath, {
      params: {
        id: "test",
        test: "test2",
      },
    });

    expect(result).toBe("/test/test/test2/path");
  });
});
