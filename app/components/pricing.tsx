"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";

export function Pricing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedUserPlan, setSelectedUserPlan] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      const adminData = localStorage.getItem("adminData");
      const userDataString = localStorage.getItem("userData"); // Get the string
      const loggedIn = !!(adminData || userDataString);
      setIsLoggedIn(loggedIn);

      if (loggedIn && userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          // Assuming userData has a 'plan' property, e.g., { plan: "Basic" }
          setSelectedUserPlan(userData.plan || null);
        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
          setSelectedUserPlan(null);
        }
      } else {
        setSelectedUserPlan(null);
      }
    };

    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    // <section id="pricing" className="">
    //   <div className="container mx-auto">
    //     <div className="flex flex-col items-center justify-center space-y-4 text-center">
    //       <div className="space-y-2">
    //         <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 dark:text-white">
    //           Simple, transparent pricing
    //         </h2>
    //         <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
    //           Choose the plan that's right for your organization and start improving your inquiry handling process
    //           today.
    //         </p>
    //       </div>
    //     </div>
    //     <div className="grid gap-6 mt-12 md:grid-cols-2 lg:grid-cols-4">

    //       <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between">
    //         <div>
    //           <h3 className="text-2xl font-bold text-center">Free Plan</h3>
    //           <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
    //             <span className="text-4xl font-bold">Free Trial</span>
    //           </div>
    //           <ul className="mt-4 space-y-2">
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">50 chats/month</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Email support</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">bot247.live branding</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">10 FAQ uploads</span>
    //             </li>
    //           </ul>
    //         </div>
    //         <div className="mt-6">
    //           {!isLoggedIn ? (
    //             <Link href="/signup">
    //               <Button className="w-full">Get Started</Button>
    //             </Link>
    //           ) : // Logic for logged-in user
    //           selectedUserPlan === "Free Plan" ? (
    //             <Link href="/dashboard">
    //               <Button className="w-full">Go to Dashboard</Button>
    //             </Link>
    //           ) : (
    //             <Link href="/contact">
    //               <Button className="w-full">Contact Us</Button>
    //             </Link>
    //           )}
    //         </div>
    //       </div>
    //       {/* Basic Plan Card */}
    //       <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between">
    //         <div>
    //           <h3 className="text-2xl font-bold text-center">Basic</h3>
    //           <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
    //             <span className="text-4xl font-bold">₹ 3000</span>/ month
    //           </div>
    //           <ul className="mt-4 space-y-2">
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Upto 200 chat sessions/month</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Basic AI chatbot</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Website Crawl Data</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Email support</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Basic Analytics and Chat history</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Unlimited FAQs upload</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">bot247.live branding</span>
    //             </li>
    //           </ul>
    //         </div>
    //         <div className="mt-6">
    //           {!isLoggedIn ? (
    //             <Link href="/signup">
    //               <Button className="w-full">Get Started</Button>
    //             </Link>
    //           ) : // Logic for logged-in user
    //           selectedUserPlan === "Basic" ? (
    //             <Link href="/dashboard">
    //               <Button className="w-full">Go to Dashboard</Button>
    //             </Link>
    //           ) : (
    //             <Link href="/contact">
    //               <Button className="w-full">Contact Us</Button>
    //             </Link>
    //           )}
    //         </div>
    //       </div>
    //       {/* Pro Plan Card */}
    //       <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between">
    //         <div>
    //           <h3 className="text-2xl font-bold text-center">Pro</h3>
    //           <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
    //             <span className="text-4xl font-bold">₹ 7000</span>/ month
    //           </div>
    //           <ul className="mt-4 space-y-2">
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Upto 1500 chat session</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Advanced AI chatbot</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Upto 20 data source(including URL, PDF, TXT, CSV)</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Priority support</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Advanced analytics & reporting</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Custom co-branding</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Unlimited FAQs upload</span>
    //             </li>
    //           </ul>
    //         </div>
    //         <div className="mt-6">
    //           {!isLoggedIn ? (
    //             <Link href="/signup">
    //               <Button className="w-full">Get Started</Button>
    //             </Link>
    //           ) : // Logic for logged-in user
    //           selectedUserPlan === "Pro" ? (
    //             <Link href="/dashboard">
    //               <Button className="w-full">Go to Dashboard</Button>
    //             </Link>
    //           ) : (
    //             <Link href="/contact">
    //               <Button className="w-full">Contact Us</Button>
    //             </Link>
    //           )}
    //         </div>
    //       </div>
    //       {/* Advanced Plan Card */}
    //       <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between">
    //         <div>
    //           <h3 className="text-2xl font-bold text-center">Advanced</h3>
    //           <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
    //             <span className="text-4xl font-bold">₹ 10000</span>/ month
    //           </div>
    //           <ul className="mt-4 space-y-2">
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Whatsapp Business API Registration and Integration</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Upto 4000 chat session</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Advanced AI chatbot</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Upto 20 data source(including URL, PDF, TXT, CSV)</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Priority support</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Advanced analytics & reporting</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Dedicated account manager</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Custom branding</span>
    //             </li>
    //             <li className="flex items-center">
    //               <svg
    //                 className=" text-green-500 flex-shrink-0 h-6 w-6"
    //                 fill="none"
    //                 height="24"
    //                 stroke="currentColor"
    //                 strokeLinecap="round"
    //                 strokeLinejoin="round"
    //                 strokeWidth="2"
    //                 viewBox="0 0 24 24"
    //                 width="24"
    //                 xmlns="http://www.w3.org/2000/svg"
    //               >
    //                 <polyline points="20 6 9 17 4 12" />
    //               </svg>
    //               <span className="ml-2">Unlimited FAQs upload</span>
    //             </li>
    //           </ul>
    //         </div>
    //         <div className="mt-6">
    //           {!isLoggedIn ? (
    //             <Link href="/signup">
    //               <Button className="w-full">Get Started</Button>
    //             </Link>
    //           ) : // Logic for logged-in user
    //           selectedUserPlan === "Advanced" ? (
    //             <Link href="/dashboard">
    //               <Button className="w-full">Go to Dashboard</Button>
    //             </Link>
    //           ) : (
    //             <Link href="/contact">
    //               <Button className="w-full">Contact Us</Button>
    //             </Link>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </section>
    <section
      className="pricing_section"
      id="pricing"
      style={{ marginBottom: "150px" }}
    >
      <div className="container" style={{ position: "relative", zIndex: "5" }}>
        <div className="row">
          <div
            className="col-lg-12 heading70 text-center mb-4"
            style={{ color: "#fff" }}
          >
            Simple, Transparent Pricing
          </div>
        </div>
        <div className="row">
          <div className="col-lg-3"></div>
          <div className="col-lg-6 text-center mb-5" style={{ color: "#fff" }}>
            Choose the plan that's right for your organization and start
            improving your inquiry handling process today.
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
                    <img
                      src="images/price_line.png"
                      className="img-fluid"
                      alt="Price line separator"
                      style={{ margin: "0 auto" }}
                    ></img>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 price_list_box">
                    <div className="price_list">50 chats/month</div>
                    <div className="price_list">Email support</div>
                    <div className="price_list">bot247.live branding</div>
                    <div className="price_list">10 FAQ uploads</div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 text-center price_getstarted mt-4 mb-4">
                    {!isLoggedIn ? (
                      <Link href="/signup">Get Started</Link>
                    ) : // Logic for logged-in user
                    selectedUserPlan === "Free Plan" ? (
                      <Link href="/dashboard">Go to Dashboard</Link>
                    ) : (
                      <Link href="/contact">Contact Us</Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="pricing_box">
              <div className="pricing_box_inner">
                <div className="row">
                  <div className="col-lg-12 mb-1 text-center price_heading">
                    Basic
                  </div>
                  <div className="col-lg-12 mb-3 text-center price_amt_box">
                    <span className="price_symbol">₹</span>3000{" "}
                    <span>/ Month</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 text-center mb-4">
                    <img
                      src="images/price_line.png"
                      className="img-fluid"
                      alt="Price line separator"
                    ></img>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 price_list_box">
                    <div className="price_list">
                      Upto 200 chat sessions/month
                    </div>
                    <div className="price_list">Basic AI chatbot</div>
                    <div className="price_list">Website Crawl Data</div>
                    <div className="price_list">Email support</div>
                    <div className="price_list">
                      Basic Analytics and Chat history
                    </div>
                    <div className="price_list">Unlimited FAQs upload</div>
                    <div className="price_list">bot247.live branding</div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 text-center price_getstarted mt-4 mb-4">
                    {!isLoggedIn ? (
                      <Link href="/signup">Get Started</Link>
                    ) : // Logic for logged-in user
                    selectedUserPlan === "Basic" ? (
                      <Link href="/dashboard">Go to Dashboard</Link>
                    ) : (
                      <Link href="/contact">Contact Us</Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="pricing_box">
              <div className="pricing_box_inner">
                <div className="row">
                  <div className="col-lg-12 mb-1 text-center price_heading">
                    Pro
                  </div>
                  <div className="col-lg-12 mb-3 text-center price_amt_box">
                    <span className="price_symbol">₹</span>7000{" "}
                    <span>/ Month</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 text-center mb-4">
                    <img
                      src="images/price_line.png"
                      className="img-fluid"
                      alt="Price line separator"
                    ></img>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 price_list_box">
                    <div className="price_list">Upto 1500 chat session</div>
                    <div className="price_list">Advanced AI chatbot</div>
                    <div className="price_list">
                      Upto 20 data source(including URL, PDF, TXT, CSV)
                    </div>
                    <div className="price_list">Priority support</div>
                    <div className="price_list">
                      Advanced analytics & reporting
                    </div>
                    <div className="price_list">Custom co-branding</div>
                    <div className="price_list">Unlimited FAQs upload</div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 text-center price_getstarted mt-4 mb-4">
                    {!isLoggedIn ? (
                      <Link href="/signup">Get Started</Link>
                    ) : // Logic for logged-in user
                    selectedUserPlan === "Pro" ? (
                      <Link href="/dashboard">Go to Dashboard</Link>
                    ) : (
                      <Link href="/contact">Contact Us</Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="pricing_box">
              <div className="pricing_box_inner">
                <div className="row">
                  <div className="col-lg-12 mb-1 text-center price_heading">
                    Advanced
                  </div>
                  <div className="col-lg-12 mb-3 text-center price_amt_box">
                    <span className="price_symbol">₹</span>10000{" "}
                    <span>/ Month</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 text-center mb-4">
                    <img
                      src="images/price_line.png"
                      className="img-fluid"
                      alt="Price line separator"
                    ></img>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 price_list_box">
                    <div className="price_list">
                      Whatsapp Business API Registration and Integration
                    </div>
                    <div className="price_list">Upto 4000 chat session</div>
                    <div className="price_list">Advanced AI chatbot</div>
                    <div className="price_list">
                      Upto 20 data source(including URL, PDF, TXT, CSV)
                    </div>
                    <div className="price_list">Priority support</div>
                    <div className="price_list">
                      Advanced analytics & reporting
                    </div>
                    <div className="price_list">Dedicated account manager</div>
                    <div className="price_list">Custom branding</div>
                    <div className="price_list">Unlimited FAQs upload</div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 text-center price_getstarted mt-4 mb-4">
                    {!isLoggedIn ? (
                      <Link href="/signup">Get Started</Link>
                    ) : // Logic for logged-in user
                    selectedUserPlan === "Advanced" ? (
                      <Link href="/dashboard">Go to Dashboard</Link>
                    ) : (
                      <Link href="/contact">Contact Us</Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="purple_shape_btm1">
        <img
          src="/images/purple_shade.png"
          className="img-fluid"
          style={{ opacity: "0.5" }}
          alt="Purple shade background"
        ></img>
      </div>
    </section>
  );
}

// Add default export for lazy loading
export default Pricing;
