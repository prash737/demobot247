import bcrypt from "bcryptjs"

/**
 * Hashes a password using bcrypt
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a salt with cost factor 10 (you can adjust this for security vs performance)
  const salt = await bcrypt.genSalt(10)

  // Hash the password with the generated salt
  const hashedPassword = await bcrypt.hash(password, salt)

  return hashedPassword
}

/**
 * Compares a plain text password with a hashed password
 * @param plainPassword The plain text password to check
 * @param hashedPassword The hashed password to compare against
 * @returns True if the passwords match, false otherwise
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword)
}
