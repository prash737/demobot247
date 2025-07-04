import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ScrollToTop } from "@/app/utils/scroll-to-top"
import 'bootstrap/dist/css/bootstrap.min.css';
import { ChatbotThemeProvider } from "@/app/contexts/chatbot-theme-context"
import type React from "react"
import 'aos/dist/aos.css';
import Script from "next/script"
import { Nav } from "@/app/components/nav" // Ensure Nav is imported



const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Bot247.live",
  description: "AI-powered admission support system",
  generator: "v0.dev",
  icons: {
    icon: "/images/default-avatar.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Bootstrap CSS from CDN to resolve MIME type error */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <Script
          src="https://chat.bot247.live/api/chatbot-script"
          data-chatbot-id="bot247chatbot"
          strategy="afterInteractive"
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <ChatbotThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Nav />
              <main className="middle_section">{children}</main> 

              {/* SWAPNIL-WORK-START */}
              {/* <header>
                <div className="headerbox">
                  <div className="container">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="logo">
                          <img src="images/logo.png" className="img-fluid"></img>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
              <div className="middle_box">
                <section className="banner_section">
                  <div className="container">
                    <div className="row">
                      <div className="col-lg-12 banner_head1 text-center">Build Your Own AI Chatbot for</div>
                      <div className="col-lg-12 banner_head2 text-center">Your website</div>
                      <div className="col-lg-2"></div>
                      <div className="col-lg-8 banner_head3 text-center">
                        <span>24/7</span> automated inquiry handling system that streamlines your entire operational
                        process with intelligent responses and efficient handling.
                      </div>

                      <div className="col-lg-2">
                        <div className="banner_arrow">
                          <img src="images/round_arrow.png" className="img-fluid" alt="Round arrow icon"></img>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                
                <section className="mb-5">
                  <div className="container">
                    <div className="row">
                      <div className="col-lg-12 heading70 text-center">Solutions for Every Industry</div>
                    </div>
                    <div className="row">
                      <div className="col-lg-2"></div>
                      <div className="col-lg-8 text-center mb-5">
                        Our AI-powered chatbots are designed to adapt and excel across diverse business needs, driving
                        efficiency and engagement.
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="solution_list">
                          <div className="solution_list_inner">
                            <div className="row" style={{ alignItems: "center" }}>
                              <div className="col-lg-3">
                                <img src="images/solution_icon.png" className="img-fluid" alt="Solution icon"></img>
                              </div>
                              <div className="col-lg-9">
                                <div className="row">
                                  <div className="col-lg-12 solution_head mb-2">Education</div>
                                  <div className="col-lg-12 solution_content mb-3">
                                    Handle student inquiries, provide access to course information, streamline
                                    admissions processes, and offer 24/7 support for academic resources.
                                  </div>
                                  <div className="col-lg-12">
                                    <a href="#">Read More</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="solution_list">
                          <div className="solution_list_inner">
                            <div className="row" style={{ alignItems: "center" }}>
                              <div className="col-lg-3">
                                <img src="images/solution_icon.png" className="img-fluid" alt="Solution icon"></img>
                              </div>
                              <div className="col-lg-9">
                                <div className="row">
                                  <div className="col-lg-12 solution_head mb-2">Education</div>
                                  <div className="col-lg-12 solution_content mb-3">
                                    Handle student inquiries, provide access to course information, streamline
                                    admissions processes, and offer 24/7 support for academic resources.
                                  </div>
                                  <div className="col-lg-12">
                                    <a href="#">Read More</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="solution_list">
                          <div className="solution_list_inner">
                            <div className="row" style={{ alignItems: "center" }}>
                              <div className="col-lg-3">
                                <img src="images/solution_icon.png" className="img-fluid" alt="Solution icon"></img>
                              </div>
                              <div className="col-lg-9">
                                <div className="row">
                                  <div className="col-lg-12 solution_head mb-2">Education</div>
                                  <div className="col-lg-12 solution_content mb-3">
                                    Handle student inquiries, provide access to course information, streamline
                                    admissions processes, and offer 24/7 support for academic resources.
                                  </div>
                                  <div className="col-lg-12">
                                    <a href="#">Read More</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="solution_list">
                          <div className="solution_list_inner">
                            <div className="row" style={{ alignItems: "center" }}>
                              <div className="col-lg-3">
                                <img src="images/solution_icon.png" className="img-fluid" alt="Solution icon"></img>
                              </div>
                              <div className="col-lg-9">
                                <div className="row">
                                  <div className="col-lg-12 solution_head mb-2">Education</div>
                                  <div className="col-lg-12 solution_content mb-3">
                                    Handle student inquiries, provide access to course information, streamline
                                    admissions processes, and offer 24/7 support for academic resources.
                                  </div>
                                  <div className="col-lg-12">
                                    <a href="#">Read More</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="solution_list">
                          <div className="solution_list_inner">
                            <div className="row" style={{ alignItems: "center" }}>
                              <div className="col-lg-3">
                                <img src="images/solution_icon.png" className="img-fluid" alt="Solution icon"></img>
                              </div>
                              <div className="col-lg-9">
                                <div className="row">
                                  <div className="col-lg-12 solution_head mb-2">Education</div>
                                  <div className="col-lg-12 solution_content mb-3">
                                    Handle student inquiries, provide access to course information, streamline
                                    admissions processes, and offer 24/7 support for academic resources.
                                  </div>
                                  <div className="col-lg-12">
                                    <a href="#">Read More</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="solution_list">
                          <div className="solution_list_inner">
                            <div className="row" style={{ alignItems: "center" }}>
                              <div className="col-lg-3">
                                <img src="images/solution_icon.png" className="img-fluid" alt="Solution icon"></img>
                              </div>
                              <div className="col-lg-9">
                                <div className="row">
                                  <div className="col-lg-12 solution_head mb-2">Education</div>
                                  <div className="col-lg-12 solution_content mb-3">
                                    Handle student inquiries, provide access to course information, streamline
                                    admissions processes, and offer 24/7 support for academic resources.
                                  </div>
                                  <div className="col-lg-12">
                                    <a href="#">Read More</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="analytics_section mb-5">
                  <div className="container text-center" style={{ position: "relative", zIndex: "5" }}>
                    <div className="row">
                      <div className="col-lg-12 heading70 text-center" style={{ color: "#fff" }}>
                        Analytics Visualizations
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-2"></div>
                      <div className="col-lg-8 text-center mb-5" style={{ color: "#fff" }}>
                        Our AI-powered chatbots are designed to adapt and excel across diverse business needs, driving
                        efficiency and engagement.
                      </div>
                    </div>
                    <div className="row analytis_bottomboder">
                      <div className="col-lg-6 pt-5 analytis_rightboder">
                        <div className="row" style={{ alignItems: "center" }}>
                          <div className="col-lg-6">
                            <img src="images/analytics_img.png" className="img-fluid" alt="Analytics image"></img>
                          </div>
                          <div className="col-lg-6">
                            <div className="row">
                              <div className="col-lg-12 mb-2 text19_white">Day of Week Activity</div>
                              <div className="col-lg-12">
                                Sed ut perspiciatis unde omnis istenat error sit voluptatem accusantium dolo remque
                                laudantium,
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 pt-5">
                        <div className="row flex-sm-row-reverse" style={{ alignItems: "center" }}>
                          <div className="col-lg-6">
                            <img src="images/analytics_img.png" className="img-fluid" alt="Analytics image"></img>
                          </div>
                          <div className="col-lg-6">
                            <div className="row">
                              <div className="col-lg-12 mb-2 text19_white">Day of Week Activity</div>
                              <div className="col-lg-12">
                                Sed ut perspiciatis unde omnis istenat error sit voluptatem accusantium dolo remque
                                laudantium,
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="analytis_sept">
                          <img src="images/analytis_sept.png" className="img-fluid" alt="Analytics separator"></img>
                        </div>
                      </div>
                    </div>
                    <div className="row analytis_bottomboder">
                      <div className="col-lg-6 pt-5 analytis_rightboder">
                        <div className="row" style={{ alignItems: "center" }}>
                          <div className="col-lg-6">
                            <img src="images/analytics_img.png" className="img-fluid" alt="Analytics image"></img>
                          </div>
                          <div className="col-lg-6">
                            <div className="row">
                              <div className="col-lg-12 mb-2 text19_white">Day of Week Activity</div>
                              <div className="col-lg-12">
                                Sed ut perspiciatis unde omnis istenat error sit voluptatem accusantium dolo remque
                                laudantium,
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 pt-5">
                        <div className="row flex-sm-row-reverse" style={{ alignItems: "center" }}>
                          <div className="col-lg-6">
                            <img src="images/analytics_img.png" className="img-fluid" alt="Analytics image"></img>
                          </div>
                          <div className="col-lg-6">
                            <div className="row">
                              <div className="col-lg-12 mb-2 text19_white">Day of Week Activity</div>
                              <div className="col-lg-12">
                                Sed ut perspiciatis unde omnis istenat error sit voluptatem accusantium dolo remque
                                laudantium,
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="analytis_sept">
                          <img src="images/analytis_sept.png" className="img-fluid" alt="Analytics separator"></img>
                        </div>
                      </div>
                    </div>
                    <div className="row analytis_bottomboder">
                      <div className="col-lg-6 pt-5 analytis_rightboder">
                        <div className="row" style={{ alignItems: "center" }}>
                          <div className="col-lg-6">
                            <img src="images/analytics_img.png" className="img-fluid" alt="Analytics image"></img>
                          </div>
                          <div className="col-lg-6">
                            <div className="row">
                              <div className="col-lg-12 mb-2 text19_white">Day of Week Activity</div>
                              <div className="col-lg-12">
                                Sed ut perspiciatis unde omnis istenat error sit voluptatem accusantium dolo remque
                                laudantium,
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 pt-5">
                        <div className="row flex-sm-row-reverse" style={{ alignItems: "center" }}>
                          <div className="col-lg-6">
                            <img src="images/analytics_img.png" className="img-fluid" alt="Analytics image"></img>
                          </div>
                          <div className="col-lg-6">
                            <div className="row">
                              <div className="col-lg-12 mb-2 text19_white">Day of Week Activity</div>
                              <div className="col-lg-12">
                                Sed ut perspiciatis unde omnis istenat error sit voluptatem accusantium dolo remque
                                laudantium,
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="analytis_sept">
                          <img src="images/analytis_sept.png" className="img-fluid" alt="Analytics separator"></img>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="shape1_box">
                    <img src="images/shape1.png" className="img-fluid" alt="Decorative shape"></img>
                  </div>
                  <div className="purple_shape_btm">
                    <img src="images/purple_shade.png" className="img-fluid" alt="Purple shade background"></img>
                  </div>
                </section>
                <section className="mb-5">
                  <div className="container">
                    <div className="row">
                      <div className="col-lg-12 heading70 text-center">Our Clients</div>
                    </div>
                    <div className="row">
                      <div className="col-lg-2"></div>
                      <div className="col-lg-8 text-center mb-5">
                        Our AI-powered chatbots are designed to adapt and excel across diverse business needs, driving
                        efficiency and engagement.
                      </div>
                    </div>
                  </div>
                </section>
                <section className="benefits_section mb-5 text-center">
                  <div className="container" style={{ position: "relative", zIndex: "5" }}>
                    <div className="row">
                      <div className="col-lg-12 heading70 text-center" style={{ color: "#fff" }}>
                        Benefits for All Stakeholders
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-2"></div>
                      <div className="col-lg-8 text-center mb-5" style={{ color: "#fff" }}>
                        Our AI-powered chatbots are designed to adapt and excel across diverse business needs
                      </div>
                    </div>
                    <div className="row" style={{ alignItems: "center" }}>
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-12 achieve_heading mb-3">
                            Achieve<span>70%</span>
                          </div>
                          <div className="col-lg-12 text19_white mb-2">Higher CSAT with Gen AI</div>
                          <div className="col-lg-2"></div>
                          <div className="col-lg-8">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
                            laudantium, totam rem aperiam, eaque illo inventore
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 mt-5 mb-5">
                        <img src="images/benefits_img.png" className="img-fluid" alt="Benefits illustration"></img>
                      </div>
                    </div>
                    <div className="row flex-sm-row-reverse" style={{ alignItems: "center" }}>
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-12 achieve_heading mb-3">
                            Achieve<span>70%</span>
                          </div>
                          <div className="col-lg-12 text19_white mb-2">Higher CSAT with Gen AI</div>
                          <div className="col-lg-2"></div>
                          <div className="col-lg-8">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
                            laudantium, totam rem aperiam, eaque illo inventore
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 mt-5 mb-5">
                        <img src="images/benefits_img.png" className="img-fluid" alt="Benefits illustration"></img>
                      </div>
                    </div>
                    <div className="row" style={{ alignItems: "center" }}>
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-12 achieve_heading mb-3">
                            Achieve<span>70%</span>
                          </div>
                          <div className="col-lg-12 text19_white mb-2">Higher CSAT with Gen AI</div>
                          <div className="col-lg-2"></div>
                          <div className="col-lg-8">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
                            laudantium, totam rem aperiam, eaque illo inventore
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 mt-5 mb-5">
                        <img src="images/benefits_img.png" className="img-fluid" alt="Benefits illustration"></img>
                      </div>
                    </div>
                    <div className="row flex-sm-row-reverse" style={{ alignItems: "center" }}>
                      <div className="col-lg-6">
                        <div className="row">
                          <div className="col-lg-12 achieve_heading mb-3">
                            Achieve<span>70%</span>
                          </div>
                          <div className="col-lg-12 text19_white mb-2">Higher CSAT with Gen AI</div>
                          <div className="col-lg-2"></div>
                          <div className="col-lg-8">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
                            laudantium, totam rem aperiam, eaque illo inventore
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 mt-5 mb-5">
                        <img src="images/benefits_img.png" className="img-fluid" alt="Benefits illustration"></img>
                      </div>
                    </div>
                  </div>
                  <div className="purple_shape_btm1">
                    <img src="images/purple_shade.png" className="img-fluid" alt="Purple shade background"></img>
                  </div>
                </section>
                <section className="system_section mb-5 text-center">
                  <div className="container" style={{ position: "relative", zIndex: "5" }}>
                    <div className="row">
                      <div className="col-lg-12 heading70 mb-5">System Overview at a Glance</div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3">
                        <div className="row">
                          <div className="col-lg-12 system_count">50+</div>
                          <div className="col-lg-12">Languages Supported</div>
                        </div>
                      </div>
                      <div className="col-lg-3">
                        <div className="row">
                          <div className="col-lg-12 system_count">3s</div>
                          <div className="col-lg-12">Response Time</div>
                        </div>
                      </div>
                      <div className="col-lg-3">
                        <div className="row">
                          <div className="col-lg-12 system_count">1000+</div>
                          <div className="col-lg-12">Connected Users</div>
                        </div>
                      </div>
                      <div className="col-lg-3">
                        <div className="row">
                          <div className="col-lg-12 system_count">24/7</div>
                          <div className="col-lg-12">Always Availability</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="system_globe">
                    <img src="images/system_globe_img.png" className="img-fluid" alt="System globe background"></img>
                  </div>
                </section>
                <section className="pricing_section" id="top" style={{ marginBottom: "150px" }}>
                  <div className="container" style={{ position: "relative", zIndex: "5" }}>
                    <div className="row">
                      <div className="col-lg-12 heading70 text-center mb-4" style={{ color: "#fff" }}>
                        Simple, Transparent Pricing
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-3"></div>
                      <div className="col-lg-6 text-center mb-5" style={{ color: "#fff" }}>
                        Choose the plan that's right for your organization and start improving your inquiry handling
                        process today.
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="pricing_box">
                          <div className="pricing_box_inner">
                            <div className="row">
                              <div className="col-lg-12 mb-3 text-center price_heading">
                                Start<br></br> Free Plan
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 text-center mb-4">
                                <img src="images/price_line.png" className="img-fluid" alt="Price line separator"></img>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 price_list_box">
                                <div className="price_list">Upto 200 chat sessions/month</div>
                                <div className="price_list">Basic AI chatbot</div>
                                <div className="price_list">Website Crawl Data</div>
                                <div className="price_list">Basic Analytics and Chat history</div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 text-center price_getstarted mt-4 mb-4">
                                <a href="#">Get Started</a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="pricing_box">
                          <div className="pricing_box_inner">
                            <div className="row">
                              <div className="col-lg-12 mb-1 text-center price_heading">Basic</div>
                              <div className="col-lg-12 mb-3 text-center price_amt_box">
                                <span className="price_symbol">₹</span>3000 <span>/ Month</span>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 text-center mb-4">
                                <img src="images/price_line.png" className="img-fluid" alt="Price line separator"></img>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 price_list_box">
                                <div className="price_list">Upto 200 chat sessions/month</div>
                                <div className="price_list">Basic AI chatbot</div>
                                <div className="price_list">Website Crawl Data</div>
                                <div className="price_list">Email support</div>
                                <div className="price_list">Basic Analytics and Chat history</div>
                                <div className="price_list">Unlimited FAQs upload</div>
                                <div className="price_list">bot247.live branding</div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 text-center price_getstarted mt-4 mb-4">
                                <a href="#">Get Started</a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="pricing_box">
                          <div className="pricing_box_inner">
                            <div className="row">
                              <div className="col-lg-12 mb-1 text-center price_heading">Pro</div>
                              <div className="col-lg-12 mb-3 text-center price_amt_box">
                                <span className="price_symbol">₹</span>7000 <span>/ Month</span>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 text-center mb-4">
                                <img src="images/price_line.png" className="img-fluid" alt="Price line separator"></img>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 price_list_box">
                                <div className="price_list">Upto 200 chat sessions/month</div>
                                <div className="price_list">Basic AI chatbot</div>
                                <div className="price_list">Website Crawl Data</div>
                                <div className="price_list">Email support</div>
                                <div className="price_list">Basic Analytics and Chat history</div>
                                <div className="price_list">Unlimited FAQs upload</div>
                                <div className="price_list">bot247.live branding</div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 text-center price_getstarted mt-4 mb-4">
                                <a href="#">Get Started</a>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="pricing_box">
                          <div className="pricing_box_inner">
                            <div className="row">
                              <div className="col-lg-12 mb-1 text-center price_heading">Advanced</div>
                              <div className="col-lg-12 mb-3 text-center price_amt_box">
                                <span className="price_symbol">₹</span>10000 <span>/ Month</span>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 text-center mb-4">
                                <img src="images/price_line.png" className="img-fluid" alt="Price line separator"></img>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 price_list_box">
                                <div className="price_list">Upto 200 chat sessions/month</div>
                                <div className="price_list">Basic AI chatbot</div>
                                <div className="price_list">Website Crawl Data</div>
                                <div className="price_list">Email support</div>
                                <div className="price_list">Basic Analytics and Chat history</div>
                                <div className="price_list">Unlimited FAQs upload</div>
                                <div className="price_list">bot247.live branding</div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-12 text-center price_getstarted mt-4 mb-4">
                                <a href="#">Get Started</a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="purple_shape_btm1">
                    <img
                      src="images/purple_shade.png"
                      className="img-fluid"
                      style={{ opacity: "0.5" }}
                      alt="Purple shade background"
                    ></img>
                  </div>
                </section>
              </div>
              <footer className="footer_box">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-1"></div>
                    <div className="col-lg-10">
                      <div className="demobox">
                        <div className="demobox_img">
                          <img src="images/demo_icon.png" className="img-fluid" alt="Demo icon"></img>
                        </div>
                        <div className="demobox_text">
                          Ready to Transform Your <br></br>
                          <span>Operational Processes?</span>
                        </div>
                        <a href="#" className="demobox_btn">
                          Book a Demo
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-4">
                      <div className="row">
                        <div className="col-lg-12 mb-4">
                          <img
                            src="images/logo.png"
                            className="img-fluid"
                            style={{ maxHeight: "100px" }}
                            alt="Bot247.live logo"
                          ></img>
                        </div>
                        <div className="col-lg-12">
                          <span style={{ color: "#44cc78", fontSize: "28px" }}>Bot247.live </span>
                          <br></br>
                          Provides intelligent inquiry handling solutions for organizations worldwide, streamlining
                          operational processes with AI-powered automation.
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-1"></div>
                    <div className="col-lg-7">
                      <div className="footer_list mb-5">
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="footer_menu_heading mb-3 pb-2">Product</div>
                          </div>
                          <div className="col-lg-12 footer_menu">
                            <a href="#">Features</a>
                            <a href="#">Benefits</a>
                            <a href="#">Implementation</a>
                            <a href="#">Pricing</a>
                            <a href="#">Docs</a>
                          </div>
                        </div>
                      </div>
                      <div className="footer_list mb-5">
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="footer_menu_heading mb-3 pb-2">Company</div>
                          </div>
                          <div className="col-lg-12 footer_menu">
                            <a href="#">Features</a>
                            <a href="#">Benefits</a>
                            <a href="#">Implementation</a>
                            <a href="#">Pricing</a>
                            <a href="#">Docs</a>
                          </div>
                        </div>
                      </div>
                      <div className="footer_list mb-5">
                        <div className="row">
                          <div className="col-lg-12">
                            <div className="footer_menu_heading mb-3 pb-2">Legal</div>
                          </div>
                          <div className="col-lg-12 footer_menu">
                            <a href="#">Features</a>
                            <a href="#">Benefits</a>
                            <a href="#">Implementation</a>
                            <a href="#">Pricing</a>
                            <a href="#">Docs</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row mb-5">
                    <div className="col-lg-6">© 2025 Bot247.live. All rights reserved.</div>
                    <div className="col-lg-6">
                      <div className="footer_menu2">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                      </div>
                    </div>
                  </div>
                </div>
              </footer> */}
              {/* SWAPNIL-WORK-END */}


            </div>
            <ScrollToTop />
          </ChatbotThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
