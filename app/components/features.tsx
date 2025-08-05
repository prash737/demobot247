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

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

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

// Dynamically import OwlCarousel with no SSR
const OwlCarousel = dynamic(() => import("react-owl-carousel"), {
  ssr: false,
  loading: () => <div className="keyfeatures_inner">
    {features.map((feature, index) => (
      <div key={index} className="key_list">
        <div className="key_icon">
          <feature.icon className="text-blue-500" strokeWidth={1} />
        </div>
        <div className="key_text">{feature.title}</div>
      </div>
    ))}
  </div>
});

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <section className="keyfeatures_section mb-8">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="keyfeatures_inner">
                {features.map((feature, index) => (
                  <div key={`fallback-feature-${index}`} className="key_list">
                    <div className="key_icon">
                      <feature.icon className="text-blue-500" strokeWidth={1} />
                    </div>
                    <div className="key_text">{feature.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="keyfeatures_section mb-8">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <OwlCarousel className="owl-theme" items={5} {...options}>
              {features.map((feature, index) => (
                <div className="item" key={`feature-${index}`}>
                  <div className="key_list">
                    <div className="key_icon">
                      <feature.icon className="text-blue-500" strokeWidth={1} />
                    </div>
                    <div className="key_text">{feature.title}</div>
                  </div>
                </div>
              ))}
            </OwlCarousel>
          </div>
        </div>
      </div>
    </section>
  );
}

// Add default export for lazy loading
export default Features;