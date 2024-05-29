import { z } from "zod";
import { definePath } from "./path";
import { resolve } from "./resolve";

describe("resolve", () => {
  it("should resolve path params", () => {
    const testPath = definePath("/test/:id", {
      params: z.object({
        id: z.number(),
      }),
    });

    const result = resolve(testPath, "/test/123");

    expect(result).toEqual({
      params: {
        id: 123,
      },
    });
  });

  it("should resolve path and query params when full URL is given with string", () => {
    const testPath = definePath("/test/:id", {
      params: z.object({
        id: z.string(),
      }),
      query: z.object({
        test: z.string(),
      }),
    });

    const result = resolve(testPath, "https://example.com/test/123?test=456");

    expect(result).toEqual({
      params: {
        id: "123",
      },
      query: {
        test: "456",
      },
    });
  });

  it("should resolve path and query params when full URL is given with number", () => {
    const testPath = definePath("/test/:id", {
      params: z.object({
        id: z.number(),
      }),
      query: z.object({
        test: z.number(),
      }),
    });

    const result = resolve(testPath, "https://example.com/test/123?test=456");

    expect(result).toEqual({
      params: {
        id: 123,
      },
      query: {
        test: 456,
      },
    });
  });

  it("should throw an error if the path type doesn't match", () => {
    const testPath = definePath("/test/:id/:test", {
      params: z.object({
        id: z.number(),
        test: z.number(),
      }),
    });

    expect(() => {
      resolve(testPath, "https://example.com/test/something/else");
    }).toThrowErrorMatchingSnapshot();
  });

  it("should throw an error if the query type doesn't match", () => {
    const testPath = definePath("/test", {
      query: z.object({
        test1: z.number(),
        test2: z.number(),
      }),
    });

    expect(() => {
      resolve(testPath, "https://example.com/test?test1=blah&test2=blah");
    }).toThrowErrorMatchingSnapshot();
  });

  it("should resolve deeply nested objects in query params", () => {
    const testPath = definePath("/test", {
      query: z.object({
        nested: z.object({
          deeply: z.object({
            deeper: z.object({
              deepest: z.string(),
            }),
          }),
          test: z.object({
            nested: z.number(),
          }),
        }),
      }),
    });

    const result = resolve(
      testPath,
      "https://example.com/test?nested[deeply][deeper][deepest]=nested&nested[test][nested]=123",
    );

    expect(result).toEqual({
      query: {
        nested: {
          deeply: {
            deeper: {
              deepest: "nested",
            },
          },
          test: {
            nested: 123,
          },
        },
      },
    });
  });
});
