import jsPDF from "jspdf"
import type { Lead } from "@/app/components/leads-display" // Import Lead type

interface InsightsData {
  date_of_convo: string
  total_conversations: number
  total_user_queries: number
  total_assistant_responses: number
  yesterday_total_conversations: number
  yesterday_total_user_queries: number
  yesterday_total_assistant_responses: number
  conversations_change: number
  user_queries_change: number
  assistant_responses_change: number
  total_messages: number
  yesterday_total_messages: number
  messages_change: number
}

export async function generateInsightsPDF(
  chatbotName: string,
  chatbotId: string,
  insights: InsightsData,
  unansweredQueries: { query: string; frequency: number }[],
  totalUnansweredCount: number,
  plots: string[],
  top10Queries: { query: string; frequency: number }[],
  leads: Lead[],
  userPlan: string,
  totalChats: number,
) {
  return new Promise<Blob>(async (resolve) => {
    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      let currentY = 10 // Starting Y position
      const margin = 20

      // Helper to add a new page if content exceeds current page height
      const ensureSpace = (requiredSpace: number) => {
        if (currentY + requiredSpace > pdfHeight - margin) {
          pdf.addPage()
          currentY = margin // Reset Y for new page
        }
      }

      // --- 1. Header and User Details ---
      pdf.setFontSize(22)
      pdf.setTextColor(79, 70, 229) // Indigo color
      pdf.text("Chatbot Insights Report", pdfWidth / 2, currentY, { align: "center" })

      currentY += 10
      pdf.setFontSize(16)
      pdf.setTextColor(55, 65, 81) // Gray-700
      pdf.text(chatbotName, pdfWidth / 2, currentY, { align: "center" })

      currentY += 8
      pdf.setFontSize(10)
      pdf.setTextColor(107, 114, 128) // Gray-500
      pdf.text(`Chatbot ID: ${chatbotId}`, pdfWidth / 2, currentY, { align: "center" })
      currentY += 5
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pdfWidth / 2, currentY, { align: "center" })

      currentY += 8
      pdf.setLineWidth(0.5)
      pdf.setDrawColor(229, 231, 235) // Gray-200
      pdf.line(margin, currentY, pdfWidth - margin, currentY)

      currentY += 10

      // --- 2. Performance Metrics Section ---
      if (insights) {
        ensureSpace(60) // Estimate space needed for metrics cards
        pdf.setFontSize(14)
        pdf.setTextColor(55, 65, 81) // Gray-700
        pdf.text("Performance Metrics", margin, currentY)

        currentY += 10

        const cardWidth = (pdfWidth - margin * 2 - 10) / 3 // Adjusted for 3 cards with spacing
        const cardHeight = 30
        const metrics = [
          {
            title: "Total Messages",
            value: insights.total_messages,
            change: insights.messages_change,
            color: [79, 70, 229], // Indigo/blue
          },
          {
            title: "Total User Queries",
            value: insights.total_user_queries,
            change: insights.user_queries_change,
            color: [16, 185, 129], // Green
          },
          {
            title: "Total Assistant Responses",
            value: insights.total_assistant_responses,
            change: insights.assistant_responses_change,
            color: [245, 158, 11], // Amber/orange
          },
        ]

        metrics.forEach((metric, index) => {
          const x = margin + index * (cardWidth + 5)

          pdf.setFillColor(249, 250, 251) // Gray-50
          pdf.setDrawColor(229, 231, 235) // Gray-200
          pdf.roundedRect(x, currentY, cardWidth, cardHeight, 3, 3, "FD")

          pdf.setFontSize(10)
          pdf.setTextColor(107, 114, 128) // Gray-500
          pdf.text(metric.title, x + 5, currentY + 7)

          pdf.setFontSize(16)
          pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2])
          pdf.text(String(metric.value), x + 5, currentY + 18) // Explicitly convert to string

          if (metric.change !== 0) {
            const changeColor = metric.change > 0 ? [16, 185, 129] : [239, 68, 68] // Green or Red
            const changeSymbol = metric.change > 0 ? "↑" : "↓"
            pdf.setFontSize(9)
            pdf.setTextColor(changeColor[0], changeColor[1], changeColor[2])
            pdf.text(`${changeSymbol} ${Math.abs(metric.change).toFixed(2)}%`, x + 5, currentY + 26)
          }
        })

        currentY += cardHeight + 15
      }

      // --- 3. Monthly Conversation Usage ---
      ensureSpace(40) // Estimate space needed for usage meter
      pdf.setFontSize(14)
      pdf.setTextColor(55, 65, 81) // Gray-700
      pdf.text("Monthly Conversation Usage", margin, currentY)

      currentY += 10

      pdf.setFillColor(249, 250, 251) // Gray-50
      pdf.setDrawColor(229, 231, 235) // Gray-200
      pdf.roundedRect(margin, currentY, pdfWidth - margin * 2, 25, 3, 3, "FD")

      const limit =
        userPlan === "Basic"
          ? 200
          : userPlan === "Pro"
            ? 1500
            : userPlan === "Advanced"
              ? 4000
              : Number.POSITIVE_INFINITY

      let percentageUsed = 0
      if (userPlan === "Basic") {
        percentageUsed = Math.min(Math.round((totalChats / limit) * 100), 100)
      } else {
        percentageUsed = Math.min(Math.round((totalChats / limit) * 100), 100)
      }

      let progressColor = [79, 70, 229] // Default indigo
      let textColor = [79, 70, 229]

      if (userPlan === "Basic") {
        if (percentageUsed >= 90) {
          progressColor = [239, 68, 68] // Red
          textColor = [185, 28, 28] // Darker Red
        } else if (percentageUsed >= 75) {
          progressColor = [245, 158, 11] // Amber
          textColor = [180, 83, 9] // Darker Amber
        }
      }

      pdf.setFontSize(10)
      pdf.setTextColor(55, 65, 81) // Gray-700
      pdf.text(`${totalChats} / ${limit} conversations`, margin + 5, currentY + 10)
      pdf.setTextColor(textColor[0], textColor[1], textColor[2])
      pdf.text(`${limit - totalChats} remaining`, pdfWidth - margin - 5, currentY + 10, { align: "right" })

      // Progress bar
      pdf.setDrawColor(229, 231, 235) // Gray-200
      pdf.setFillColor(243, 244, 246) // Gray-100 for background
      pdf.rect(margin + 5, currentY + 15, pdfWidth - margin * 2 - 10, 3, "F") // Background bar

      pdf.setFillColor(progressColor[0], progressColor[1], progressColor[2])
      pdf.rect(margin + 5, currentY + 15, (pdfWidth - margin * 2 - 10) * (percentageUsed / 100), 3, "F") // Progress bar

      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128) // Gray-500
      pdf.text(
        userPlan === "Basic"
          ? "Basic Plan: 200 conversations/month"
          : userPlan === "Pro"
            ? "Pro Plan: 1500 conversations/month"
            : "Advanced Plan: 4000 conversations/month",
        margin + 5,
        currentY + 22,
      )

      currentY += 35

      // --- 4. Analytics Visualizations Section ---
      if (plots && plots.length > 0) {
        pdf.addPage() // Always start plots on a new page for clarity
        currentY = margin

        pdf.setFontSize(14)
        pdf.setTextColor(55, 65, 81) // Gray-700
        pdf.text("Analytics Visualizations", margin, currentY)

        currentY += 10 // Space after title

        try {
          const loadedImages = await Promise.all(
            plots.map((plotUrl) => {
              return new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = "anonymous"
                img.onload = () => resolve(img)
                img.onerror = () => reject(new Error(`Failed to load image: ${plotUrl}`))
                img.src = plotUrl
              })
            }),
          )

          const plotsPerRow = 2
          const plotPaddingX = 10 // Horizontal padding between plots
          const plotPaddingY = 15 // Vertical padding between rows of plots
          const availableWidth = pdfWidth - margin * 2
          const plotWidth = (availableWidth - (plotsPerRow - 1) * plotPaddingX) / plotsPerRow
          const maxPlotHeight = 70 // Max height for each plot image
          const textHeight = 5 // Estimated height for plot name text

          let startYForCurrentRow = currentY

          for (let i = 0; i < loadedImages.length; i++) {
            const img = loadedImages[i]
            const aspectRatio = img.width / img.height
            let displayWidth = plotWidth
            let displayHeight = displayWidth / aspectRatio

            if (displayHeight > maxPlotHeight) {
              displayHeight = maxPlotHeight
              displayWidth = displayHeight * aspectRatio
            }

            const col = i % plotsPerRow
            const row = Math.floor(i / plotsPerRow)

            // Calculate potential Y for the current plot
            let plotY = startYForCurrentRow + row * (maxPlotHeight + textHeight + plotPaddingY)

            // If starting a new row and it doesn't fit, add a new page
            if (col === 0 && plotY + maxPlotHeight + textHeight + plotPaddingY > pdfHeight - margin) {
              pdf.addPage()
              currentY = margin
              startYForCurrentRow = currentY // Reset startY for new page
              plotY = currentY // Recalculate plotY for new page
            }

            const x = margin + col * (plotWidth + plotPaddingX)
            const imgX = x + (plotWidth - displayWidth) / 2 // Center image within its cell

            const canvas = document.createElement("canvas")
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext("2d")
            if (ctx) {
              ctx.drawImage(img, 0, 0)
              const imgData = canvas.toDataURL("image/png")

              pdf.addImage(imgData, "PNG", imgX, plotY, displayWidth, displayHeight)

              const plotName = decodeURIComponent(plots[i].split("/").pop()?.split(".")[0] || `Plot ${i + 1}`)
              pdf.setFontSize(8)
              pdf.setTextColor(107, 114, 128) // Gray-500
              pdf.text(plotName, x + plotWidth / 2, plotY + displayHeight + textHeight, {
                align: "center",
                maxWidth: plotWidth,
              })
            }
          }
          // Update currentY to be after the last plot row
          const totalRows = Math.ceil(loadedImages.length / plotsPerRow)
          currentY = startYForCurrentRow + totalRows * (maxPlotHeight + textHeight + plotPaddingY) + 10 // Add extra padding
        } catch (error) {
          console.error("Error adding plots to PDF:", error)
          pdf.setFontSize(10)
          pdf.setTextColor(239, 68, 68) // Red
          pdf.text("Could not include visualizations due to technical limitations.", margin, currentY + 10)
          pdf.text("Please view them in the dashboard.", margin, currentY + 20)
          currentY += 30
        }
      }

      // --- 5. Top 10 User Queries Section ---
      if (top10Queries && top10Queries.length > 0) {
        pdf.addPage() // Always start on a new page for clarity
        currentY = margin

        pdf.setFontSize(14)
        pdf.setTextColor(55, 65, 81) // Gray-700
        pdf.text("Top 10 User Queries", margin, currentY)

        currentY += 10

        // Table header
        pdf.setFillColor(243, 244, 246) // Gray-100
        pdf.rect(margin, currentY, pdfWidth - margin * 2, 10, "F")

        pdf.setFontSize(10)
        pdf.setTextColor(55, 65, 81) // Gray-700
        pdf.text("Query", margin + 5, currentY + 7)
        pdf.text("Frequency", pdfWidth - margin - 25, currentY + 7) // Adjusted position

        currentY += 10

        const rowHeight = 8
        for (let i = 0; i < top10Queries.length; i++) {
          // If current row won't fit, add a new page
          if (currentY + rowHeight > pdfHeight - margin) {
            pdf.addPage()
            currentY = margin

            pdf.setFontSize(14)
            pdf.setTextColor(55, 65, 81) // Gray-700
            pdf.text("Top 10 User Queries (continued)", margin, currentY)

            currentY += 10

            pdf.setFillColor(243, 244, 246) // Gray-100
            pdf.rect(margin, currentY, pdfWidth - margin * 2, 10, "F")

            pdf.setFontSize(10)
            pdf.setTextColor(55, 65, 81) // Gray-700
            pdf.text("Query", margin + 5, currentY + 7)
            pdf.text("Frequency", pdfWidth - margin - 25, currentY + 7)

            currentY += 10
          }

          if (i % 2 === 0) {
            pdf.setFillColor(249, 250, 251) // Gray-50
            pdf.rect(margin, currentY, pdfWidth - margin * 2, rowHeight, "F")
          }

          pdf.setFontSize(9)
          pdf.setTextColor(55, 65, 81) // Gray-700

          const query = top10Queries[i].query
          const maxQueryLength = 60
          const displayQuery = query.length > maxQueryLength ? query.substring(0, maxQueryLength) + "..." : query

          pdf.text(displayQuery, margin + 5, currentY + 5.5)

          const frequency = top10Queries[i].frequency
          const frequencyText = `${frequency} ${frequency === 1 ? "time" : "times"}`

          pdf.text(frequencyText, pdfWidth - margin - 25, currentY + 5.5, { align: "right" })

          currentY += rowHeight
        }
        currentY += 10
      }

      // --- 6. Collected Leads Section ---
      if (leads && leads.length > 0) {
        pdf.addPage() // Always start on a new page for clarity
        currentY = margin

        pdf.setFontSize(14)
        pdf.setTextColor(55, 65, 81) // Gray-700
        pdf.text("Collected Leads", margin, currentY)

        currentY += 10

        // Table header
        pdf.setFillColor(243, 244, 246) // Gray-100
        pdf.rect(margin, currentY, pdfWidth - margin * 2, 10, "F")

        pdf.setFontSize(10)
        pdf.setTextColor(55, 65, 81) // Gray-700
        pdf.text("Email", margin + 5, currentY + 7)
        pdf.text("Phone", margin + (pdfWidth - margin * 2) / 2 - 10, currentY + 7) // Center phone
        pdf.text("Date", pdfWidth - margin - 20, currentY + 7) // Adjusted position

        currentY += 10

        const rowHeight = 8
        for (let i = 0; i < leads.length; i++) {
          // If current row won't fit, add a new page
          if (currentY + rowHeight > pdfHeight - margin) {
            pdf.addPage()
            currentY = margin

            pdf.setFontSize(14)
            pdf.setTextColor(55, 65, 81) // Gray-700
            pdf.text("Collected Leads (continued)", margin, currentY)

            currentY += 10

            pdf.setFillColor(243, 244, 246) // Gray-100
            pdf.rect(margin, currentY, pdfWidth - margin * 2, 10, "F")

            pdf.setFontSize(10)
            pdf.setTextColor(55, 65, 81) // Gray-700
            pdf.text("Email", margin + 5, currentY + 7)
            pdf.text("Phone", margin + (pdfWidth - margin * 2) / 2 - 10, currentY + 7)
            pdf.text("Date", pdfWidth - margin - 20, currentY + 7)

            currentY += 10
          }

          if (i % 2 === 0) {
            pdf.setFillColor(249, 250, 251) // Gray-50
            pdf.rect(margin, currentY, pdfWidth - margin * 2, rowHeight, "F")
          }

          pdf.setFontSize(9)
          pdf.setTextColor(55, 65, 81) // Gray-700

          const email = String(leads[i].email !== "000" ? leads[i].email : "N/A")
          const phone = String(leads[i].phone !== "000" ? leads[i].phone : "N/A")
          const date = String(new Date(leads[i].created_at).toLocaleDateString())

          pdf.text(email, margin + 5, currentY + 5.5)
          pdf.text(phone, margin + (pdfWidth - margin * 2) / 2 - 10, currentY + 5.5)
          pdf.text(date, pdfWidth - margin - 20, currentY + 5.5, { align: "right" })

          currentY += rowHeight
        }
        currentY += 10
      }

      // --- 7. Unanswered Queries Section ---
      if (unansweredQueries && unansweredQueries.length > 0) {
        pdf.addPage() // Always start on a new page for clarity
        currentY = margin

        pdf.setFontSize(14)
        pdf.setTextColor(55, 65, 81) // Gray-700
        pdf.text(`Unanswered Queries (${totalUnansweredCount} total)`, margin, currentY)

        currentY += 10

        // Table header
        pdf.setFillColor(243, 244, 246) // Gray-100
        pdf.rect(margin, currentY, pdfWidth - margin * 2, 10, "F")

        pdf.setFontSize(10)
        pdf.setTextColor(55, 65, 81) // Gray-700
        pdf.text("Query", margin + 5, currentY + 7)
        pdf.text("Frequency", pdfWidth - margin - 25, currentY + 7)

        currentY += 10

        const rowHeight = 8
        for (let i = 0; i < unansweredQueries.length; i++) {
          // If current row won't fit, add a new page
          if (currentY + rowHeight > pdfHeight - margin) {
            pdf.addPage()
            currentY = margin

            pdf.setFontSize(14)
            pdf.setTextColor(55, 65, 81) // Gray-700
            pdf.text(`Unanswered Queries (continued)`, margin, currentY)

            currentY += 10

            pdf.setFillColor(243, 244, 246) // Gray-100
            pdf.rect(margin, currentY, pdfWidth - margin * 2, 10, "F")

            pdf.setFontSize(10)
            pdf.setTextColor(55, 65, 81) // Gray-700
            pdf.text("Query", margin + 5, currentY + 7)
            pdf.text("Frequency", pdfWidth - margin - 25, currentY + 7)

            currentY += 10
          }

          if (i % 2 === 0) {
            pdf.setFillColor(249, 250, 251) // Gray-50
            pdf.rect(margin, currentY, pdfWidth - margin * 2, rowHeight, "F")
          }

          pdf.setFontSize(9)
          pdf.setTextColor(55, 65, 81) // Gray-700

          const query = unansweredQueries[i].query
          const maxQueryLength = 60
          const displayQuery = query.length > maxQueryLength ? query.substring(0, maxQueryLength) + "..." : query

          pdf.text(displayQuery, margin + 5, currentY + 5.5)

          const frequency = unansweredQueries[i].frequency
          const frequencyText = `${frequency} ${frequency === 1 ? "time" : "times"}`

          pdf.text(frequencyText, pdfWidth - margin - 25, currentY + 5.5, { align: "right" })

          currentY += rowHeight
        }
      }

      const pdfBlob = pdf.output("blob")
      resolve(pdfBlob)
    } catch (error) {
      console.error("Error in PDF generation:", error)
      const errorPdf = new jsPDF()
      errorPdf.setFontSize(16)
      errorPdf.setTextColor(220, 38, 38) // Red color
      errorPdf.text("Error generating report", 20, 20)
      errorPdf.setFontSize(12)
      errorPdf.setTextColor(0, 0, 0)
      errorPdf.text("Please try again later or contact support.", 20, 30)
      resolve(errorPdf.output("blob"))
    }
  })
}
