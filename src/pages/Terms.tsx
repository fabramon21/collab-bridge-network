const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

        <p className="text-gray-800">
          InternConnect lets users share and find opportunities, housing, discussions, and peer connections.
          We do not verify every listing or user and we do not guarantee the accuracy, safety, or legitimacy
          of any posting, interaction, transaction, or arrangement. You use the platform at your own risk.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-4">Your Responsibilities</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-800">
          <li>Do your own due diligence before applying, meeting, paying, signing leases, or sharing personal info.</li>
          <li>We are not responsible for scams, fraud, property issues, lease disputes, injuries, or any losses.</li>
          <li>For in-person meetups or housing: meet in safe places, verify identities, and use written agreements.</li>
          <li>We do not screen roommates/hosts/peers; all arrangements are strictly between users.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-4">Content & Conduct</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-800">
          <li>Prohibited: fraudulent or misleading listings, harassment, discrimination, threats, spam, malware, scraping, or any illegal activity.</li>
          <li>We may remove content or suspend accounts at our discretion to keep the community safe.</li>
          <li>You grant us permission to host and display the content you submit (listings, messages, profiles).</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-4">Liability & Disputes</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-800">
          <li>Our liability is limited to the maximum extent permitted by law; no consequential or incidental damages.</li>
          <li>We are not a party to transactions or leases between users.</li>
          <li>Disputes may be subject to arbitration/venue as allowed by law.</li>
          <li>The service is provided “as is” and “as available” without warranties of any kind.</li>
          <li>You agree to indemnify and hold us harmless from claims arising from your use, content, or interactions.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-4">User Eligibility & Compliance</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-800">
          <li>You must be at least 16 years old (or older if required by your jurisdiction) to use the platform.</li>
          <li>You are responsible for complying with local laws for housing, employment, and online conduct.</li>
          <li>Do not share others’ personal data without consent; do not post confidential information.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-4">Content & Removal</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-800">
          <li>We may remove or edit content and suspend accounts for violations or risk to users.</li>
          <li>We may retain data for safety, audit, and legal compliance even after account closure.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-4">Third-Party Links & Services</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-800">
          <li>Links to external sites or tools are for convenience; we don’t endorse or control them.</li>
          <li>Any third-party terms and privacy policies apply when you use their services.</li>
        </ul>

        <p className="text-gray-800">
          Report suspicious activity via the in-app report button or email
          <a className="text-primary underline ml-1" href="mailto:contact@internconnect.example">contact@internconnect.example</a>.
        </p>
      </div>
    </div>
  );
};

export default Terms;
