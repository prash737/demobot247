"use client";

import type React from "react";
import { Footer } from "@/app/components/footer";

import { useState, useEffect } from "react";
import {
  Search,
  Book,
  Settings,
  BarChart3,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  ArrowUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InternalHero } from "@/app/components/internal-hero";

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  subsections: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
}

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "getting-started",
  ]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const docSections: DocSection[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Book className="h-5 w-5" />,
      description: "Learn the basics of Bot247 and set up your first chatbot",
      subsections: [
        {
          id: "introduction",
          title: "Introduction",
          content: (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Welcome to Bot247</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Bot247 is a powerful AI-powered chatbot platform designed
                specifically for organizations. Our platform enables you to
                create, customize, and deploy intelligent chatbots that provide
                24/7 automated inquiry handling, streamlining your entire
                operational process with intelligent responses and efficient
                handling.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <span>Key Features</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>24/7 Automated Support</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span>150+ Languages Support</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span>Knowledge Base Integration</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        <span>Customizable Themes</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span>Advanced Analytics</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                        <span>WhatsApp Integration</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-green-600" />
                      <span>System Requirements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>
                        • Modern web browser (Chrome, Firefox, Safari, Edge)
                      </li>
                      <li>• Internet connection</li>
                      <li>
                        • Basic knowledge of your organization's processes
                      </li>
                      <li>• No special hardware requirements</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Quick Start Guide
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>Create your Bot247 account</li>
                  <li>Select a subscription plan</li>
                  <li>Set up your chatbot configuration</li>
                  <li>Customize appearance and themes</li>
                  <li>Add your organization's knowledge base</li>
                  <li>Deploy to your website</li>
                </ol>
              </div>
            </div>
          ),
        },
        {
          id: "account-setup",
          title: "Account Setup",
          content: (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Setting Up Your Account</h3>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p>Visit the Bot247 signup page and provide:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Organization name and email address</li>
                      <li>Contact information</li>
                      <li>Organization type and size</li>
                      <li>Primary use case for the chatbot</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Step 2: Plan Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p>Choose from our available plans:</p>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="border rounded-lg p-3">
                        <h4 className="font-semibold">Free Trial</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Explore Bot247 features
                        </p>
                        <Badge variant="outline">Free Trial</Badge>
                        <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <li>Upto 50 chat sessions/month</li>
                          <li>Upto 10 FAQ uploads</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h4 className="font-semibold">Basic Plan</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Perfect for small organizations
                        </p>
                        <Badge variant="secondary">₹3,000/month</Badge>
                        <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <li>Upto 200 chat sessions/month</li>
                          <li>Unlimited FAQs upload</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h4 className="font-semibold">Pro Plan</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Advanced features and analytics
                        </p>
                        <Badge variant="default">₹7,000/month</Badge>
                        <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <li>Upto 1500 chat sessions/month</li>
                          <li>Unlimited FAQs upload</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-3">
                        <h4 className="font-semibold">Advanced Plan</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Enterprise-grade solution
                        </p>
                        <Badge variant="destructive">₹10,000/month</Badge>
                        <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <li>Upto 4000 chat sessions/month</li>
                          <li>Unlimited FAQs upload</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "chatbot-creation",
      title: "Chatbot Creation",
      icon: <MessageSquare className="h-5 w-5" />,
      description: "Learn how to create and configure your chatbot",
      subsections: [
        {
          id: "basic-setup",
          title: "Basic Setup",
          content: (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                Creating Your First Chatbot
              </h3>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Before You Start
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Ensure you have your organization's information, FAQs, and any
                  specific requirements ready before creating your chatbot.
                </p>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Chatbot Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Basic Settings</h5>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <strong>Chatbot Name:</strong> Choose a friendly,
                          professional name
                        </li>
                        <li>
                          <strong>Welcome Message:</strong> First message users
                          see
                        </li>
                        <li>
                          <strong>Response Tone:</strong> Formal, friendly, or
                          casual
                        </li>
                        <li>
                          <strong>Response Length:</strong> Concise, detailed,
                          or adaptive
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Advanced Settings</h5>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <strong>Fallback Responses:</strong> What to say when
                          unsure
                        </li>
                        <li>
                          <strong>Escalation Rules:</strong> When to transfer to
                          human representatives
                        </li>
                        <li>
                          <strong>Operating Hours:</strong> When the bot is
                          active
                        </li>
                        <li>
                          <strong>Language Detection:</strong> Auto-detect user
                          language
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
        {
          id: "knowledge-base",
          title: "Knowledge Base",
          content: (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                Building Your Knowledge Base
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                The knowledge base is the foundation of your chatbot's
                intelligence. It contains all the information your chatbot uses
                to answer user inquiries.
              </p>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Supported Formats</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• PDF documents</li>
                          <li>• Word documents (.docx)</li>
                          <li>• Web pages (URL import)</li>
                          <li>• CSV files</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Content Categories</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• Service requirements</li>
                          <li>• Operational procedures</li>
                          <li>• Deadlines and dates</li>
                          <li>• Pricing structures</li>
                          <li>• Product/service information</li>
                          <li>• Company facilities</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>File Size Limits & Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                        Document Upload Specifications
                      </h5>
                      <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                        <div>
                          <strong>Maximum File Size: 10MB per document</strong>
                          <p className="mt-1">
                            Each individual file (PDF, DOCX, CSV) must not
                            exceed 10 megabytes in size.
                          </p>
                        </div>
                        <div>
                          <strong>Supported File Types:</strong>
                          <ul className="list-disc list-inside mt-1 ml-4">
                            <li>
                              <strong>PDF:</strong> Portable Document Format
                              (.pdf) - Text-based PDFs work best
                            </li>
                            <li>
                              <strong>Word Documents:</strong> Microsoft Word
                              format (.docx) - Modern format only
                            </li>
                            <li>
                              <strong>CSV:</strong> Comma-separated values
                              (.csv) - For structured data
                            </li>
                          </ul>
                        </div>
                        <div>
                          <strong>Processing Guidelines:</strong>
                          <ul className="list-disc list-inside mt-1 ml-4">
                            <li>
                              Ensure text is selectable in PDFs (not scanned
                              images)
                            </li>
                            <li>
                              Use clear formatting and structure in documents
                            </li>
                            <li>Avoid password-protected files</li>
                            <li>
                              Files with complex layouts may take longer to
                              process
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                        <h6 className="font-medium text-green-900 dark:text-green-100">
                          ✓ Do
                        </h6>
                        <ul className="text-sm text-green-800 dark:text-green-200 mt-1 space-y-1">
                          <li>• Keep information current and accurate</li>
                          <li>• Use clear, simple language</li>
                          <li>• Organize content by categories</li>
                          <li>• Include common variations of questions</li>
                          <li>• Compress large files before uploading</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                        <h6 className="font-medium text-red-900 dark:text-red-100">
                          ✗ Don't
                        </h6>
                        <ul className="text-sm text-red-800 dark:text-red-200 mt-1 space-y-1">
                          <li>• Upload outdated information</li>
                          <li>• Use overly technical jargon</li>
                          <li>• Duplicate content across categories</li>
                          <li>• Include sensitive personal data</li>
                          <li>• Upload files larger than 10MB</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "customization",
      title: "Customization",
      icon: <Settings className="h-5 w-5" />,
      description: "Customize your chatbot's appearance and behavior",
      subsections: [
        {
          id: "theme-customization",
          title: "Theme Customization",
          content: (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                Customizing Your Chatbot's Appearance
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                Make your chatbot match your organization's branding with our
                comprehensive theming options.
              </p>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customization Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Basic Settings</h5>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-600 rounded"></div>
                            <span className="text-sm">Chatbot Name</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-green-600 rounded"></div>
                            <span className="text-sm">Primary Color</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-purple-600 rounded"></div>
                            <span className="text-sm">Secondary Color</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Advanced Settings</h5>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-400 rounded-lg"></div>
                            <span className="text-sm">Border Radius</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-orange-600 rounded-full"></div>
                            <span className="text-sm">Icon Change</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pulsating Effect</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      Enhance user engagement with a subtle pulsating effect on
                      your chatbot widget. This visual cue draws attention
                      without being intrusive, indicating activity or a new
                      message.
                    </p>
                    <div className="space-y-2 text-sm">
                      <li>
                        <strong>Enable/Disable:</strong> Toggle the pulsating
                        effect on or off.
                      </li>
                    </div>
                    <div className="flex justify-center items-center gap-8 my-6">
                      {/* Enhanced Pulsating Effect */}
                      <div className="text-center">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 shadow-lg">
                          <div className="absolute h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></div>
                          <div className="absolute h-full w-full animate-pulse rounded-full bg-blue-300 opacity-50"></div>
                          <MessageSquare className="h-12 w-12 text-white relative z-10 drop-shadow-lg" />
                        </div>
                        <p className="text-sm font-medium mt-2 text-blue-600">
                          Pulsating
                        </p>
                      </div>

                      {/* Non-Pulsating Effect */}
                      <div className="text-center">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gray-600 shadow-lg">
                          <MessageSquare className="h-12 w-12 text-white relative z-10 drop-shadow-lg" />
                        </div>
                        <p className="text-sm font-medium mt-2 text-gray-600">
                          Non-Pulsating
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
        {
          id: "embedding",
          title: "Website Integration",
          content: (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Embedding Your Chatbot</h3>

              <p className="text-gray-600 dark:text-gray-300">
                Integrate your chatbot seamlessly into your website with our
                flexible embedding options.
              </p>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Integration Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded p-4">
                        <h5 className="font-medium mb-2">
                          JavaScript Widget (Recommended)
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          Add a floating chat widget to any page with a simple
                          script tag.
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                          {`<script src="https://chat.bot247.live/widget.js" 
        data-chatbot-id="your-chatbot-id">
</script>`}
                        </div>
                      </div>

                      <div className="border rounded p-4">
                        <h5 className="font-medium mb-2">Iframe Embed</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          Embed the chatbot directly into a specific area of
                          your page.
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                          {`<iframe src="https://chat.bot247.live/embed/your-chatbot-id" 
        width="400" height="600">
</iframe>`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Allowed Embed Domains</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      Control where your chatbot can be embedded by specifying
                      allowed domains. This security feature prevents
                      unauthorized use of your chatbot on other websites.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Domain Configuration
                        </h5>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>
                            • Add your website domains (e.g., yourcompany.com)
                          </li>
                          <li>
                            • Support for subdomains (e.g., *.yourcompany.com)
                          </li>
                          <li>• Multiple domain support</li>
                          <li>• Localhost support for testing</li>
                        </ul>
                      </div>
                      <div className="border rounded p-4">
                        <h5 className="font-medium mb-2">
                          Example Configuration
                        </h5>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                          {`Allowed Domains:
• https://yourcompany.com
• https://www.yourcompany.com  
• https://admissions.yourcompany.com
• https://localhost:3000 (for testing)`}
                        </div>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                        <h6 className="font-medium text-yellow-900 dark:text-yellow-100">
                          Security Benefits
                        </h6>
                        <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-1 space-y-1">
                          <li>• Prevents unauthorized chatbot usage</li>
                          <li>• Protects your usage quotas</li>
                          <li>• Maintains brand integrity</li>
                          <li>
                            • Ensures compliance with organizational policies
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "analytics",
      title: "Analytics & Reporting",
      icon: <BarChart3 className="h-5 w-5" />,
      description:
        "Monitor performance and gain insights from your chatbot data",
      subsections: [
        {
          id: "dashboard-overview",
          title: "Dashboard Overview",
          content: (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Analytics Dashboard</h3>

              <p className="text-gray-600 dark:text-gray-300">
                Get comprehensive insights into your chatbot's performance and
                user interactions.
              </p>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          1,245
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Total Conversations
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-green-600">
                          5,678
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          User Queries
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          89%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Resolution Rate
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <div className="text-2xl font-bold text-orange-600">
                          2.4m
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Avg Response Time
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Popular Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Service Requirements</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded">
                            <div className="w-20 h-2 bg-blue-600 rounded"></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            456
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Operational Deadlines</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded">
                            <div className="w-16 h-2 bg-green-600 rounded"></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            345
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pricing Inquiries</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded">
                            <div className="w-12 h-2 bg-purple-600 rounded"></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            234
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conversation Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Tracking Features</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• Real-time conversation monitoring</li>
                          <li>• User satisfaction ratings</li>
                          <li>• Response accuracy metrics</li>
                          <li>• Conversation flow analysis</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Insights & Trends</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• Peak usage hours</li>
                          <li>• Common question patterns</li>
                          <li>• User engagement metrics</li>
                          <li>• Performance benchmarks</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Management Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Search & Filter</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• Filter by date range</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Export Options</h5>
                        <ul className="space-y-1 text-sm">
                          <li>• Export to PDF</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
        {
          id: "conversation-history",
          title: "Conversation History",
          content: (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                Managing Conversation History
              </h3>

              <p className="text-gray-600 dark:text-gray-300">
                Access and analyze all conversations to improve your chatbot's
                performance and understand user behavior patterns.
              </p>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Data Protection
                      </h5>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• All conversations are encrypted</li>
                        <li>• GDPR and relevant data privacy compliant</li>
                        <li>• Automatic data retention policies</li>
                        <li>• User consent management</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: <HelpCircle className="h-5 w-5" />,
      description: "Common issues and solutions",
      subsections: [
        {
          id: "common-issues",
          title: "Common Issues",
          content: (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Troubleshooting Guide</h3>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Chatbot Not Responding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                      <h5 className="font-medium text-red-900 dark:text-red-100 mb-2">
                        Symptoms
                      </h5>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                        <li>• Chatbot widget not appearing</li>
                        <li>• Messages not being sent</li>
                        <li>• No response from chatbot</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        Solutions
                      </h5>
                      <ol className="text-sm text-green-800 dark:text-green-200 space-y-1 list-decimal list-inside">
                        <li>
                          Check if chatbot status is "Active" in dashboard
                        </li>
                        <li>Verify embed code is correctly placed</li>
                        <li>Clear browser cache and cookies</li>
                        <li>Check browser console for JavaScript errors</li>
                        <li>Ensure your plan hasn't exceeded usage limits</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Base Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                      <h5 className="font-medium text-red-900 dark:text-red-100 mb-2">
                        Symptoms
                      </h5>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                        <li>• Chatbot giving incorrect answers</li>
                        <li>• "I don't know" responses too frequent</li>
                        <li>• Document upload failures</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        Solutions
                      </h5>
                      <ol className="text-sm text-green-800 dark:text-green-200 space-y-1 list-decimal list-inside">
                        <li>Review and update knowledge base content</li>
                        <li>Add more variations of common questions</li>
                        <li>Check file formats are supported</li>
                        <li>Ensure files are under size limits (10MB)</li>
                        <li>Re-train chatbot after major updates</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Issues</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                      <h5 className="font-medium text-red-900 dark:text-red-100 mb-2">
                        Symptoms
                      </h5>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                        <li>• Slow response times</li>
                        <li>• Widget loading slowly</li>
                        <li>• Timeout errors</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        Solutions
                      </h5>
                      <ol className="text-sm text-green-800 dark:text-green-200 space-y-1 list-decimal list-inside">
                        <li>Check your internet connection</li>
                        <li>Optimize knowledge base size</li>
                        <li>Consider upgrading your plan</li>
                        <li>Contact support for server status</li>
                        <li>Implement caching strategies</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  const filteredSections = docSections.filter(
    (section) =>
      searchQuery === "" ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.subsections.some((sub) =>
        sub.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[data-section]");
      const scrollPosition = window.scrollY + 200; // Increased offset for better detection

      let currentSection = "";
      sections.forEach((section) => {
        const element = section as HTMLElement;
        const top = element.offsetTop - 100;
        const bottom = top + element.offsetHeight;

        if (scrollPosition >= top && scrollPosition < bottom) {
          currentSection = element.dataset.section || "";
        }
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }

      // For "Back to Top" button visibility
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <InternalHero title="Documentation" />

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Navigation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contents</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-2 p-4">
                        {filteredSections.map((section) => (
                          <div key={section.id}>
                            <Button
                              variant="ghost"
                              className={`w-full justify-start text-left h-auto p-2 ${
                                activeSection === section.id ||
                                section.subsections.some(
                                  (sub) => sub.id === activeSection,
                                )
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                  : ""
                              }`}
                              onClick={() => {
                                toggleSection(section.id);
                                scrollToSection(section.id);
                              }}
                            >
                              <div className="flex items-center space-x-2 w-full">
                                {section.icon}
                                <span className="flex-1">{section.title}</span>
                                {expandedSections.includes(section.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                            </Button>

                            {expandedSections.includes(section.id) && (
                              <div className="ml-6 mt-2 space-y-1">
                                {section.subsections.map((subsection) => (
                                  <Button
                                    key={subsection.id}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-left text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                                    onClick={() =>
                                      scrollToSection(subsection.id)
                                    }
                                  >
                                    {subsection.title}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="space-y-12">
                {filteredSections.map((section) => (
                  <div
                    key={section.id}
                    data-section={section.id}
                    className="scroll-mt-24"
                  >
                    <div className="mb-8">
                      <div className="flex items-center space-x-3 mb-4">
                        {section.icon}
                        <h2 className="text-3xl font-bold">{section.title}</h2>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">
                        {section.description}
                      </p>
                    </div>

                    <div className="space-y-8">
                      {section.subsections.map((subsection) => (
                        <Card
                          key={subsection.id}
                          data-section={subsection.id}
                          className="scroll-mt-24"
                        >
                          <CardContent className="p-8">
                            {subsection.content}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Support CTA */}
              <Card className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    Still have questions?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Our intelligent assistant is here to help you navigate
                    Bot247 and answer any questions you might have about our
                    platform.
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <MessageSquare className="h-5 w-5" />
                      <span className="font-medium">
                        You can chat with our AI assistant using the widget in
                        the bottom-left corner
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        {showScrollToTop && (
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
        )}
      </div>
      <Footer />
    </>
  );
}
