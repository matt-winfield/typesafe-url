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
  pathTemplate: string;
  options: PathOptions<TParams, TQuery>;
};

export const definePath = <
  TParams extends ZodObject<any>,
  TQuery extends ZodObject<any>,
>(
  pathTemplate: string,
  options: PathOptions<TParams, TQuery>,
): PathDefinition<TParams, TQuery> => {
  return {
    pathTemplate,
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
  const { pathTemplate } = pathDefinition;
  const { params: pathParams, query } = params;

  let output = pathTemplate;

  if (pathParams) {
    const serializedPath = replacePathTemplateParams(pathTemplate, pathParams);
    output = serializedPath;
  }

  if (query) {
    const serializedQuery = serializeQueryParams(query);
    output += `?${serializedQuery}`;
  }

  return output;
};

const replacePathTemplateParams = (
  path: string,
  params: Record<string, any>,
) => {
  return path.replace(/:\w+/g, (match) => {
    const key = match.slice(1);
    return params[key];
  });
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

const serializeObject = (obj: Record<string, any>, key: string): string => {
  return Object.keys(obj)
    .map((nestedKey) => {
      if (typeof obj[nestedKey] === "object") {
        return serializeObject(obj[nestedKey], `${key}[${nestedKey}]`);
      }
      return `${key}[${nestedKey}]=${obj[nestedKey]}`;
    })
    .join("&");
};
