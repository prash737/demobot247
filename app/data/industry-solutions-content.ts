import type React from "react"
import {
  GraduationCap,
  Store,
  Home,
  HeartPulse,
  Banknote,
  Coffee,
  Factory,
  Truck,
  Landmark,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
  Clock,
} from "lucide-react"

export interface IndustrySolutionContent {
  id: string
  title: string
  icon: React.ElementType
  description: string
  heroDescription: string
  benefits: {
    icon: React.ElementType
    title: string
    description: string
  }[]
  useCases: {
    title: string
    description: string
  }[]
}

export const industrySolutionsContent: IndustrySolutionContent[] = [
  {
    id: "education",
    title: "Education",
    icon: GraduationCap,
    description:
      "Handle student inquiries, provide access to course information, streamline admissions processes, and offer 24/7 support for academic resources.",
    heroDescription:
      "Transform student support and administrative efficiency with AI-powered chatbots designed for educational institutions.",
    benefits: [
      {
        icon: Clock,
        title: "24/7 Student Support",
        description:
          "Provide instant answers to student queries anytime, reducing wait times and improving satisfaction.",
      },
      {
        icon: Lightbulb,
        title: "Streamlined Admissions",
        description: "Automate FAQ responses for prospective students, guiding them through application processes.",
      },
      {
        icon: MessageSquare,
        title: "Course Information Access",
        description: "Students can quickly find details on courses, schedules, and academic policies.",
      },
      {
        icon: TrendingUp,
        title: "Reduced Administrative Load",
        description: "Free up staff from repetitive inquiries, allowing them to focus on more complex tasks.",
      },
    ],
    useCases: [
      {
        title: "Admissions & Enrollment",
        description: "Answer questions about application requirements, deadlines, financial aid, and campus tours.",
      },
      {
        title: "Academic Advising",
        description: "Provide information on degree programs, course prerequisites, and registration procedures.",
      },
      {
        title: "Campus Services",
        description: "Assist with inquiries about library hours, IT support, student housing, and campus events.",
      },
      {
        title: "Alumni Engagement",
        description: "Offer support for alumni network access, event registration, and donation inquiries.",
      },
    ],
  },
  {
    id: "retail",
    title: "Retail",
    icon: Store,
    description:
      "Enhance customer shopping experience with product recommendations, provide order status information, personalized offers, and support for returns and exchanges.",
    heroDescription:
      "Elevate your customer experience and boost sales with intelligent chatbots tailored for the retail sector.",
    benefits: [
      {
        icon: Clock,
        title: "Instant Customer Support",
        description: "Provide immediate answers to product questions, order status, and shipping inquiries.",
      },
      {
        icon: Lightbulb,
        title: "Personalized Shopping",
        description: "Offer tailored product recommendations based on customer preferences and browsing history.",
      },
      {
        icon: MessageSquare,
        title: "Efficient Returns & Exchanges",
        description: "Guide customers through the return process, reducing friction and improving satisfaction.",
      },
      {
        icon: TrendingUp,
        title: "Increased Sales Conversion",
        description: "Assist customers at every stage of their buying journey, leading to higher conversion rates.",
      },
    ],
    useCases: [
      {
        title: "Product Discovery",
        description: "Help customers find specific products, compare options, and get detailed information.",
      },
      {
        title: "Order Management",
        description: "Provide real-time updates on order status, tracking, and delivery estimates.",
      },
      {
        title: "Post-Purchase Support",
        description: "Handle inquiries about warranties, product usage, and troubleshooting.",
      },
      {
        title: "Promotions & Offers",
        description: "Inform customers about ongoing sales, discounts, and loyalty program benefits.",
      },
    ],
  },
  {
    id: "real-estate",
    title: "Real Estate",
    icon: Home,
    description:
      "Qualify leads, provide information for property viewings, answer FAQs about listings, and offer insights on market trends and financing options.",
    heroDescription:
      "Streamline property inquiries and enhance client engagement with AI chatbots for the real estate industry.",
    benefits: [
      {
        icon: Clock,
        title: "24/7 Lead Qualification",
        description: "Capture and qualify potential buyers or renters around the clock, never missing an opportunity.",
      },
      {
        icon: Lightbulb,
        title: "Instant Property Information",
        description: "Provide immediate details on listings, amenities, and neighborhood insights.",
      },
      {
        icon: MessageSquare,
        title: "Automated Viewing Scheduling",
        description: "Allow clients to schedule property viewings directly through the chatbot.",
      },
      {
        icon: TrendingUp,
        title: "Market Trend Insights",
        description: "Offer up-to-date information on local market conditions and investment opportunities.",
      },
    ],
    useCases: [
      {
        title: "Property Search Assistance",
        description: "Help clients find properties based on their criteria (location, price, size, etc.).",
      },
      {
        title: "Mortgage & Financing FAQs",
        description: "Answer common questions about loan applications, interest rates, and eligibility.",
      },
      {
        title: "Rental Inquiries",
        description: "Provide details on rental properties, application processes, and lease terms.",
      },
      {
        title: "Agent Support",
        description: "Assist real estate agents with internal FAQs and access to property databases.",
      },
    ],
  },
  {
    id: "healthcare",
    title: "Healthcare",
    icon: HeartPulse,
    description:
      "Assist patients with appointment information, answer common health questions, provide details on services, and guide them to relevant resources securely.",
    heroDescription:
      "Enhance patient engagement and streamline administrative tasks with secure AI chatbots for healthcare providers.",
    benefits: [
      {
        icon: Clock,
        title: "24/7 Patient Assistance",
        description: "Offer round-the-clock support for common health questions and service inquiries.",
      },
      {
        icon: Lightbulb,
        title: "Appointment Management",
        description: "Automate scheduling, rescheduling, and cancellation of appointments.",
      },
      {
        icon: MessageSquare,
        title: "Information Dissemination",
        description: "Provide quick access to information on services, departments, and visiting hours.",
      },
      {
        icon: ShieldCheck,
        title: "Secure & Compliant",
        description: "Ensure patient data privacy and adhere to healthcare regulations (e.g., HIPAA).",
      },
    ],
    useCases: [
      {
        title: "Symptom Checker & Triage",
        description:
          "Guide patients to appropriate care based on their symptoms (with disclaimers for professional advice).",
      },
      {
        title: "Medication Information",
        description: "Answer questions about medication dosages, side effects, and interactions.",
      },
      {
        title: "Insurance & Billing Queries",
        description: "Provide information on insurance coverage, billing procedures, and payment options.",
      },
      {
        title: "Health Resource Navigation",
        description: "Direct patients to relevant health articles, support groups, or emergency services.",
      },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    icon: Banknote,
    description:
      "Offer support for account information, transaction details, loan application guidance, and provide financial advice while ensuring data security.",
    heroDescription: "Deliver secure and efficient customer support for financial services with AI-powered chatbots.",
    benefits: [
      {
        icon: Clock,
        title: "Instant Account Support",
        description: "Provide immediate answers to account balance, transaction history, and statement inquiries.",
      },
      {
        icon: Lightbulb,
        title: "Streamlined Loan Applications",
        description: "Guide users through the loan application process, answering common questions and requirements.",
      },
      {
        icon: MessageSquare,
        title: "Personalized Financial Advice",
        description: "Offer general financial guidance and direct users to relevant financial products.",
      },
      {
        icon: ShieldCheck,
        title: "Enhanced Security",
        description: "Ensure data privacy and compliance with financial regulations (e.g., GDPR, PCI DSS).",
      },
    ],
    useCases: [
      {
        title: "Account Management",
        description: "Help users with password resets, account activation, and updating personal information.",
      },
      {
        title: "Fraud Prevention",
        description: "Provide information on how to report suspicious activity and protect accounts.",
      },
      {
        title: "Investment Information",
        description: "Offer basic information on investment products, market trends, and portfolio management.",
      },
      {
        title: "Credit Score Inquiries",
        description: "Answer questions about credit scores, credit reports, and how to improve creditworthiness.",
      },
    ],
  },
  {
    id: "hospitality",
    title: "Hospitality",
    icon: Coffee,
    description:
      "Streamline booking inquiries, provide answers to guest queries, offer local recommendations, and enhance overall guest satisfaction.",
    heroDescription:
      "Elevate guest experiences and optimize operations with AI chatbots for hotels, resorts, and travel agencies.",
    benefits: [
      {
        icon: Clock,
        title: "24/7 Guest Concierge",
        description: "Provide instant assistance for booking inquiries, room service, and local recommendations.",
      },
      {
        icon: Lightbulb,
        title: "Streamlined Check-in/out",
        description: "Automate processes for faster guest arrival and departure.",
      },
      {
        icon: MessageSquare,
        title: "Personalized Guest Experience",
        description: "Offer tailored suggestions for activities, dining, and amenities.",
      },
      {
        icon: TrendingUp,
        title: "Increased Guest Satisfaction",
        description: "Resolve queries quickly, leading to happier guests and better reviews.",
      },
    ],
    useCases: [
      {
        title: "Booking & Reservation Management",
        description: "Assist with new bookings, modifications, cancellations, and availability checks.",
      },
      {
        title: "Hotel Services Information",
        description: "Provide details on pool hours, gym facilities, restaurant menus, and spa services.",
      },
      {
        title: "Local Attractions & Tours",
        description: "Recommend nearby points of interest, transportation options, and tour bookings.",
      },
      {
        title: "Feedback Collection",
        description: "Gather guest feedback during and after their stay to improve services.",
      },
    ],
  },
  {
    id: "manufacturing",
    title: "Manufacturing",
    icon: Factory,
    description:
      "Automate internal FAQs, provide instant support for operational queries, streamline HR processes, and assist with supply chain inquiries.",
    heroDescription:
      "Optimize internal communications and operational efficiency with AI chatbots for the manufacturing industry.",
    benefits: [
      {
        icon: Clock,
        title: "Instant Operational Support",
        description: "Provide immediate answers to common questions about machinery, processes, and safety protocols.",
      },
      {
        icon: Lightbulb,
        title: "Streamlined HR Inquiries",
        description: "Automate responses for HR policies, payroll, and benefits, reducing HR workload.",
      },
      {
        icon: MessageSquare,
        title: "Supply Chain Visibility",
        description: "Offer quick access to information on inventory levels, order status, and supplier details.",
      },
      {
        icon: TrendingUp,
        title: "Improved Employee Productivity",
        description: "Employees can quickly find information, reducing downtime and increasing efficiency.",
      },
    ],
    useCases: [
      {
        title: "Equipment Troubleshooting",
        description: "Guide operators through basic troubleshooting steps for common machinery issues.",
      },
      {
        title: "Quality Control FAQs",
        description: "Answer questions about quality standards, inspection procedures, and defect reporting.",
      },
      {
        title: "Safety & Compliance",
        description: "Provide information on safety regulations, emergency procedures, and compliance guidelines.",
      },
      {
        title: "Training & Onboarding",
        description: "Assist new employees with onboarding information and access to training materials.",
      },
    ],
  },
  {
    id: "logistics",
    title: "Logistics",
    icon: Truck,
    description:
      "Offer tracking updates, handle delivery inquiries, assist with scheduling information, and provide support for shipping and customs questions.",
    heroDescription:
      "Enhance tracking, streamline inquiries, and improve operational flow with AI chatbots for the logistics sector.",
    benefits: [
      {
        icon: Clock,
        title: "24/7 Shipment Tracking",
        description: "Provide real-time updates on package status, location, and estimated delivery times.",
      },
      {
        icon: Lightbulb,
        title: "Automated Inquiry Handling",
        description: "Reduce call center volume by answering common questions about shipping, customs, and rates.",
      },
      {
        icon: MessageSquare,
        title: "Efficient Scheduling",
        description: "Assist with booking pickups, delivery appointments, and route optimization.",
      },
      {
        icon: TrendingUp,
        title: "Improved Customer Satisfaction",
        description: "Offer quick and accurate information, leading to a better customer experience.",
      },
    ],
    useCases: [
      {
        title: "Freight Tracking",
        description: "Allow customers to track their cargo, view transit history, and receive notifications.",
      },
      {
        title: "Customs & Documentation",
        description: "Provide information on required documents, customs procedures, and import/export regulations.",
      },
      {
        title: "Warehouse Operations",
        description: "Assist internal staff with inventory checks, stock locations, and order fulfillment status.",
      },
      {
        title: "Dispute Resolution",
        description: "Guide customers through the process of reporting damaged goods or delivery discrepancies.",
      },
    ],
  },
  {
    id: "government-public-sector",
    title: "Government & Public Sector",
    icon: Landmark,
    description:
      "Improve citizen services, automate public inquiries, provide information on policies, and streamline administrative processes for government agencies.",
    heroDescription:
      "Enhance citizen engagement and streamline public services with secure AI chatbots for government and public sector agencies.",
    benefits: [
      {
        icon: Clock,
        title: "24/7 Citizen Support",
        description: "Provide round-the-clock access to public information and services.",
      },
      {
        icon: Lightbulb,
        title: "Automated Inquiry Handling",
        description: "Reduce call volumes for common questions about policies, permits, and public programs.",
      },
      {
        icon: MessageSquare,
        title: "Improved Information Access",
        description: "Citizens can quickly find details on regulations, forms, and public events.",
      },
      {
        icon: ShieldCheck,
        title: "Enhanced Transparency",
        description: "Offer clear and consistent information, building trust with the public.",
      },
    ],
    useCases: [
      {
        title: "Permit & License Applications",
        description: "Guide citizens through the application process for various permits and licenses.",
      },
      {
        title: "Public Service Information",
        description: "Provide details on waste collection schedules, public transport, and community programs.",
      },
      {
        title: "Tax & Revenue Inquiries",
        description: "Answer common questions about tax filing, payment deadlines, and available rebates.",
      },
      {
        title: "Emergency Services Guidance",
        description: "Direct citizens to appropriate emergency contacts and provide basic safety information.",
      },
    ],
  },
]
