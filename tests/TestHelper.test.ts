import { assertMatch } from "https://deno.land/std@0.165.0/testing/asserts.ts";

export const uuid_regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function assertAttr(test: string, attr: string, valueRegex: string) {
  assertMatch(test, new RegExp(`"${attr}":"${valueRegex}"`));
}
