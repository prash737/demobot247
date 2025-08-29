"use client" // Make this a client component to handle login state

import { industrySolutionsContent } from "@/app/data/industry-solutions-content"
import { InternalHero } from "@/app/components/internal-hero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper" // Import the new wrapper
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Footer } from "@/app/components/footer"
import { useState, useEffect } from "react"

// AOS-EFFECT-START
import AOS from 'aos';
// AOS-EFFECT-END

interface IndustryPageProps {
  params: {
    industryId: string
  }
}

export default function IndustryPage({ params }: IndustryPageProps) {


  AOS.init({
        duration: 1000, // animation duration
        once: false,    // whether animation should happen only once
      });

  const industry = industrySolutionsContent.find((sol) => sol.id === params.industryId)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuthStatus = () => {
      const adminData = localStorage.getItem("adminData")
      const userData = localStorage.getItem("userData")
      setIsLoggedIn(!!(adminData || userData))
    }

    checkAuthStatus()
    const interval = setInterval(checkAuthStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!industry) {
    return (
      <MarketingPageWrapper>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Industry Not Found</h1>
        </div>
      </MarketingPageWrapper>
    )
  }

  const IconComponent = industry.icon

  return (
    
    <MarketingPageWrapper>
      <InternalHero title={industry.title}
        description={industry.heroDescription}
        icon={<IconComponent className="h-10 w-10 text-white" />}
      />      
      <div className="container mx-auto px-4 py-12 space-y-12 bg-white dark:bg-gray-900">
        {/* Benefits Section */}
        <section className="mb-8">
          <h2 className="heading70 font-bold text-center text-gray-900 dark:text-white" data-aos="fade-right">
            How Bot247 Helps {industry.title}
          </h2>
          <p className="text-center mb-5" data-aos="fade-left">
            Our AI-powered chatbots are specifically designed to address the unique challenges and opportunities within
            the {industry.title} sector.
          </p>
          <div className="row">
            <div className="col-lg-12">
              <div className="solution_inner_box">
                {industry.benefits.map((benefit, index) => {
                  const BenefitIcon = benefit.icon
                  return (
                    <div key={index} className="solution_list">
                      <div className="solution_list_inner">
                        <div className="row" style={{ alignItems: "center" }}>
                          <div className="col-lg-3">
                            <div className="solution_list_icon">
                              <BenefitIcon className="" />
                            </div>
                          </div>
                          <div className="col-lg-9">
                            <div className="row">
                              <div className="col-lg-12 solution_head mb-2">{benefit.title}</div>
                              <div className="col-lg-12 solution_content mb-3">
                                {benefit.description}
                              </div>
                              
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                        <div className="p-3 w-fit bg-blue-100 dark:bg-blue-900 rounded-full">
                          <BenefitIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                          {benefit.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300">{benefit.description}</p>
                      </CardContent> */}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
        {/* Use Cases Section */}
        <section className="mt-8 mb-8">
          <h2 className="heading70 font-bold text-center text-gray-900 dark:text-white">
            Key Use Cases for {industry.title}
          </h2>
          <p className="max-w-[900px] mx-auto text-center text-gray-700 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Discover how Bot247 can be specifically applied to enhance operations and customer interactions in your
            industry.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industry.useCases.map((useCase, index) => (
              <div key={index} className="solution_keyuse_box" data-aos="flip-up">
                <div className="solution_head">
                  {useCase.title}
                </div>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{useCase.description}</p>
                </CardContent>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        {/* {!isLoggedIn && (
          <Card className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to transform your {industry.title} operations?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Contact us today to learn more about how Bot247 can be customized for your specific needs.
              </p>
              <Link href="/contact">
                <Button className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Contact Us
                </Button>
              </Link>
            </CardContent>
          </Card>
        )} */}

      </div>
      <Footer />
    </MarketingPageWrapper>
    
  )
}
