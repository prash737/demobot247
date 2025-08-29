import { InternalHero } from "@/app/components/internal-hero"
import { Footer } from "@/app/components/footer"

export default function CookiePolicyPage() {
  return (
    <>
      <InternalHero title="Cookie Policy" />
      <div className="container">
        <div className="text-center mb-8">
          <p>
            This Cookie Policy explains how Bot247.live uses cookies and similar technologies to recognize you when you
            visit our website. It explains what these technologies are and why we use them, as well as your rights to
            control our use of them.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">What are cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website.
            Cookies are widely used by website owners in order to make their websites work, or to work more efficiently,
            as well as to provide reporting information.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Why do we use cookies?</h2>
          <p>
            We use first-party and third-party cookies for several reasons. Some cookies are required for technical
            reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary"
            cookies. Other cookies enable us to track and target the interests of our users to enhance the experience on
            our website. Third parties serve cookies through our website for advertising, analytics, and other purposes.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">How can you control cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can set or amend your web browser
            controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though
            your access to some functionality and areas of our website may be restricted.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Changes to this Cookie Policy</h2>
          <p>
            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies
            we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy
            regularly to stay informed about our use of cookies and related technologies.
          </p>
          <p className="mt-8">Last Updated: July 1, 2023</p>
        </div>
      </div>
      <Footer />
    </>
  )
}
