import { describe, expect, it } from "vitest";
import { z } from "astro/zod";
import { collections } from "@/content.config";
import contentRules from "@/data/content-rules.json";

const schemaFields = (name: keyof typeof collections) => {
  const { schema } = collections[name];
  if (typeof schema !== "function") throw new Error(`${name}: no schema`);
  const object = schema({ image: () => z.string() } as never);
  return Object.keys((object as z.ZodObject).shape);
};

describe("content config", () => {
  it.each(Object.keys(collections) as (keyof typeof collections)[])(
    "%s schema and content-rules.json list the same fields",
    name => {
      expect(schemaFields(name).sort()).toEqual(
        [...contentRules.collections[name].frontmatterFields].sort()
      );
    }
  );

  it("rejects unknown frontmatter fields", () => {
    const { schema } = collections.projects;
    if (typeof schema !== "function") throw new Error("no schema");
    const object = schema({ image: () => z.string() } as never);

    expect(
      object.safeParse({ title: "T", description: "D", colour: "red" }).success
    ).toBe(false);
  });
});
