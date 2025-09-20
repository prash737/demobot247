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
  Building2, UserCog,
  Check
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

import React from 'react';
import OwlCarousel from 'react-owl-carousel';
import { Carousel } from "@/components/ui/carousel";


const benefits = [
  {
    icon: Building2,
    title: "For Organizations",
    features: [
      "Reduced operational overhead",
      "Improved operational efficiency",
      "Optimized resource allocation",
      "Advanced data-driven decisions",
      "Increased global reach",
    ],
  },
  {
    icon: Users,
    title: "For Users/Clients",
    features: [
      "Instant responses 24/7",
      "Multilingual support",
      "Clear inquiry tracking",
      "Streamlined information access",
      "Faster response times",
    ],
  },
  {
    icon: UserCog,
    title: "For Operational Teams",
    features: [
      "Automated routine tasks",
      "Focus on high-value interactions",
      "Organized information management",
      "Real-time reporting",
      "Optimized workload",
    ],
  },
]

export function Benefits() {
  return (
    <section className="mb-8" id="benefits">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 heading70 text-center mb-5">Benefits for All Stakeholders</div>
        </div>
        <div className="row">
          {benefits.map((benefit, index) => (
            <div className="col-lg-4 mb-4">
              <div className="benefits_list">
                <div className="row">
                  <div className="col-lg-12 benefits_icon"><benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
                </div>
                <div className="row">
                  <div className="col-lg-12 mb-2 mt-3 benefits_heading">{benefit.title}</div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <ul className="p-0">
                      {benefit.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
  )
}

