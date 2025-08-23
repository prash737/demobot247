import { NextResponse } from "next/server"

export async function GET() {
  // Set CORS headers to allow loading from any domain
  const headers = {
    "Content-Type": "application/javascript",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=3600",
  }

  // Get the embed script content
  const script = `
  (function(window, document) {
    // Get script attributes
    const script = document.currentScript;
    const chatbotId = script.getAttribute('data-chatbot-id') || 'default';
    const position = script.getAttribute('data-position') || 'bottom-right';
    const autoOpen = script.getAttribute('data-auto-open') === 'true';
    const mobileOnly = script.getAttribute('data-mobile-only') === 'true';
    const desktopOnly = script.getAttribute('data-desktop-only') === 'true';
    const delay = parseInt(script.getAttribute('data-delay') || '0', 10);
    const embedType = script.getAttribute('data-type') || 'popup'; // Default to popup
    
    // Create styles
    const style = document.createElement('style');
    style.innerHTML = \`
      .bot247-widget-container {
        position: fixed;
        z-index: 9999;
        transition: all 0.3s ease;
      }
      .bot247-widget-container.bottom-right {
        bottom: 20px;
        right: 20px;
      }
      .bot247-widget-container.bottom-left {
        bottom: 20px;
        left: 20px;
      }
      .bot247-widget-container.top-right {
        top: 20px;
        right: 20px;
      }
      .bot247-widget-container.top-left {
        top: 20px;
        left: 20px;
      }
      .bot247-chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3B82F6, #10B981);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .bot247-chat-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
      }
      .bot247-chat-icon {
        width: 30px;
        height: 30px;
        fill: white;
      }
      .bot247-chat-frame {
        position: fixed;
        width: 380px;
        height: 600px;
        max-height: 80vh;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 36px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
        z-index: 9999;
      }
      .bot247-chat-frame.open {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
      }
      .bot247-chat-frame.bottom-right {
        bottom: 90px;
        right: 20px;
      }
      .bot247-chat-frame.bottom-left {
        bottom: 90px;
        left: 20px;
      }
      .bot247-chat-frame.top-right {
        top: 90px;
        right: 20px;
      }
      .bot247-chat-frame.top-left {
        top: 90px;
        left: 20px;
      }
      .bot247-chat-frame iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      @media (max-width: 480px) {
        .bot247-chat-frame {
          width: 100%;
          height: 100%;
          max-height: 100%;
          border-radius: 0;
          bottom: 0 !important;
          right: 0 !important;
          left: 0 !important;
          top: 0 !important;
        }
        .bot247-chat-button {
          width: 50px;
          height: 50px;
        }
        .bot247-chat-icon {
          width: 25px;
          height: 25px;
        }
      }
    \`;
    document.head.appendChild(style);
    
    // Check if should show based on device
    const isMobile = window.innerWidth <= 768;
    if ((mobileOnly && !isMobile) || (desktopOnly && isMobile)) {
      return;
    }
    
    // Handle popup embed type
    if (embedType === 'popup') {
      // Create chat button
      const buttonContainer = document.createElement('div');
      buttonContainer.className = \`bot247-widget-container \${position}\`;
      
      const chatButton = document.createElement('div');
      chatButton.className = 'bot247-chat-button';
      chatButton.innerHTML = \`
        <svg class="bot247-chat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
          <path d="M7 9H17M7 13H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      \`;
      buttonContainer.appendChild(chatButton);
      document.body.appendChild(buttonContainer);
      
      // Create chat frame
      const chatFrameContainer = document.createElement('div');
      chatFrameContainer.className = \`bot247-chat-frame \${position}\`;
      
      const chatFrame = document.createElement('iframe');
      chatFrame.src = 'https://chatbot247.vercel.app/embed/\${chatbotId}';
      chatFrame.title = 'Bot247 Chat';
      chatFrame.allow = 'microphone';
      chatFrameContainer.appendChild(chatFrame);
      document.body.appendChild(chatFrameContainer);
      
      // Toggle chat frame
      let isOpen = false;
      chatButton.addEventListener('click', function() {
        isOpen = !isOpen;
        if (isOpen) {
          chatFrameContainer.classList.add('open');
        } else {
          chatFrameContainer.classList.remove('open');
        }
      });
      
      // Auto open after delay if specified
      if (autoOpen && delay > 0) {
        setTimeout(function() {
          chatButton.click();
        }, delay);
      }
    } else {
      // Handle inline embed type
      const inlineContainer = document.createElement('div');
      inlineContainer.className = 'bot247-inline-container';
      
      const inlineFrame = document.createElement('iframe');
      inlineFrame.src = 'https://chatbot247.vercel.app/embed/\${chatbotId}';
      inlineFrame.title = 'Bot247 Chat';
      inlineFrame.allow = 'microphone';
      inlineFrame.style.width = '100%';
      inlineFrame.style.height = '600px';
      inlineFrame.style.border = 'none';
      inlineFrame.style.borderRadius = '12px';
      inlineFrame.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      
      inlineContainer.appendChild(inlineFrame);
      
      // Find the script tag and insert the inline container after it
      script.parentNode.insertBefore(inlineContainer, script.nextSibling);
    }
  })(window, document);
`

  return new NextResponse(script, { headers })
}

export async function OPTIONS() {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  })
}
