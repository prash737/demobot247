import { InternalHero } from "@/app/components/internal-hero"
import { Footer } from "@/app/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { MarketingPageWrapper } from "@/app/components/marketing-page-wrapper"

export default function AboutPage() {
  return (
    <>
      <MarketingPageWrapper>
        <InternalHero title="About Bot247.live" />
        <div className="container">
          <div className="text-center">
            <p>
              Bot247.live is a pioneering force in the field of AI-powered inquiry handling systems. Our mission is to
              revolutionize how organizations handle their operational processes, making them more efficient,
              accessible, and client-friendly.
            </p>
            <p>
              Founded in 2023, our team of experienced domain experts, technologists, and AI specialists came together
              with a shared vision: to create a solution that addresses the complex challenges faced by operational
              departments worldwide.
            </p>
            <p>
              We believe that by leveraging cutting-edge AI technology, we can not only streamline administrative tasks
              but also provide a more personalized and responsive experience for prospective clients. Our system is
              designed to handle queries 24/7, in multiple languages, ensuring that no user is left behind due to time
              zone differences or language barriers.
            </p>
            <p>
              At Bot247.live, we're committed to continuous innovation. We regularly update our AI models with the
              latest advancements in natural language processing and machine learning, ensuring that our clients always
              have access to the most sophisticated tools available.
            </p>
            <p>
              Our dedication to excellence has made us a trusted partner for organizations across the globe. We're proud
              to be playing a part in shaping the future of business operations by making the inquiry process smoother,
              fairer, and more efficient for all.
            </p>
          </div>

          {/* Team Section */}
          <div className="mt-20 mb-8">
            <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>

            {/* Leadership */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold text-center mb-8">Leadership</h3>
              <div className="flex justify-center">
                <div className="text-center max-w-sm">
                  <div className="relative mx-auto w-48 h-48 mb-6 overflow-hidden rounded-full">
                    <Image src="/images/team/niladri.jpeg" alt="Niladri Roy" fill className="object-cover" />
                  </div>
                  <h4 className="text-xl font-bold">Niladri Roy</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Chief Executive Officer</p>
                </div>
              </div>
            </div>

            {/* Development Team */}
            <div>
              <h3 className="text-2xl font-semibold text-center mb-8">Development Team</h3>
              <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="relative mx-auto w-48 h-48 mb-6 overflow-hidden rounded-full">
                    <Image src="/images/team/prashant.png" alt="Prashant Dubey" fill className="object-cover" />
                  </div>
                  <h4 className="text-xl font-bold">Prashant Dubey</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Developer</p>
                </div>

                <div className="text-center">
                  <div className="relative mx-auto w-48 h-48 mb-6 overflow-hidden rounded-full">
                    <Image src="/images/team/vanshaj.png" alt="Vanshaj Awasthi" fill className="object-cover" />
                  </div>
                  <h4 className="text-xl font-bold">Vanshaj Awasthi</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Developer</p>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="mt-16 text-center">
            <Link href="/contact">
              <Button>Contact Us</Button>
            </Link>
          </div> */}
        </div>
      </MarketingPageWrapper>
      <Footer />
    </>
  )
}
