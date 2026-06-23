import { slugifyStr as slugifyCore } from "./slugifyCore";

export const slugifyStr = (str: string): string => slugifyCore(str);
