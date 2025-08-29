# Bot247 AI-Powered Chatbot Platform

## Overview

Bot247 is a comprehensive AI-powered chatbot platform designed specifically for organizations to provide 24/7 automated customer support and inquiry handling. The platform enables organizations to create, customize, and deploy intelligent chatbots with multilingual capabilities, knowledge base integration, and seamless website embedding.

The platform consists of a Next.js-based marketing website with an integrated admin dashboard for chatbot management, user administration, and analytics. The system supports various subscription plans (Basic, Pro, Advanced) and provides comprehensive customization options for appearance, behavior, and deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router for server-side rendering and static generation
- **UI Library**: Custom component system built on Radix UI primitives with Tailwind CSS styling
- **Component Structure**: Modular design with reusable UI components in `/components` directory
- **State Management**: React Context API for theme management and chatbot configuration
- **Styling**: Tailwind CSS with custom design system supporting light/dark themes

### Backend Architecture
- **API Layer**: Next.js API routes for server-side functionality
- **Authentication**: Custom authentication system with username/password credentials
- **File Processing**: Server actions for handling document uploads and website crawling
- **Data Processing**: Built-in support for various file formats (PDF, DOCX, CSV, TXT)

### Admin Dashboard
- **Role-Based Access**: Comprehensive admin interface with user management capabilities
- **Analytics**: Real-time dashboard with conversation metrics, user query analysis, and system monitoring
- **Bulk Operations**: Advanced admin tools for managing multiple users and chatbots simultaneously
- **Export Functionality**: Data export capabilities in multiple formats (CSV, Excel, JSON, PDF)

### Chatbot System
- **AI Integration**: Google AI SDK integration for natural language processing
- **Knowledge Base**: Flexible content management supporting website crawling, file uploads, and manual entry
- **Customization**: Comprehensive theme system with color schemes, border radius, and dark mode support
- **Embedding Options**: Multiple deployment methods (floating button, inline embed, full page)

### Data Storage Solutions
- **Primary Database**: Supabase (PostgreSQL) for user data, chatbot configurations, and conversation history
- **File Storage**: Supabase Storage for document uploads and profile pictures
- **Session Management**: Client-side session handling with secure credential verification

### Subscription and Payment System
- **Tiered Plans**: Three subscription levels with different feature sets and usage limits
- **Usage Tracking**: Built-in analytics for monitoring chat sessions and API usage
- **Plan Management**: Admin tools for subscription oversight and billing management

## External Dependencies

### Core Services
- **Supabase**: Primary backend-as-a-service for database, authentication, and file storage
- **Google AI SDK**: AI model integration for chatbot intelligence and natural language processing
- **Vercel Blob Storage**: Additional file storage for images and media assets

### UI and Styling
- **Radix UI**: Headless UI components for accessibility and consistent behavior
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent visual elements
- **React Owl Carousel**: Component library for interactive carousels and sliders

### Development Tools
- **TypeScript**: Type safety and enhanced development experience
- **Next.js**: React framework with built-in optimizations and deployment features
- **Chart.js**: Data visualization for analytics dashboards
- **React Markdown**: Markdown rendering for dynamic content display

### Third-Party Integrations
- **Website Crawling**: Cheerio for HTML parsing and content extraction
- **Document Processing**: Built-in support for various file formats
- **Email Services**: Integrated contact forms and notification systems
- **WhatsApp Integration**: Available for Advanced plan subscribers

### Deployment and Performance
- **CDN Integration**: Bootstrap and other assets served via CDN for improved performance
- **Image Optimization**: Next.js Image component with automatic optimization
- **Performance Monitoring**: Built-in analytics and error tracking
- **Security Headers**: Comprehensive security configuration for production deployment