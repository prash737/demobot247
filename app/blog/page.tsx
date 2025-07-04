import { InternalHero } from "@/app/components/internal-hero"
import { Footer } from "@/app/components/footer"
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper"

const blogPosts = [
  {
    title: "The Future of AI in Business Operations",
    excerpt:
      "Explore how artificial intelligence is transforming the business landscape, from personalized client interactions to automated administrative tasks.",
    date: "2023-05-15",
    author: "Dr. Jane Smith",
  },
  {
    title: "Streamlining Client Onboarding: A Case Study",
    excerpt:
      "Learn how a leading organization improved its client onboarding efficiency by 40% using Bot247.live's AI-powered system.",
    date: "2023-06-02",
    author: "Mark Johnson",
  },
  {
    title: "The Importance of Multilingual Support in Global Business",
    excerpt:
      "Discover why offering support in multiple languages is crucial for organizations aiming to serve a global client base.",
    date: "2023-06-20",
    author: "Maria Rodriguez",
  },
]

export default function BlogPage() {
  return (
    <>
      <MarketingPageWrapper>
        <InternalHero title="Bot247.live Blog" />
        <div className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900">
          <div className="space-y-12">
            {blogPosts.map((post, index) => (
              <article key={index} className="border-b border-gray-200 dark:border-gray-700 pb-8">
                <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span>{post.date}</span> • <span>{post.author}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </MarketingPageWrapper>
      <Footer />
    </>
  )
}
