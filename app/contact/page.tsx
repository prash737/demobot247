"use client"; // Make this a client component to handle form submission

import type React from "react";

import { useState } from "react";
import { InternalHero } from "@/app/components/internal-hero";
import { Footer } from "@/app/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper";
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import { Loader2 } from "lucide-react"; // Import Loader2 for loading state
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const countryCodes = [
  { code: "+1", country: "USA/Canada", minLen: 10, maxLen: 10 },
  { code: "+1", country: "Trinidad & Tobago", minLen: 7, maxLen: 7 }, // Specific entry for T&T
  { code: "+7", country: "Russia", minLen: 10, maxLen: 10 },
  { code: "+20", country: "Egypt", minLen: 10, maxLen: 10 },
  { code: "+27", country: "South Africa", minLen: 9, maxLen: 9 },
  { code: "+31", country: "Netherlands", minLen: 9, maxLen: 9 },
  { code: "+32", country: "Belgium", minLen: 8, maxLen: 10 },
  { code: "+33", country: "France", minLen: 9, maxLen: 9 },
  { code: "+34", country: "Spain", minLen: 9, maxLen: 9 },
  { code: "+36", country: "Hungary", minLen: 8, maxLen: 9 },
  { code: "+39", country: "Italy", minLen: 6, maxLen: 12 },
  { code: "+40", country: "Romania", minLen: 9, maxLen: 9 },
  { code: "+43", country: "Austria", minLen: 4, maxLen: 13 },
  { code: "+44", country: "UK", minLen: 10, maxLen: 10 },
  { code: "+45", country: "Denmark", minLen: 8, maxLen: 8 },
  { code: "+46", country: "Sweden", minLen: 6, maxLen: 9 },
  { code: "+47", country: "Norway", minLen: 4, maxLen: 12 },
  { code: "+48", country: "Poland", minLen: 9, maxLen: 9 },
  { code: "+49", country: "Germany", minLen: 3, maxLen: 12 },
  { code: "+51", country: "Peru", minLen: 7, maxLen: 9 },
  { code: "+52", country: "Mexico", minLen: 10, maxLen: 10 },
  { code: "+54", country: "Argentina", minLen: 10, maxLen: 13 },
  { code: "+55", country: "Brazil", minLen: 10, maxLen: 11 },
  { code: "+56", country: "Chile", minLen: 8, maxLen: 9 },
  { code: "+57", country: "Colombia", minLen: 10, maxLen: 10 },
  { code: "+58", country: "Venezuela", minLen: 7, maxLen: 11 },
  { code: "+591", country: "Bolivia", minLen: 7, maxLen: 8 },
  { code: "+592", country: "Guyana", minLen: 7, maxLen: 7 },
  { code: "+593", country: "Ecuador", minLen: 9, maxLen: 10 },
  { code: "+595", country: "Paraguay", minLen: 7, maxLen: 9 },
  { code: "+597", country: "Suriname", minLen: 7, maxLen: 7 },
  { code: "+598", country: "Uruguay", minLen: 7, maxLen: 8 },
  { code: "+61", country: "Australia", minLen: 10, maxLen: 15 },
  { code: "+62", country: "Indonesia", minLen: 7, maxLen: 13 },
  { code: "+63", country: "Philippines", minLen: 10, maxLen: 10 },
  { code: "+64", country: "New Zealand", minLen: 8, maxLen: 15 },
  { code: "+65", country: "Singapore", minLen: 8, maxLen: 8 },
  { code: "+66", country: "Thailand", minLen: 9, maxLen: 10 },
  { code: "+675", country: "Papua N.G.", minLen: 8, maxLen: 8 },
  { code: "+679", country: "Fiji", minLen: 7, maxLen: 7 },
  { code: "+685", country: "Samoa", minLen: 7, maxLen: 7 },
  { code: "+81", country: "Japan", minLen: 10, maxLen: 11 },
  { code: "+82", country: "South Korea", minLen: 10, maxLen: 11 },
  { code: "+86", country: "China", minLen: 7, maxLen: 11 },
  { code: "+880", country: "Bangladesh", minLen: 10, maxLen: 11 },
  { code: "+90", country: "Turkey", minLen: 10, maxLen: 10 },
  { code: "+91", country: "India", minLen: 10, maxLen: 10 },
  { code: "+92", country: "Pakistan", minLen: 10, maxLen: 11 },
  { code: "+94", country: "Sri Lanka", minLen: 9, maxLen: 9 },
  { code: "+234", country: "Nigeria", minLen: 10, maxLen: 10 },
  { code: "+254", country: "Kenya", minLen: 9, maxLen: 9 },
  { code: "+352", country: "Luxembourg", minLen: 8, maxLen: 12 },
  { code: "+353", country: "Ireland", minLen: 7, maxLen: 10 },
  { code: "+358", country: "Finland", minLen: 5, maxLen: 12 },
  { code: "+359", country: "Bulgaria", minLen: 7, maxLen: 9 },
  { code: "+372", country: "Estonia", minLen: 7, maxLen: 8 },
  { code: "+385", country: "Croatia", minLen: 8, maxLen: 9 },
  { code: "+420", country: "Czech Republic", minLen: 9, maxLen: 9 },
  { code: "+852", country: "Hong Kong", minLen: 8, maxLen: 8 },
  { code: "+855", country: "Cambodia", minLen: 8, maxLen: 9 },
  { code: "+966", country: "Saudi Arabia", minLen: 9, maxLen: 9 },
  { code: "+971", country: "UAE", minLen: 9, maxLen: 9 },
  { code: "+972", country: "Israel", minLen: 9, maxLen: 9 },
  { code: "+974", country: "Qatar", minLen: 8, maxLen: 8 },
  { code: "+977", country: "Nepal", minLen: 10, maxLen: 10 },
  { code: "+994", country: "Azerbaijan", minLen: 9, maxLen: 9 },
  { code: "+995", country: "Georgia", minLen: 9, maxLen: 9 },
  { code: "+998", country: "Uzbekistan", minLen: 9, maxLen: 9 },
];

const allowedEmailDomains = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  ".com",
  ".co.uk",
  ".org",
  ".net",
  ".edu",
  ".gov",
  ".io",
  ".ai",
  ".xyz",
  ".app",
  ".tech",
  ".co",
  ".me",
  ".dev",
  ".info",
  ".us",
  ".uk",
  ".ca",
  ".au",
  ".de",
  ".fr",
  ".jp",
  ".cn",
  ".br",
  ".za",
  ".ru",
  ".es",
  ".it",
  ".mx",
  ".id",
  ".ph",
  ".sg",
  ".th",
  ".kr",
  ".tr",
  ".sa",
  ".il",
  ".qa",
  ".np",
  ".az",
  ".ge",
  ".uz",
]);

// Validation functions (copied from signup page)
function validateName(
  name: string,
  fieldName: string,
): { isValid: boolean; message: string } {
  if (!name.trim()) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name.trim())) {
    return {
      isValid: false,
      message: `${fieldName} should only contain alphabetic characters`,
    };
  }
  if (name.trim().length < 2) {
    return {
      isValid: false,
      message: `${fieldName} must be at least 2 characters long`,
    };
  }
  if (name.trim().length > 50) {
    return {
      isValid: false,
      message: `${fieldName} must be less than 50 characters`,
    };
  }
  return { isValid: true, message: "" };
}

function validatePhoneNumber(
  number: string,
  code: string,
): { isValid: boolean; message: string } {
  if (!number.trim()) {
    return { isValid: false, message: "Phone number is required" };
  }
  const selectedCountry = countryCodes.find((c) => c.code === code);
  if (!selectedCountry) {
    return { isValid: false, message: "Invalid country code selected" };
  }
  const cleanedNumber = number.replace(/\D/g, "");
  if (
    cleanedNumber.length < selectedCountry.minLen ||
    cleanedNumber.length > selectedCountry.maxLen
  ) {
    return {
      isValid: false,
      message: `Phone number must be between ${selectedCountry.minLen} and ${selectedCountry.maxLen} digits for ${selectedCountry.country}`,
    };
  }
  return { isValid: true, message: "" };
}

function validateEmail(email: string): { isValid: boolean; message: string } {
  if (!email.trim()) {
    return { isValid: false, message: "Email is required" };
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      message: "Please enter a valid email address (e.g., user@example.com)",
    };
  }
  if (email.trim().length > 320) {
    return { isValid: false, message: "Email address is too long" };
  }
  const domainPart = email.split("@")[1]?.toLowerCase();
  if (!domainPart) {
    return {
      isValid: false,
      message: "Email address is missing a domain part.",
    };
  }
  if (allowedEmailDomains.has(domainPart)) {
    return { isValid: true, message: "" };
  }
  let domainAllowed = false;
  for (const allowedSuffix of allowedEmailDomains) {
    if (allowedSuffix.startsWith(".")) {
      if (domainPart.endsWith(allowedSuffix)) {
        domainAllowed = true;
        break;
      }
    }
  }
  if (!domainAllowed) {
    return {
      isValid: false,
      message: "Email domain is not allowed. Please use a recognized domain.",
    };
  }
  return { isValid: true, message: "" };
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91"); // Default to +91 (India)
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast(); // Initialize useToast
  const [submissionMessage, setSubmissionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionMessage(null);
    setIsSubmitting(true);

    // Validate Name
    const nameValidation = validateName(name, "Name");
    if (!nameValidation.isValid) {
      toast({
        title: "Validation Error",
        description: nameValidation.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate Email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Validation Error",
        description: emailValidation.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate Phone Number (if provided, otherwise it's optional)
    if (phoneNumber.trim()) {
      const phoneNumberValidation = validatePhoneNumber(
        phoneNumber,
        countryCode,
      );
      if (!phoneNumberValidation.isValid) {
        toast({
          title: "Validation Error",
          description: phoneNumberValidation.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    if (!countryCode) {
      toast({
        title: "Validation Error",
        description: "Country code is required.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Validation Error",
        description:
          "Message cannot be empty and must contain at least one letter.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phoneNumber, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message.");
      }

      // Success toast notification
      toast({
        title: "Success!",
        description:
          "Your message has been sent successfully. We will get back to you soon!",
      });

      // Set persistent success message
      setSubmissionMessage({
        type: "success",
        text: "Your message has been sent successfully. We will get back to you soon!",
      });

      // Clear form fields
      setName("");
      setEmail("");
      setPhoneNumber("");
      setMessage("");
      setCountryCode("+91"); // Reset country code to default
    } catch (error) {
      console.error("Contact form submission error:", error);
      // Error toast notification
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });

      // Set persistent error message
      setSubmissionMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MarketingPageWrapper>
        <InternalHero title="Contact Us" />
        <section className="mb-8">
          <div className="container">
            <div className="row" style={{ alignItems: "center" }}>
              <div className="col-lg-6">
                <div className="contact_rightbox">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-lg-6 mb-3">
                        <div className="row">
                          <div className="col-lg-12 mb-1">
                            <div className="label">Your Name</div>
                          </div>
                          <div className="col-lg-12">
                            <Input
                              type="text"
                              id="name"
                              name="name"
                              required
                              value={name}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Removed: const filteredValue = value.replace(/[^a-zA-Z]/g, "")
                                setName(value); // Set the value directly
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 mb-3">
                        <div className="row">
                          <div className="col-lg-12 mb-1">
                            <div className="label">Your Email ID</div>
                          </div>
                          <div className="col-lg-12">
                            <Input
                              type="email"
                              id="email"
                              name="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-sm-6 mb-3">
                        <div className="row">
                          <div className="col-lg-12 mb-1">
                            <div className="label">Country Code</div>
                          </div>
                          <div className="col-lg-12 countrycode_box">
                            <Select
                              value={countryCode}
                              onValueChange={setCountryCode}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select country code" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {countryCodes.map((option) => (
                                  <SelectItem
                                    key={option.code}
                                    value={option.code}
                                  >
                                    {option.code} ({option.country})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6 col-sm-6 mb-3">
                        <div className="row">
                          <div className="col-lg-12 mb-1">
                            <div className="label">Mobile Number</div>
                          </div>
                          <div className="col-lg-12">
                            <Input
                              type="tel"
                              id="phoneNumber"
                              name="phoneNumber"
                              required
                              value={phoneNumber}
                              onChange={(e) => {
                                const value = e.target.value;
                                const filteredValue = value.replace(/\D/g, "");
                                const selectedCountry = countryCodes.find(
                                  (c) => c.code === countryCode,
                                );
                                if (
                                  selectedCountry &&
                                  filteredValue.length > selectedCountry.maxLen
                                ) {
                                  setPhoneNumber(
                                    filteredValue.slice(
                                      0,
                                      selectedCountry.maxLen,
                                    ),
                                  );
                                } else {
                                  setPhoneNumber(filteredValue);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12 mb-4">
                        <div className="row">
                          <div className="col-lg-12 mb-1">
                            <div className="label">Message</div>
                          </div>
                          <div className="col-lg-12">
                            <Textarea
                              id="message"
                              name="message"
                              rows={4}
                              required
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <Button
                          type="submit"
                          className="black_btn"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Message"
                          )}
                        </Button>
                        {submissionMessage && (
                          <div
                            className={`mt-4 p-3 rounded-md text-center ${
                              submissionMessage.type === "success"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {submissionMessage.text}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12"></div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="row">
                  <div
                    className="col-lg-12 text-center mb-5"
                    style={{ fontSize: "19px" }}
                  >
                    Have questions or want to learn more about{" "}
                    <span
                      style={{
                        fontSize: "19px",
                        color: "#25d366",
                        fontWeight: "bold",
                      }}
                    >
                      Bot247.live?
                    </span>{" "}
                    <br></br>We're here to help. Fill out the form below, and
                    we'll get back to you as soon as possible.
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6 col-sm-6 mb-3">
                    <div className="contact_info_list">
                      <div className="row" style={{ alignItems: "center" }}>
                        <div className="col-lg-3 text-center">
                          <img
                            src="/images/contact_email_icon.png"
                            className="img-fluid"
                          ></img>
                        </div>
                        <div className="col-lg-9">
                          <div className="row">
                            <div className="col-lg-12">Email</div>
                            <div className="col-lg-12">
                              <a
                                href="mailto:hello@bot247.live"
                                className="info_link"
                              >
                                hello@bot247.live
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-sm-6 mb-3">
                    <div className="contact_info_list">
                      <div className="row" style={{ alignItems: "center" }}>
                        <div className="col-lg-3 text-center">
                          <img
                            src="/images/contact_phone_icon.png"
                            className="img-fluid"
                          ></img>
                        </div>
                        <div className="col-lg-9">
                          <div className="row">
                            <div className="col-lg-12">Phone</div>
                            <div className="col-lg-12">
                              <a href="tel:7620369733" className="info_link">
                                +91 7620369733
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12 mb-3">
                    <div className="contact_info_list">
                      <div className="row" style={{ alignItems: "center" }}>
                        <div className="col-lg-2 text-center">
                          <img
                            src="/images/contact_address_icon.png"
                            className="img-fluid"
                          ></img>
                        </div>
                        <div className="col-lg-10">
                          <div className="row">
                            <div className="col-lg-12">Address</div>
                            <div className="col-lg-12 info_link">
                              Akruti Avenues, 402-403, Datta Mandir Rd, Shankar
                              Kalat Nagar, Wakad, Pune, Maharashtra 411057
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12"></div>
                </div>
                <div className="row">
                  <div className="col-lg-12"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <div className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-lg mb-6">
                Have questions or want to learn more about Bot247.live? We're here to help. Fill out the form below, and
                we'll get back to you as soon as possible.
              </p>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Email</h2>
                  <p>hello@bot247.live</p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Phone</h2>
                  <p>+91 7620369733</p>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Address</h2>
                  <p>Akruti Avenues, 402-403, Datta Mandir Rd, Shankar Kalat Nagar, Wakad, Pune, Maharashtra 411057</p>
                </div>
              </div>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => {
                    const value = e.target.value
                    // Removed: const filteredValue = value.replace(/[^a-zA-Z]/g, "")
                    setName(value) // Set the value directly
                  }}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="country-code"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Country Code
                  </label>
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country code" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {countryCodes.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.code} ({option.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Mobile Number
                  </label>
                  <Input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    required
                    value={phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value
                      const filteredValue = value.replace(/\D/g, "")
                      const selectedCountry = countryCodes.find((c) => c.code === countryCode)
                      if (selectedCountry && filteredValue.length > selectedCountry.maxLen) {
                        setPhoneNumber(filteredValue.slice(0, selectedCountry.maxLen))
                      } else {
                        setPhoneNumber(filteredValue)
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
              {submissionMessage && (
                <div
                  className={`mt-4 p-3 rounded-md text-center ${
                    submissionMessage.type === "success"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {submissionMessage.text}
                </div>
              )}
            </form>
          </div>
        </div> */}
      </MarketingPageWrapper>
      <Footer />
    </>
  );
}
