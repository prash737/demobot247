import { InternalHero } from "@/app/components/internal-hero"
import { Footer } from "@/app/components/footer"

export default function SecurityPage() {
  return (
    <>
      <InternalHero title="Security at Bot247.live" />
      <div className="container">
        <div className="text-center mb-8">
          <p>
            At Bot247.live, we take the security of your data and our systems very seriously. We employ
            industry-standard security measures to protect your information and ensure the integrity of our services.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Data Encryption</h2>
          <p>
            All data transmitted between your browser and our servers is encrypted using SSL/TLS protocols. This ensures
            that your information remains confidential and protected from interception.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Secure Infrastructure</h2>
          <p>
            Our systems are hosted in state-of-the-art data centers with multiple layers of physical and network
            security. We regularly update and patch our systems to protect against known vulnerabilities.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Access Control</h2>
          <p>
            We implement strict access controls to ensure that only authorized personnel can access sensitive data and
            systems. All access is logged and monitored for suspicious activity.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Regular Security Audits</h2>
          <p>
            We conduct regular security audits and penetration testing to identify and address potential vulnerabilities
            in our systems.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Data Backup and Recovery</h2>
          <p>
            We maintain regular backups of all critical data and have robust disaster recovery procedures in place to
            ensure business continuity in the event of any unforeseen circumstances.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Compliance</h2>
          <p>
            We comply with relevant data protection regulations and industry standards to ensure the highest level of
            security for our clients' data.
          </p>
          <p className="mt-8">
            If you have any questions or concerns about our security practices, please contact our security team at
            security@bot247.live.
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
