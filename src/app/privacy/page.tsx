import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1a1a1a] to-[#121212] text-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <div className="prose prose-invert">
          <p>
            This is a placeholder for the privacy policy.
          </p>
          <p>
            This application is a personal project and is not intended for commercial use.
            We do not store any of your personal data. All data is fetched from the Spotify API
            and is only stored in your browser session.
          </p>
          <p>
            For more information, please contact the developer.
          </p>
        </div>
      </div>
    </div>
  );
}
