import { ZodObject, z } from "zod";

export interface PathOptions<
  TParams extends ZodObject<any>,
  TQuery extends ZodObject<any>,
> {
  params?: TParams;
  query?: TQuery;
}

export type PathDefinition<
  TParams extends ZodObject<any>,
  TQuery extends ZodObject<any>,
> = {
  path: string;
  options: PathOptions<TParams, TQuery>;
};

export const definePath = <
  TParams extends ZodObject<any>,
  TQuery extends ZodObject<any>,
>(
  path: string,
  options: PathOptions<TParams, TQuery>,
) => {
  return {
    path,
    options,
  };
};

export const path = <
  TParams extends ZodObject<any>,
  TQuery extends ZodObject<any>,
>(
  pathDefinition: PathDefinition<TParams, TQuery>,
  params: { params?: z.infer<TParams>; query?: z.infer<TQuery> },
) => {
  const { path, options } = pathDefinition;
  const { params: pathParams, query } = params;

  const output = path;

  if (query) {
    const serializedQuery = serializeQueryParams(query);
    return `${output}?${serializedQuery}`;
  }

  return output;
};

const serializeQueryParams = (query: Record<string, any>) => {
  return Object.keys(query)
    .map((key) => {
      const value = query[key];
      if (typeof value === "object") {
        return serializeObject(value, key);
      }
      return `${key}=${value}`;
    })
    .join("&");
};

const serializeObject = (obj: Record<string, any>, key: string) => {
  return Object.keys(obj)
    .map((nestedKey) => {
      if (typeof obj[nestedKey] === "object") {
        return serializeObject(obj[nestedKey], `${key}[${nestedKey}]`);
      }
      return `${key}[${nestedKey}]=${obj[nestedKey]}`;
    })
    .join("&");
};
