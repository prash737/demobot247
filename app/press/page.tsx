import { InternalHero } from "@/app/components/internal-hero"
import { Footer } from "@/app/components/footer"
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper"

const pressReleases = [
  {
    title: "Bot247.live Raises $10 Million in Series A Funding",
    date: "2023-07-01",
    excerpt: "Funding will be used to expand AI capabilities and enter new markets.",
  },
  {
    title: "Bot247.live Partners with Leading Global Organizations",
    date: "2023-06-15",
    excerpt: "Strategic partnerships aim to revolutionize operational processes worldwide.",
  },
  {
    title: "Bot247.live Wins 'Best Business Tech Innovation' Award",
    date: "2023-05-30",
    excerpt: "Recognition for outstanding contribution to business technology.",
  },
]

export default function PressPage() {
  return (
    <>
      <MarketingPageWrapper>
        <InternalHero title="Press Releases" />
        <div className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900">
          <div className="space-y-12">
            {pressReleases.map((release, index) => (
              <article key={index} className="border-b border-gray-200 dark:border-gray-700 pb-8">
                <h2 className="text-2xl font-semibold mb-2">{release.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{release.excerpt}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400">{release.date}</div>
              </article>
            ))}
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Media Contact</h2>
            <p className="mb-2">For press inquiries, please contact:</p>
            <p className="font-semibold">Sarah Johnson</p>
            <p>Head of Communications</p>
            <p>Email: press@bot247.live</p>
            <p>Phone: +1 (555) 987-6543</p>
          </div>
        </div>
      </MarketingPageWrapper>
      <Footer />
    </>
  )
}
