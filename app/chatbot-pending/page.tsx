export default function ChatbotPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your chatbot is not ready yet</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Please wait while we set up your chatbot. This process may take some time. We'll notify you once it's ready to
          use.
        </p>
      </div>
    </div>
  )
}
