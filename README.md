# typesafe-url

A small TypeScript library for working with query and path parameters with full type safety and serialization.

It uses [`zod`](https://zod.dev/) to define the schema of the URL and query parameters.

## Installation

```bash
npm install @matt-winfield/typesafe-url zod
```

## Basic usage

```typescript
import { definePath, resolve } from "@matt-winfield/typesafe-url";
import { z } from "zod";

const myPath = definePath("/example/:id/details", {
  params: z.object({
    id: z.number(),
  }),
  query: z.object({
    tab: z.string(),
  }),
});

// window.location.href = "/example/123/details?tab=active"
const { params, query } = resolve(myPath, window.location.href);

console.log(params.id); // 123
//                 ^ number

console.log(query.tab); // "active"
//                ^ string
```
