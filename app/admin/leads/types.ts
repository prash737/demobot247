export interface Lead {
  id: number
  created_at: string
  chatbot_id: string
  name: string
  email: string
  phone: string
}

export interface ChatbotLeads {
  chatbot_id: string
  leads: Lead[]
}
