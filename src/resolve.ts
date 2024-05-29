import { ZodNumber, ZodObject, z } from "zod";
import { PathDefinition } from "./path";

/**
 * Resolves the path and query parameters from a URL, pathname and/or search string
 * @param pathDefinition The path pathDefinition
 * @param url The URL to resolve
 * @returns The resolved path parameters or null if the URL does not match the path
 * @throws If the path parameters are invalid (e.g. the type does not match the schema)
 * @example
 * const pathDefinition = definePath("/test/:id", {
 *   params: z.object({
 *     id: z.number(),
 *   }),
 * });
 * const result = resolvePathParams(pathDefinition, "/test/123");
 * console.log(result); // { id: 123 }
 */
export const resolve = <
  TParams extends ZodObject<any>,
  TQuery extends ZodObject<any>,
>(
  pathDefinition: PathDefinition<TParams, TQuery>,
  url: string,
) => {
  const pathParams = resolvePathParams(pathDefinition, url);
  const queryParams = resolveQueryParams(pathDefinition, url);

  return {
    params: pathParams,
    query: queryParams,
  };
};

/**
 * Resolves the path parameters from a URL, pathname and/or search string
 * @param pathDefinition The path pathDefinition
 * @param url The URL to resolve
 * @returns The resolved path parameters or null if the URL does not match the path
 * @throws If the path parameters are invalid (e.g. the type does not match the schema)
 * @example
 * const pathDefinition = definePath("/test/:id", {
 *   params: z.object({
 *     id: z.number(),
 *   }),
 * });
 * const result = resolvePathParams(pathDefinition, "/test/123");
 * console.log(result); // { id: 123 }
 */
export const resolvePathParams = <TParams extends ZodObject<any>>(
  pathDefinition: PathDefinition<TParams, ZodObject<any>>,
  url: string,
) => {
  if (!pathDefinition.options.params) {
    return undefined;
  }

  const { pathTemplate } = pathDefinition;

  const path = extractPath(url);

  const pathSegments = pathTemplate.toLowerCase().split("/");
  const urlSegments = path.toLowerCase().split("/");

  const pathParams: Record<string, unknown> = {};

  for (let i = 0; i < pathSegments.length; i++) {
    const pathSegment = pathSegments[i];
    const urlSegment = urlSegments[i];

    if (pathSegment.startsWith(":")) {
      const paramName = pathSegment.slice(1);

      if (!urlSegment) {
        return null;
      }

      const parsedParam = coerceIntoZodType(
        urlSegment,
        pathDefinition.options.params.shape[paramName],
      );
      pathParams[paramName] = parsedParam;
    } else if (pathSegment !== urlSegment) {
      return null;
    }
  }

  return pathDefinition.options.params.parse(pathParams);
};

/**
 * Resolves the query parameters from a URL or search string
 * @param pathDefinition The path pathDefinition
 * @param url The URL to resolve
 * @returns The resolved query parameters
 * @throws If the query parameters are do not match the schema
 * @example
 * const pathDefinition = definePath("/test?value=123", {
 *   query: z.object({
 *     value: z.number(),
 *   }),
 * });
 * const result = resolvePathParams(pathDefinition, "/test?value=123");
 * console.log(result); // { value: 123 }
 */
export const resolveQueryParams = <TParams extends ZodObject<any>>(
  pathDefinition: PathDefinition<TParams, ZodObject<any>>,
  url: string,
) => {
  if (!pathDefinition.options.query) {
    return undefined;
  }
  const query = extractQuery(url);

  let result: Record<string, any> = {};
  for (const [key, value] of query.entries()) {
    // example deeply nested path: "key[test][0][value]=123"
    const path = key.split(/[\[\]]/).filter(Boolean);
    let current = result;
    for (const nestedKey of path.slice(0, -1)) {
      if (!current[nestedKey]) {
        current[nestedKey] = {};
      }
      current = current[nestedKey];
    }

    const shape = getDeeplyNestedValue(
      pathDefinition.options.query.shape,
      path,
    );
    current[path[path.length - 1]] = coerceIntoZodType(value, shape);
  }
  return pathDefinition.options.query.parse(result);
};

const extractPath = (url: string) => {
  if (url.startsWith("/")) {
    return url;
  }

  try {
    const urlObject = new URL(url);
    return urlObject.pathname;
  } catch {
    return "";
  }
};

const extractQuery = (url: string) => {
  try {
    const urlObject = new URL(url);
    return new URLSearchParams(urlObject.search);
  } catch {
    return new URLSearchParams(url);
  }
};

const getDeeplyNestedValue = (obj: any, path: string[]) => {
  let current = obj;
  for (const key of path) {
    if (current[key] instanceof ZodObject) {
      current = current[key].shape;
    } else {
      current = current[key];
    }
  }
  return current;
};

const coerceIntoZodType = (value: any, zodType: any) => {
  if (zodType instanceof ZodNumber) {
    // if the value is a valid number, return it as a number
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    return value;
  }

  return value;
};
