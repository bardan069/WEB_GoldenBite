export function isEmailValid(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export function doPasswordsMatch(password: string, confirmPassword: string) {
  return password === confirmPassword;
}

export function isPasswordStrong(password: string) {
  return password.length >= 8;
}
