import { InternalHero } from "@/app/components/internal-hero"
import { Footer } from "@/app/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper"

const jobOpenings = [
  { title: "AI Engineer", department: "Engineering" },
  { title: "UX Designer", department: "Design" },
  { title: "Sales Representative", department: "Sales" },
  { title: "Customer Success Manager", department: "Customer Support" },
]

export default function CareersPage() {
  return (
    <>
      <MarketingPageWrapper>
        <InternalHero title="Careers at Bot247.live" />
        <div className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900">
          <p className="text-lg mb-8">
            Join our team and help shape the future of AI-powered operational support systems. We're always looking for
            talented individuals who are passionate about business operations and technology.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Current Openings</h2>
          <ul className="space-y-4 mb-8">
            {jobOpenings.map((job, index) => (
              <li key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{job.department}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Why Work With Us?</h2>
            <ul className="list-disc list-inside space-y-2 mb-8">
              <li>Opportunity to work with cutting-edge AI technology</li>
              <li>Flexible work environment and remote-friendly culture</li>
              <li>Competitive salary and benefits package</li>
              <li>Professional development and growth opportunities</li>
              <li>Chance to make a real impact in the business operations sector</li>
            </ul>
          </div>
          <div>
            <Link href="/contact">
              <Button>Contact Us for More Information</Button>
            </Link>
          </div>
        </div>
      </MarketingPageWrapper>
      <Footer />
    </>
  )
}
