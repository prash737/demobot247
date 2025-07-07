"use client";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import React from "react";
import OwlCarousel from "react-owl-carousel";
import { Carousel } from "@/components/ui/carousel";

const features = [
  {
    icon: HelpCircle,
    title: "24/7 Customer Support",
    description:
      "Provide instant, round-the-clock assistance for all customer inquiries, reducing wait times.",
  },
  {
    icon: Zap,
    title: "Instant Responses",
    description:
      "Get answers in <3s, improving user satisfaction and operational efficiency.", // Updated description
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description:
      "Engage with a global audience by supporting interactions in multiple languages.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Gain deep insights into user interaction trends, behavior, and chatbot performance.",
  },
  {
    icon: MessageCircle,
    title: "Personalized Interaction",
    description:
      "Offer tailored responses and recommendations based on individual user profiles and history.",
  },
  {
    icon: Users,
    title: "Lead Generation & Qualification",
    description:
      "Automate lead capture, qualify prospects, and schedule meetings efficiently.",
  },
  {
    icon: Code,
    title: "No-Code/Low-Code Interface",
    description:
      "Build and deploy powerful chatbots without writing a single line of code.",
  },
  {
    icon: Settings,
    title: "Full Customization",
    description:
      "Tailor your chatbot's appearance, behavior, and responses to match your brand.",
  },
  {
    icon: FileText,
    title: "Dynamic Knowledge Base",
    description:
      "Easily upload documents and URLs to train your chatbot with your specific data.",
  },
  {
    icon: Globe,
    title: "Seamless Embedding",
    description:
      "Integrate your chatbot effortlessly into any website or platform with a simple embed code.",
  },
  {
    icon: CreditCard,
    title: "Usage Tracking & Billing",
    description:
      "Monitor your chatbot's usage in real-time and manage your billing with transparent reporting.",
  },
  {
    icon: Lock,
    title: "Secure Authentication",
    description:
      "Ensure secure access and management with robust user and admin authentication features.",
  },
];

// OWL-Carousel-START
const options = {
  loop: false,
  autoplay: false,
  nav: false,
  dots: false,
  responsive: {
    0: {
      items: 2, // 👈 Show 2 items on small screens (e.g. mobile)
    },
    600: {
      items: 3,
    },
    1000: {
      items: 5,
    },
  },
};
// OWL-Carousel-END

export function Features() {
  return (
    <section className="keyfeatures_section mb-8" id="features">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <OwlCarousel className="owl-theme" items={5} {...options}>
              {features.map((feature, index) => (
                <div className="item">
                  <div key={index} className="key_list">
                    <div className="key_icon">
                      <feature.icon className="text-blue-500" strokeWidth={1} />
                    </div>
                    <div className="key_text">{feature.title}</div>
                    {/* <p className="text-gray-600 dark:text-gray-300">{feature.description}</p> */}
                  </div>
                </div>
              ))}
            </OwlCarousel>
          </div>
        </div>
        {/* <div className="row">
          <div className="col-lg-12">
            <div className="keyfeatures_inner">
              {features.map((feature, index) => (
                <div key={index} className="key_list">
                  <div className="key_icon">
                    <feature.icon className="w-12 h-12 text-blue-500 mb-4" />
                  </div>
                  <div className="key_text">{feature.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </div>
    </section>
    // <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900 w-full">
    //   <div className="container mx-auto px-4 md:px-6 lg:px-8">
    //     <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Key Features</h2>
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    //       {features.map((feature, index) => (
    //         <Card
    //           key={index}
    //           className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]"
    //         >
    //           <CardContent className="p-6">
    //             <feature.icon className="w-12 h-12 text-blue-500 mb-4" />
    //             <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
    //             <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
    //           </CardContent>
    //         </Card>
    //       ))}
    //     </div>
    //   </div>
    // </section>
  );
}
