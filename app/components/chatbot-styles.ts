import type React from "react"

interface StyleProps {
  primaryColor?: string
  secondaryColor?: string
  borderRadius?: number
}

export function getGradientHeaderStyle({
  primaryColor,
  secondaryColor,
  borderRadius,
}: StyleProps): React.CSSProperties {
  return {
    background: `linear-gradient(to right, ${primaryColor || "#3B82F6"}, ${secondaryColor || "#1D4ED8"})`,
    borderRadius: `${borderRadius || 8}px ${borderRadius || 8}px 0 0`,
  }
}

export function getUserMessageStyle({ primaryColor, borderRadius }: StyleProps): React.CSSProperties {
  return {
    backgroundColor: primaryColor || "#3B82F6",
    color: "white",
    borderRadius: `${borderRadius || 8}px`,
  }
}

export function getSendMessageButtonStyle({
  primaryColor,
  secondaryColor,
  borderRadius,
}: StyleProps): React.CSSProperties {
  return {
    background: `linear-gradient(to right, ${primaryColor || "#3B82F6"}, ${secondaryColor || "#1D4ED8"})`,
    borderRadius: `${borderRadius || 8}px`,
  }
}

export function getInputFieldStyle({ primaryColor, borderRadius }: StyleProps): React.CSSProperties {
  return {
    borderColor: primaryColor || "#D1D5DB", // Default to a light gray if no primary color
    borderRadius: `${borderRadius || 8}px`,
  }
}

export function getSuggestedQuestionButtonStyle({ primaryColor }: StyleProps): React.CSSProperties {
  return {
    color: primaryColor || "#3B82F6",
    borderColor: primaryColor || "#E5E7EB", // Default to a light gray if no primary color
  }
}

export function getBotMessageStyle({ borderRadius }: StyleProps): React.CSSProperties {
  return {
    borderRadius: `${borderRadius || 8}px`,
    border: "1px solid rgba(0,0,0,0.05)", // Keep this general border
  }
}
