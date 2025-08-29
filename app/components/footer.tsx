"use client"

import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useScrollToHash } from "../hooks/useScrollToHash"

// AOS-EFFECT-START
import AOS from 'aos';
import { useEffect } from "react";
// AOS-EFFECT-END

export function Footer() {

  // AOS-EFFECT-START
  useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration
      once: false,    // whether animation should happen only once
    });
  }, []);
  // AOS-EFFECT-END


  const { theme } = useTheme()
  const pathname = usePathname()
  useScrollToHash() // Use the custom hook

  const handleSectionClick = (sectionId: string) => {
    if (pathname !== "/") {
      window.location.href = `/#${sectionId}`
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        const navHeight = 80 // Adjust this value based on your navbar height
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - navHeight

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    }
  }

  return (
    // <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
    //   <div className="container mx-auto px-4 py-12">
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
    //       {/* Company Info */}
    //       <div className="lg:col-span-2">
    //         <Link href="/" className="block mb-4">
    //           <Image
    //             src={"/images/bot247.live_logo.png"}
    //             alt="Bot247 Logo"
    //             width={200}
    //             height={60}
    //             className="h-10 w-auto"
    //           />
    //         </Link>
    //         <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
    //           Bot247.live provides intelligent inquiry handling solutions for organizations worldwide, streamlining
    //           operational processes with AI-powered automation.
    //         </p>
    //         <div className="flex space-x-4">
    //           <Link href="#" className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
    //             <Facebook className="h-5 w-5" />
    //             <span className="sr-only">Facebook</span>
    //           </Link>
    //           <Link href="#" className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
    //             <Twitter className="h-5 w-5" />
    //             <span className="sr-only">Twitter</span>
    //           </Link>
    //           <Link href="#" className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
    //             <Linkedin className="h-5 w-5" />
    //             <span className="sr-only">LinkedIn</span>
    //           </Link>
    //           <Link href="#" className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
    //             <Instagram className="h-5 w-5" />
    //             <span className="sr-only">Instagram</span>
    //           </Link>
    //         </div>
    //       </div>

    //       {/* Product Links */}
    //       <div>
    //         <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
    //           Product
    //         </h3>
    //         <ul className="space-y-3">
    //           {["features", "benefits", "implementation", "pricing", "docs"].map((item) => (
    //             <li key={item}>
    //               {item === "docs" ? (
    //                 <Link
    //                   href="/docs"
    //                   className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
    //                 >
    //                   Docs
    //                 </Link>
    //               ) : (
    //                 <button
    //                   onClick={() => handleSectionClick(item)}
    //                   className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
    //                 >
    //                   {item.charAt(0).toUpperCase() + item.slice(1)}
    //                 </button>
    //               )}
    //             </li>
    //           ))}
    //         </ul>
    //       </div>

    //       {/* Company Links */}
    //       <div>
    //         <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
    //           Company
    //         </h3>
    //         <ul className="space-y-3">
    //           {["about", "careers", "contact", "blog", "press"].map((item) => (
    //             <li key={item}>
    //               <Link
    //                 href={`/${item}`}
    //                 className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
    //               >
    //                 {item.charAt(0).toUpperCase() + item.slice(1)}
    //               </Link>
    //             </li>
    //           ))}
    //         </ul>
    //       </div>

    //       {/* Legal Links */}
    //       <div>
    //         <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Legal</h3>
    //         <ul className="space-y-3">
    //           {["privacy-policy", "terms-of-service", "cookie-policy", "security"].map((item) => (
    //             <li key={item}>
    //               <Link
    //                 href={`/${item}`}
    //                 className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
    //               >
    //                 {item
    //                   .split("-")
    //                   .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    //                   .join(" ")}
    //               </Link>
    //             </li>
    //           ))}
    //         </ul>
    //       </div>
    //     </div>

    //     {/* Bottom Section */}
    //     <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
    //       <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
    //         <p className="text-gray-500 dark:text-gray-400 text-sm">
    //           © {new Date().getFullYear()} Bot247.live. All rights reserved.
    //         </p>
    //         <div className="flex space-x-6">
    //           <Link
    //             href="/privacy-policy"
    //             className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm"
    //           >
    //             Privacy
    //           </Link>
    //           <Link
    //             href="/terms-of-service"
    //             className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 text-sm"
    //           >
    //             Terms
    //           </Link>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </footer>
    <footer className="footer_box">
      <div className="container">
        <div className="row">
          <div className="col-lg-1"></div>
          <div className="col-lg-10">
            <div className="demobox">
              <div className="demobox_img">
                <img src="/images/demo_icon.png" className="img-fluid" alt="Demo icon"></img>
              </div>
              <div className="demobox_text">
                Ready to Transform Your <br></br>
                <span>Operational Processes?</span>
              </div>
              <a href="/contact" className="demobox_btn">
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
              <div className="col-lg-12 mb-4">
                <span style={{ color: "#44cc78", fontSize: "28px" }}>Bot247.live </span>
                <br></br>
                Provides intelligent inquiry handling solutions for organizations worldwide, streamlining
                operational processes with AI-powered automation.
              </div>
            </div>
          </div>
          <div className="col-lg-1"></div>
          <div className="col-lg-7">
            <div className="footer_list footer_list1 mb-5" data-aos="fade-down">
              <div className="row">
                <div className="col-lg-12">
                  <div className="footer_menu_heading mb-3 pb-2">Product</div>
                </div>
                <div className="col-lg-12 footer_menu">
                  {["features", "benefits", "pricing", "docs"].map((item) => (
                    <div key={item}>
                      {item === "docs" ? (
                        <Link
                          href="/docs"
                          className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                        >
                          Docs
                        </Link>
                      ) : (
                        <a
                          onClick={() => handleSectionClick(item)}
                          className=""
                        >
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="footer_list footer_list2 mb-5" data-aos="fade-up">
              <div className="row">
                <div className="col-lg-12">
                  <div className="footer_menu_heading mb-3 pb-2">Company</div>
                </div>
                <div className="col-lg-12 footer_menu">
                  {["about", "contact",].map((item) => (
                    <div key={item}>
                      <a
                        href={`/${item}`}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                      >
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </a>
                    </div>
                  ))}
                  <a href="/privacy-policy">Privacy</a>
                  <a href="/terms-of-service">Terms</a>
                </div>
              </div>
            </div>
            <div className="footer_list footer_list3 mb-5" data-aos="fade-down">
              <div className="row">
                <div className="col-lg-12">
                  <div className="footer_menu_heading mb-3 pb-2">Legal</div>
                </div>
                <div className="col-lg-12 footer_menu">
                  {["privacy-policy", "terms-of-service", "cookie-policy", "security"].map((item) => (
                    <div key={item}>
                      <a
                        href={`/${item}`}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                      >
                        {item
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12 text-center pb-5">© {new Date().getFullYear()} Bot247.live. All rights reserved.</div>
          {/* <div className="col-lg-6 pb-5">
            <div className="footer_menu2">
              <a href="/privacy-policy">Privacy</a>
              <a href="/terms-of-service">Terms</a>
            </div>
          </div> */}
        </div>
      </div>
    </footer>
  )
}
