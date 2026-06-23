export const sanitizeUser = (user) => {
  if (!user) return null;

  const {
    passwordHash,
    passwordResetToken,
    passwordResetExpires,
    emailVerificationToken,
    emailVerificationExpires,
    failedLoginAttempts,
    lockedUntil,
    tokenVersion,
    ...safeUser
  } = user;

  return safeUser;
};
