# API Documentation

This document provides a comprehensive overview of the API endpoints and their functionalities.

## Endpoints

### 1. Inquiry Assistant

This endpoint helps users with general inquiries about our services.

*   **Path:** `/inquiries/assistant`
*   **Method:** `POST`
*   **Description:** Provides answers to frequently asked questions.
*   **Request Body:**
    \`\`\`json
    {
      "query": "What services do you offer?"
    }
    \`\`\`
*   **Response:**
    \`\`\`json
    {
      "answer": "We offer a variety of services..."
    }
    \`\`\`

### 2. Support Helper

This endpoint provides support related to pricing and payment options.

*   **Path:** `/support/helper`
*   **Method:** `POST`
*   **Description:** Assists users with pricing and payment related questions.
*   **Request Body:**
    \`\`\`json
    {
      "query": "What are your payment options?"
    }
    \`\`\`
*   **Response:**
    \`\`\`json
    {
      "answer": "We accept credit cards, debit cards, and bank transfers."
    }
    \`\`\`

### 3. Key Dates

This endpoint retrieves important key dates.

*   **Path:** `/keydates`
*   **Method:** `GET`
*   **Description:** Returns a list of key dates.
*   **Response:**
    \`\`\`json
    [
      {
        "date": "2024-01-15",
        "event": "Application Deadline"
      },
      {
        "date": "2024-02-28",
        "event": "Decision Release"
      }
    ]
    \`\`\`

### 4. Organizations

This endpoint manages organization data.

*   **Path:** `/organizations`
*   **Method:** `GET`
*   **Description:** Retrieves a list of all organizations.
*   **Response:**
    \`\`\`json
    [
      {
        "id": 1,
        "name": "Organization A"
      },
      {
        "id": 2,
        "name": "Organization B"
      }
    ]
    \`\`\`

### 5. Pricing

This endpoint provides information about pricing.

*   **Path:** `/pricing`
*   **Method:** `GET`
*   **Description:** Returns pricing details.
*   **Response:**
    \`\`\`json
    {
      "basic": 99,
      "premium": 199
    }
