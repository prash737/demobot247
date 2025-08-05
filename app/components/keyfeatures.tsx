'use client'
import {
  HelpCircle,
  Zap,
  Languages,
  BarChart3,
  MessageCircle,
  Users,
  Code,
  Settings,
  FileText,
  Globe,
  CreditCard,
  Lock,
} from "lucide-react"
import { Building2, UserCog } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

// AOS-EFFECT-START
import AOS from 'aos';
import { useEffect } from "react";
// AOS-EFFECT-END

// const benefits = [
//   {
//     icon: Building2,
//     title: "For Organizations",
//     features: [
//       "Reduced operational overhead",
//       "Improved operational efficiency",
//       "Optimized resource allocation",
//       "Advanced data-driven decisions",
//       "Increased global reach",
//     ],
//   },
//   {
//     icon: Users,
//     title: "For Users/Clients",
//     features: [
//       "Instant responses 24/7",
//       "Multilingual support",
//       "Clear inquiry tracking",
//       "Streamlined information access",
//       "Faster response times",
//     ],
//   },
//   {
//     icon: UserCog,
//     title: "For Operational Teams",
//     features: [
//       "Automated routine tasks",
//       "Focus on high-value interactions",
//       "Organized information management",
//       "Real-time reporting",
//       "Optimized workload",
//     ],
//   },
// ]

const features = [
  {
    icon: HelpCircle,
    title: "24/7 Customer Support",
    description: "Provide instant, round-the-clock assistance for all customer inquiries, reducing wait times.",
  },
  {
    icon: Zap,
    title: "Instant Responses",
    description: "Get answers in <3s, improving user satisfaction and operational efficiency.", // Updated description
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description: "Engage with a global audience by supporting interactions in multiple languages.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Gain deep insights into user interaction trends, behavior, and chatbot performance.",
  },
  {
    icon: MessageCircle,
    title: "Personalized Interaction",
    description: "Offer tailored responses and recommendations based on individual user profiles and history.",
  },
  {
    icon: Users,
    title: "Lead Generation & Qualification",
    description: "Automate lead capture, qualify prospects, and schedule meetings efficiently.",
  },
  {
    icon: Code,
    title: "No-Code/Low-Code Interface",
    description: "Build and deploy powerful chatbots without writing a single line of code.",
  },
  {
    icon: Settings,
    title: "Full Customization",
    description: "Tailor your chatbot's appearance, behavior, and responses to match your brand.",
  },
  {
    icon: FileText,
    title: "Dynamic Knowledge Base",
    description: "Easily upload documents and URLs to train your chatbot with your specific data.",
  },
  {
    icon: Globe,
    title: "Seamless Embedding",
    description: "Integrate your chatbot effortlessly into any website or platform with a simple embed code.",
  },
  {
    icon: CreditCard,
    title: "Usage Tracking & Billing",
    description: "Monitor your chatbot's usage in real-time and manage your billing with transparent reporting.",
  },
  {
    icon: Lock,
    title: "Secure Authentication",
    description: "Ensure secure access and management with robust user and admin authentication features.",
  },
]

export function Keyfeatures() {

  // AOS-EFFECT-START
  useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration
      once: false,    // whether animation should happen only once
    });
  }, []);
  // AOS-EFFECT-END

  return (

    <section className="keyfetures_section mb-5" id="features">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 heading70 text-center mb-3">Key Features</div>
        </div>
        <div className="row">
          <div className="col-lg-3"></div>
          <div className="col-lg-6 text-center mb-8">
            Our AI-powered chatbots are designed to adapt and excel across diverse business needs, driving
            efficiency and engagement.
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">

            {features.map((feature, index) => (
              <div className="keyfetures_list" key={index}>
                <div className="row text-center" style={{ alignItems: "center" }}>
                  <div className="col-lg-6 col-sm-6">
                    <div className="keyfetures_icon"><feature.icon className="text-blue-500" strokeWidth={1} /></div>
                    <div className="keyfetures_head mb-3">{feature.title}</div>
                    <div className="keyfetures_content mb-4">
                      <div className="row" style={{ flexDirection: "inherit" }}>
                        <div className="col-lg-2"></div>
                        <div className="col-lg-8">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-6">
                    <div className="keyfetures_img"></div>
                  </div>
                </div>

              </div>
            ))}



          </div>
        </div>
        {/* <div className="row">
          <div className="col-lg-12">
            {benefits.map((benefit, index) => (
              <div className="benefits_list" key={index}>
                <div className="row text-center" style={{alignItems:"center"}}>
                  <div className="col-lg-5 col-sm-6">
                    <div className="benefits_icon"><benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
                    <div className="benefits_head mb-3">{benefit.title}</div>
                    <div className="benefits_content mb-4">
                      <div className="row" style={{flexDirection:"inherit"}}>
                        <div className="col-lg-12">
                          {benefit.features.map((feature, featureIndex) => (
                            <span>{feature}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-7 col-sm-6">
                    <div className="benefits_img"></div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>


  )
}

// Add default export for lazy loading
export default Keyfeatures;