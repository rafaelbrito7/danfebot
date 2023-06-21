export const verifyAccessKeyRegex = (accessKey: string): boolean => {
  const regex = /^[0-9]{44}$/;

  return regex.test(accessKey);
};
