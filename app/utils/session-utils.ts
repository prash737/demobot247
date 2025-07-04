/**
 * Generates a unique session ID for chat sessions
 * @returns A unique session ID string
 */
export function generateSessionId(): string {
  return "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 15)
}

/**
 * Creates a device-specific identifier based on browser information
 * @returns A device ID string
 */
export function generateDeviceId(): string {
  if (typeof window === "undefined") {
    return "server_device"
  }

  // Create a simple fingerprint based on available browser information
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const language = navigator.language
  const platform = navigator.platform

  // Combine these values to create a simple device fingerprint
  const deviceFingerprint = `${screenInfo}_${timeZone}_${language}_${platform}`

  // Create a hash of the fingerprint (simple version)
  let hash = 0
  for (let i = 0; i < deviceFingerprint.length; i++) {
    const char = deviceFingerprint.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Return a device ID based on the hash
  return `device_${Math.abs(hash).toString(16)}`
}

/**
 * Gets or creates a persistent device ID
 * @returns A device ID string
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") {
    return "server_device"
  }

  const storageKey = "bot247_device_id"
  let deviceId = localStorage.getItem(storageKey)

  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem(storageKey, deviceId)
  }

  return deviceId
}

/**
 * Creates a session ID based on device ID and current session start time
 * @returns A session ID string
 */
export function createPersistentSessionId(): string {
  const deviceId = getOrCreateDeviceId()
  const sessionStartTime = Date.now()
  return `${deviceId}_session_${sessionStartTime}`
}
