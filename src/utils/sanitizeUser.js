export const sanitizeUser = (user) => {
  if (!user) return null;

  const { passwordHash, ...safeUser } = user;

  return safeUser;
};
