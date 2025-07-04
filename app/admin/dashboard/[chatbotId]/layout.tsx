import type { ReactNode } from "react"

export default function AdminDashboardLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { chatbotId: string }
}) {
  return <div>{children}</div>
}
