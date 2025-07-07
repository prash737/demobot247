"use client";

import Link from "next/link"; // Import Link
import { industrySolutionsContent } from "@/app/data/industry-solutions-content"; // Import the content data
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// AOS-EFFECT-START
import AOS from "aos";
import { useEffect } from "react";
// AOS-EFFECT-END

export function IndustrySolutions() {
  // AOS-EFFECT-START
  useEffect(() => {
    AOS.init({
      duration: 20, // animation duration
      once: false, // whether animation should happen only once
    });
  }, []);
  // AOS-EFFECT-END

  return (
    // <section
    //   id="solutions"
    //   className="py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 w-full"
    // >
    //   <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-12">
    //     <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white">
    //       Solutions for Every Industry
    //     </h2>
    //     <p className="max-w-[900px] mx-auto text-center text-gray-700 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
    //       Our AI-powered chatbots are designed to adapt and excel across diverse business needs, driving efficiency and
    //       engagement.
    //     </p>
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    //       {industrySolutionsContent.map((solution, index) => {
    //         const IconComponent = solution.icon // Get the icon component
    //         return (
    //           <Link href={`/solutions/${solution.id}`} key={index} className="block">
    //             <Card className="border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] bg-white dark:bg-gray-800 h-full flex flex-col">
    //               <CardHeader>
    //                 <div className="p-3 w-fit bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
    //                   <IconComponent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
    //                 </div>
    //                 <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
    //                   {solution.title}
    //                 </CardTitle>
    //               </CardHeader>
    //               <CardContent className="flex-grow">
    //                 <p className="text-gray-700 dark:text-gray-300">{solution.description}</p>
    //               </CardContent>
    //             </Card>
    //           </Link>
    //         )
    //       })}
    //     </div>
    //   </div>
    // </section>
    <section className="mb-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 heading70 text-center">
            Solutions for Every Industry
          </div>
        </div>
        <div className="row">
          <div className="col-lg-3"></div>
          <div className="col-lg-6 text-center mb-5">
            Our AI-powered chatbots are designed to adapt and excel across
            diverse business needs, driving efficiency and engagement.
          </div>
        </div>
        {/* <div className="row">
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
        </div> */}
        <div className="row">
          <div className="col-lg-12">
            {industrySolutionsContent.map((solution, index) => {
              const IconComponent = solution.icon; // Get the icon component
              return (
                <Link
                  href={`/solutions/${solution.id}`}
                  key={index}
                  className="block"
                >
                  <div className="solution_list">
                    <div className="solution_list_inner">
                      <div className="row" style={{ alignItems: "center" }}>
                        <div className="col-lg-3">
                          <div className="solution_list_icon">
                            <IconComponent className="" />
                          </div>
                        </div>
                        <div className="col-lg-9">
                          <div className="row">
                            <div className="col-lg-12 solution_head mb-2">
                              {solution.title}
                            </div>
                            <div className="col-lg-12 solution_content mb-3">
                              {solution.description}
                            </div>
                            {/* <div className="col-lg-12">
                              <a href="#">Read More</a>
                            </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <Card className="border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] bg-white dark:bg-gray-800 h-full flex flex-col">
                    <CardHeader>
                      <div className="p-3 w-fit bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                        <IconComponent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {solution.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-700 dark:text-gray-300">{solution.description}</p>
                    </CardContent>
                  </Card> */}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
