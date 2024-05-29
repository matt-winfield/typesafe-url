import { ZodObject } from "zod";

export interface PathOptions<
  TParams extends ZodObject<any>,
  TQuery extends ZodObject<any>,
> {
  params?: TParams;
  query?: TQuery;
}

export const path = <
  TParams extends ZodObject<any>,
  TQuery extends ZodObject<any>,
>(
  path: string,
  options: PathOptions<TParams, TQuery>,
) => {
  return path;
};
