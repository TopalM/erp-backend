import { describe, it, expect } from "vitest";

import { createAccessToken, authHeader, api, authRequest } from "../setup/auth.js";

const user = {
  id: "user1",
  email: "test@plastifay.com.tr",
  departmentId: "dep1",
  tokenVersion: 0,
  role: {
    name: "ADMIN",
  },
};

describe("auth test helpers coverage", () => {
  it("creates bearer auth header", () => {
    const header = authHeader(user);

    expect(header).toMatch(/^Bearer /);
  });

  it("creates api request helper", () => {
    expect(api()).toBeTruthy();
  });

  it("creates authenticated request helper methods", () => {
    const client = authRequest(user);

    expect(client.get).toBeTypeOf("function");
    expect(client.post).toBeTypeOf("function");
    expect(client.patch).toBeTypeOf("function");
    expect(client.put).toBeTypeOf("function");
    expect(client.delete).toBeTypeOf("function");
  });

  it("creates access token", () => {
    const token = createAccessToken(user);

    expect(token).toBeTypeOf("string");
    expect(token.split(".")).toHaveLength(3);
  });
});
