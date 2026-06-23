import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../../src/app.js";

export const createAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role?.name,
      departmentId: user.departmentId,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};

export const authHeader = (user) => {
  return `Bearer ${createAccessToken(user)}`;
};

export const api = () => request(app);

export const authRequest = (user) => {
  const token = authHeader(user);

  return {
    get: (url) => api().get(url).set("Authorization", token),
    post: (url) => api().post(url).set("Authorization", token),
    patch: (url) => api().patch(url).set("Authorization", token),
    put: (url) => api().put(url).set("Authorization", token),
    delete: (url) => api().delete(url).set("Authorization", token),
  };
};
