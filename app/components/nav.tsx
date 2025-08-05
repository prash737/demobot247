"use client";

import { Button } from "@/components/ui/button";
import { Menu, X, User, ArrowLeft, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { scrollToSection } from "../utils/scrollToSection";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../utils/supabaseClient";
import type React from "react";

export function Nav() {
  // Ensure this line is not commented out
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [chatbotStatus, setChatbotStatus] = useState<string>("Inactive");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isAdminRoute =
    pathname === "/admin/login" || pathname.startsWith("/admin");

  useScrollToHash();

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // Call logout API endpoint
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.warn("Logout API call failed with status:", response.status);
        }
      } catch (apiError) {
        console.warn("Logout API call failed:", apiError);
      }

      // Clear all session data
      localStorage.removeItem("adminData");
      localStorage.removeItem("userData");
      localStorage.removeItem("adminThemeSettings");
      sessionStorage.clear();

      // Update state immediately
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUsername("");
      setIsMenuOpen(false);

      // Show success message
      toast({
        title: "Logged out successfully",
        description: "You have been logged out successfully",
      });

      // Redirect based on current route
      if (isAdminRoute) {
        router.push("/admin/login");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);

      // Force cleanup even on error
      try {
        localStorage.removeItem("adminData");
        localStorage.removeItem("userData");
        localStorage.removeItem("adminThemeSettings");
        sessionStorage.clear();
      } catch (storageError) {
        console.error("Error clearing storage:", storageError);
      }

      setIsLoggedIn(false);
      setIsAdmin(false);
      setUsername("");
      setIsMenuOpen(false);

      toast({
        title: "Logout completed",
        description:
          "There was an issue logging out, but you've been redirected to login",
        variant: "destructive",
      });

      if (isAdminRoute) {
        router.push("/admin/login");
      } else {
        router.push("/");
      }
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, isAdminRoute, router, toast]);

  const checkAuthStatus = useCallback(() => {
    try {
      const adminData = localStorage.getItem("adminData");
      const userData = localStorage.getItem("userData");

      // Reset states first
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUsername("");
      setChatbotStatus("Inactive"); // Reset chatbot status

      if (adminData) {
        try {
          const parsedAdminData = JSON.parse(adminData);
          console.log("Nav: Admin data found:", parsedAdminData); // Debug log
          if (parsedAdminData && parsedAdminData.username) {
            setIsLoggedIn(true);
            setIsAdmin(true);
            setUsername(parsedAdminData.username);
            console.log("Nav: Admin authenticated:", parsedAdminData.username); // Debug log
          }
        } catch (error) {
          console.error("Nav: Error parsing admin data:", error);
          localStorage.removeItem("adminData");
        }
      } else if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          console.log("Nav: User data found:", parsedUserData); // Debug log
          if (parsedUserData && parsedUserData.username) {
            setIsLoggedIn(true);
            setIsAdmin(false);
            setUsername(parsedUserData.username);

            if (parsedUserData.chatbotId) {
              supabase
                .from("credentials")
                .select("chatbot_status")
                .eq("chatbot_id", parsedUserData.chatbotId)
                .single()
                .then(({ data, error }) => {
                  if (data && !error) {
                    setChatbotStatus(data.chatbot_status);
                    console.log(
                      "Nav: Chatbot Status fetched:",
                      data.chatbot_status,
                    ); // Log chatbot status
                  } else {
                    console.error("Nav: Error fetching chatbot status:", error);
                    setChatbotStatus("Inactive"); // Default to inactive on error
                  }
                })
                .catch((error) => {
                  console.error(
                    "Nav: Error fetching chatbot status (catch):",
                    error,
                  );
                  setChatbotStatus("Inactive"); // Default to inactive on error
                });
            } else {
              console.log(
                "Nav: User data found but no chatbotId. Chatbot status set to Inactive.",
              );
              setChatbotStatus("Inactive");
            }
          }
        } catch (error) {
          console.error("Nav: Error parsing user data:", error);
          localStorage.removeItem("userData");
        }
      }
    } catch (error) {
      console.error("Nav: Error in checkAuthStatus (outer catch):", error);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();

    // Check auth status only when needed - much less frequent
    const interval = setInterval(checkAuthStatus, 30000); // Every 30 seconds instead of 1 second

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "adminData" || e.key === "userData") {
        console.log("Nav: Storage event detected, re-checking auth status.");
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkAuthStatus]);

  // Logic to logout non-admin users if they land on an admin route
  useEffect(() => {
    if (mounted && isLoggedIn && !isAdmin && isAdminRoute) {
      console.log(
        "Nav: Non-admin user detected on admin route. Logging out...",
      );
      handleLogout();
    }
  }, [mounted, isLoggedIn, isAdmin, isAdminRoute, handleLogout]);

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  const navItems = isAdmin
    ? [{ name: "Admin Dashboard", href: "/admin" }]
    : [
        { name: "Profile", href: "/user-profile" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Conversations", href: "/conversations" },
        { name: "Docs", href: "/docs", openInNewTab: true }, // Docs opens in new tab
      ];

  const publicNavItems = [
    { name: "Features", href: "#features" },
    { name: "Benefits", href: "#benefits" },
    { name: "Clients", href: "#our-clients" },
    { name: "Pricing", href: "#pricing" },
    { name: "Docs", href: "/docs", openInNewTab: true }, // Docs opens in new tab
    { name: "Contact", href: "/contact" },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    href: string,
    openInNewTab?: boolean,
  ) => {
    e.preventDefault();
    if (openInNewTab) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else if (href.startsWith("#")) {
      // If on the same page, scroll. Otherwise, navigate to root and then scroll.
      if (pathname === "/") {
        const targetId = href.replace("#", "");
        scrollToSection(targetId);
      } else {
        router.push(`/${href}`); // Navigate to root with hash, useScrollToHash will handle it
      }
    } else {
      // Regular internal link (e.g., /contact, /login, /signup, /dashboard)
      router.push(href);
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Check if the click is outside the menu and not on the menu toggle button or the dropdown trigger itself
      const target = event.target as HTMLElement;
      if (
        isMenuOpen &&
        !target.closest("[data-navbar]") &&
        !target.closest("[data-radix-popper-content]")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isMenuOpen]);

  if (!mounted) {
    return null;
  }

  // Debug log for current state
  console.log("Nav: Current auth state:", {
    isLoggedIn,
    isAdmin,
    username,
    isAdminRoute,
    chatbotStatus,
  });

  return (
    <nav
      data-navbar
      className={`main_nav_box ${isScrolled ? "main_nav_scroll" : ""}`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <a href={isAdminRoute ? "/admin" : "/"} className="flex-shrink-0">
              <div className="logo">
                <Image 
                  src="/images/logo.png" 
                  alt="Bot247 Logo" 
                  width={120} 
                  height={40}
                  priority
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            </a>
            {isAdminRoute && (
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 ml-4 flex items-center">
                <span className="hidden sm:inline-block border-l border-gray-300 dark:border-gray-700 h-6 mx-3"></span>
                <span>Admin Panel</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAdminRoute ? (
              // Admin route navigation - Always show logout if on admin route and logged in
              isLoggedIn ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome, {username || "Admin"}
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    size="sm"
                    disabled={isLoggingOut}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </Button>
                </>
              ) : null
            ) : (
              // Regular routes navigation
              <>
                <div className="flex items-baseline space-x-4">
                  {isLoggedIn
                    ? navItems.map((item) => (
                        <div key={item.name} className="relative">
                          {item.openInNewTab ? (
                            <button
                              onClick={(e) =>
                                handleNavClick(e, item.href, item.openInNewTab)
                              }
                              className={` ${
                                pathname === item.href ? "" : ""
                              } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                              disabled={item.disabled}
                            >
                              {item.name}
                            </button>
                          ) : (
                            <Link
                              href={item.href}
                              className={` ${pathname === item.href ? "" : ""}`}
                            >
                              {item.name}
                            </Link>
                          )}
                        </div>
                      ))
                    : publicNavItems.map((item) => (
                        <div key={item.name} className="relative">
                          {item.openInNewTab ? (
                            <button
                              onClick={(e) =>
                                handleNavClick(e, item.href, item.openInNewTab)
                              }
                              className=""
                            >
                              {item.name}
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleNavClick(e, item.href)}
                              className=""
                            >
                              {item.name}
                            </button>
                          )}
                        </div>
                      ))}
                </div>
                <div className="flex items-center ml-6">
                  {isLoggedIn ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        {/* Ensure this button is always clickable to open the dropdown */}
                        <Button
                          variant="ghost"
                          className="relative h-8 w-8 rounded-full"
                        >
                          <User className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="font-medium">
                          Signed in as {username}
                        </DropdownMenuItem>
                        {isAdmin ? (
                          <DropdownMenuItem>
                            <Link href="/admin" className="w-full">
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem>
                              <Link href="/user-profile" className="w-full">
                                Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {/* Dashboard link, disabled if chatbot is inactive */}
                              <Link href="/dashboard" className="w-full">
                                Dashboard
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="text-red-600 focus:text-red-600"
                        >
                          {isLoggingOut ? "Logging out..." : "Log out"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <>
                      <div className="top_two_btn">
                        <Link href="/login" className="top_login_btn">
                          Log in
                        </Link>
                        <Link href="/signup">Sign up</Link>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ml-auto toggle_btn">
            <Button
              variant="ghost"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Toggle menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="fixed inset-y-0 right-0 w-full max-w-sm shadow-lg flex flex-col nav_inner_box">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push(isAdminRoute ? "/admin" : "/");
                }}
                className="p-2"
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="sr-only">Back to Home</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsMenuOpen(false)}
                className="p-2"
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            <div className="flex-grow overflow-y-auto p-4">
              <div className="space-y-2">
                {isAdminRoute ? (
                  isLoggedIn ? (
                    <div className="space-y-4">
                      <div className="text-xl font-bold mb-4 text-center">
                        Admin Panel
                      </div>
                      <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Welcome, {username || "Admin"}
                      </div>
                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                        size="sm"
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>
                          {isLoggingOut ? "Logging out..." : "Logout"}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Please log in to access admin panel
                      </p>
                    </div>
                  )
                ) : isLoggedIn ? (
                  navItems.map((item) => (
                    <div key={item.name}>
                      {item.openInNewTab ? (
                        <button
                          onClick={(e) =>
                            handleNavClick(e, item.href, item.openInNewTab)
                          }
                          className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                            pathname === item.href
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                          }`}
                          disabled={item.disabled}
                        >
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`block px-3 py-2 rounded-md text-base font-medium ${
                            pathname === item.href
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  publicNavItems.map((item) => (
                    <div key={item.name}>
                      {item.openInNewTab ? (
                        <button
                          onClick={(e) =>
                            handleNavClick(e, item.href, item.openInNewTab)
                          }
                          className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${
                            pathname === item.href
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                          }`}
                        >
                          {item.name}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleNavClick(e, item.href)}
                          className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                          {item.name}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {!isAdminRoute && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col space-y-4">
                    {isLoggedIn ? (
                      <>
                        <div className="flex items-center space-x-3 px-3 py-2">
                          <User className="h-6 w-6" />
                          <span className="text-base font-medium">
                            {username}
                          </span>
                        </div>
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          disabled={isLoggingOut}
                          className="justify-start px-3 py-2 text-red-600 hover:text-red-700"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {isLoggingOut ? "Logging out..." : "Log out"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Log in
                        </Link>
                        <Link
                          href="/signup"
                          className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
