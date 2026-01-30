const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-lg p-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

        <p className="text-gray-800">
          We collect only what we need to run InternConnect: account details (name, email, university), listings and messages you post,
          and basic usage logs (device/browser info, IP) for security and performance. We use Supabase for authentication,
          database, and storage; your data is processed under their terms as our processor.
        </p>

        <ul className="list-disc pl-5 space-y-2 text-gray-800">
          <li>We do not sell personal data.</li>
          <li>We share data only with service providers needed to operate (e.g., Supabase, email provider).</li>
          <li>Listings and messages may be retained for safety/audit; you can request deletion of your account data.</li>
          <li>Cookies/local storage are used for session/auth and preferences.</li>
          <li>Report a privacy issue or request deletion at <a className="text-primary underline" href="mailto:privacy@internconnect.example">privacy@internconnect.example</a>.</li>
        </ul>

        <p className="text-gray-800">
          By using InternConnect, you consent to this policy. If you’re under 16, use the platform only with a parent/guardian’s consent.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
