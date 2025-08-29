import { InternalHero } from "@/app/components/internal-hero"
import { Footer } from "@/app/components/footer"

export default function TermsOfServicePage() {
  return (
    <>
      <InternalHero title="Terms of Service" />
      <div className="container">
        <div className="text-center mb-8">
          <p>
            Welcome to Bot247.live. By using our services, you agree to comply with and be bound by the following terms
            and conditions of use. Please review these terms carefully.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Acceptance of Terms</h2>
          <p>
            By accessing or using Bot247.live's services, you agree to these Terms of Service and all applicable laws
            and regulations. If you do not agree with any part of these terms, you may not use our services.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Use of Services</h2>
          <p>
            Our services are intended for use by organizations and their authorized representatives. You agree to use
            our services only for lawful purposes and in accordance with these Terms of Service.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">User Accounts</h2>
          <p>
            To access certain features of our services, you may be required to create an account. You are responsible
            for maintaining the confidentiality of your account information and for all activities that occur under your
            account.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Intellectual Property</h2>
          <p>
            The content, features, and functionality of Bot247.live's services are owned by Bot247.live and are
            protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Limitation of Liability</h2>
          <p>
            Bot247.live shall not be liable for any indirect, incidental, special, consequential, or punitive damages
            resulting from your use of or inability to use our services.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. We will notify users of any significant
            changes by posting a notice on our website.
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
