interface Window {
  isProcessingThemeUpdate?: boolean
  themeAlreadyFetched?: Record<string, boolean>
  themeFetchInProgress?: Record<string, boolean>
  chatbotDataCache?: Record<string, any>
  chatbotDataFetchInProgress?: Record<string, boolean>
}

interface UserData {
  username: string
  password: string
  chatbot_id: string
  selected_plan: string
  selected_domain: string
  chatbot_status: string
  chatbot_name: string
  payment_status: string
  payment_date: string
  payment_id: string
  payment_amount: number
  chat_limit: string
  total_chats: number
  first_name: string
  last_name: string
  company: string
  role: string
  phone_number: string
  country_code: string
  timezone: string
}
