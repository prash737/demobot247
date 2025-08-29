import { InternalHero } from "@/app/components/internal-hero"
import { Footer } from "@/app/components/footer"

export default function PrivacyPolicyPage() {
  return (
    <>
      <InternalHero title="Privacy Policy" />
      <div className="container">
        <div className="text-center mb-8">
          <p>
            At Bot247.live, we are committed to protecting your privacy and ensuring the security of your personal
            information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you
            use our services.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when you create an account, use our
            services, or communicate with us. This may include your name, email address, and other contact information.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve our services, to communicate with you,
            and to comply with legal obligations. We do not sell your personal information to third parties.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Data Security</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information. However, no
            method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee
            absolute security.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal information. If you have any questions about
            this Privacy Policy or our data practices, please contact us at privacy@bot247.live.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          <p className="mt-8">Last Updated: July 1, 2023</p>
        </div>
      </div>
      <Footer />
    </>
  )
}
