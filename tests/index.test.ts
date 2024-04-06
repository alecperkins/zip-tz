
import { describe, expect, test } from "vitest";

import zipTZ from '../src';

describe("zipTZ", () => {

  test("returns a TZ name for a real ZIP code", () => {
    expect(zipTZ("10006")).toEqual("America/New_York");
  });

  test("returns a TZ name for a real ZIP+4 code", () => {
    expect(zipTZ("10006-2424")).toEqual("America/New_York");
  });

  test("returns a TZ name for a well-formatted but non-existent ZIP codes", () => {
    expect(zipTZ("83005")).toEqual("America/Denver");
    expect(zipTZ("56800")).toEqual("America/Chicago");
  });

  test("throws for malformed ZIP codes", () => {
    expect(() => zipTZ("10006-12345")).toThrow("Invalid ZIP code format")
    expect(() => zipTZ("123")).toThrow("Invalid ZIP code format")
    expect(() => zipTZ("H3B 3A7")).toThrow("Invalid ZIP code format");
    expect(() => zipTZ("")).toThrow("Invalid ZIP code format");
    expect(() => zipTZ(null as any)).toThrow("Invalid ZIP code format");
    expect(() => zipTZ(true as any)).toThrow("Invalid ZIP code format");
  });

});

