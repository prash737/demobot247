'use client'
import { Building2, Users, UserCog } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

// AOS-EFFECT-START
import AOS from 'aos';
import { useEffect } from "react";
// AOS-EFFECT-END

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

  // AOS-EFFECT-START
    useEffect(() => {
      AOS.init({
        duration: 1000, // animation duration
        once: false,    // whether animation should happen only once
      });
    }, []);
    // AOS-EFFECT-END

  return (

    <section className="benefits_section mb-5" id="benefits">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 heading70 text-center mb-3" data-aos="fade-right">Benefits for All Stakeholders</div>
        </div>
        <div className="row">
          <div className="col-lg-3"></div>
          <div className="col-lg-6 text-center mb-8" data-aos="fade-left">
            Our AI-powered chatbots are designed to adapt and excel across diverse business needs, driving
            efficiency and engagement.
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            {benefits.map((benefit, index) => (
              <div className="benefits_list text-center" key={index}>
                <div className="row" style={{alignItems:"center"}}>
                  <div className="col-lg-5" data-aos="fade-right">
                    <div className="benefits_icon"><benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
                    <div className="benefits_head mb-3">{benefit.title}</div>
                    <div className="benefits_content">
                      <div className="row" style={{flexDirection:"inherit"}}>
                        <div className="col-lg-3"></div>
                        <div className="col-lg-9">
                          {benefit.features.map((feature, featureIndex) => (
                            <span>{feature}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-7" data-aos="fade-left">
                    <div className="benefits_img"></div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    // <section
    //   id="benefits"
    //   className="py-20 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 w-full"
    // >
    //   <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-12">
    //     <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white">
    //       Benefits for All Stakeholders
    //     </h2>
    //     <div className="grid md:grid-cols-3 gap-8">
    //       {benefits.map((benefit, index) => (
    //         <Card
    //           key={index}
    //           className="border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800"
    //         >
    //           <CardHeader>
    //             <div className="p-3 w-fit bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
    //               <benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    //             </div>
    //             <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">{benefit.title}</CardTitle>
    //           </CardHeader>
    //           <CardContent>
    //             <ul className="space-y-2">
    //               {benefit.features.map((feature, featureIndex) => (
    //                 <li key={featureIndex} className="flex items-center gap-2">
    //                   <Check className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
    //                   <span className="text-gray-700 dark:text-gray-300">{feature}</span>
    //                 </li>
    //               ))}
    //             </ul>
    //           </CardContent>
    //         </Card>
    //       ))}
    //     </div>
    //   </div>
    // </section>
  )
}
