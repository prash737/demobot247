import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does Bot247.live help organizations?",
    answer:
      "Bot247.live provides 24/7 automated support for inquiry handling, managing routine queries, information processing, and delivering instant responses to user inquiries, significantly reducing operational workload.",
  },
  {
    question: "What types of inquiries can the chatbot handle?",
    answer:
      "Our chatbot can handle a wide range of inquiries including service requirements, application status, document submissions, deadlines, pricing structures, and product information.",
  },
  {
    question: "Is Bot247.live secure for handling client information?",
    answer:
      "Yes, we implement enterprise-grade security measures including encryption, secure data storage, and compliance with relevant data protection regulations.",
  },
  {
    question: "How many languages does bot247.live support?",
    answer:
      "Bot247.live supports over 150 languages, making it accessible to global users and organizations worldwide.",
  },
  {
    question: "What kind of analytics and reporting does bot247.live provide?",
    answer:
      "We provide comprehensive analytics including inquiry patterns, response times, user satisfaction rates, and detailed insights into user interaction trends and operational bottlenecks.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 bg-gradient-to-br from-blue-500/5 via-green-500/5 to-blue-500/5 w-full">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <AccordionTrigger className="text-gray-900 dark:text-white">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
