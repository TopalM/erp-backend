import { grantPermission, grantPermissions } from "./factories.js";

export const allow = async (user, code) => {
  return grantPermission(user.id, code, "ALLOW");
};

export const deny = async (user, code) => {
  return grantPermission(user.id, code, "DENY");
};

export const allowMany = async (user, codes) => {
  return grantPermissions(user.id, codes);
};
