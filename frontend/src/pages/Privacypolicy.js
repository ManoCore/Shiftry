import React from 'react';
import LandingNav from '../components/Landing-Nav.js';
import FooterLanding from '../components/FooterLanding.js';

const PrivacyPolicy = () => {
  return (
    <>
    <LandingNav/>
    <div className="font-inter bg-gray-50 py-4 px-4 sm:px-0 lg:px-0 min-h-screen">
      <div className="max-w-screen mx-auto bg-white p-0 md:p-10 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Shiftry Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8 text-center">Effective Date: July 1, 2025</p>

        <p className="mb-6 text-gray-700 leading-relaxed">
          This Privacy Policy describes how <strong>Manocore</strong> ("Manocore," "we," "us," or "our") collects, uses, processes, and shares personal information when you use our Shiftry workforce management software and services (the "Service").
        </p>
        <p className="mb-8 text-gray-700 leading-relaxed">
          We are committed to protecting your privacy and handling your personal information in a transparent and secure manner. By using the Shiftry Service, you agree to the collection and use of information in accordance with this policy.
        </p>

        {/* Section 1: Information We Collect */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">1. Information We Collect</h2>
        <p className="mb-4 text-gray-700">
          We collect various types of information to provide and improve our Service to you.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1. Information You Provide to Us</h3>
        <p className="mb-4 text-gray-700">
          When you register for an account, use the Service, or communicate with us, you may provide us with the following types of information:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 ml-4">
          <li><strong>Account Information:</strong> Your name, email address, password, organization name, job title, and other contact details.</li>
          <li><strong>Employee Data:</strong> If you are an Employer/Organization using Shiftry to manage your workforce, you will input personal information about your employees, such as their names, contact details (email, phone), job roles, employee IDs, work schedules, time-off requests, attendance records (clock-in/out times, locations if enabled), payroll-related data, and other HR-related information. <strong>You are responsible for ensuring you have the necessary consents and legal bases to provide this employee data to us.</strong></li>
          <li><strong>Communication Data:</strong> Information you provide when you contact our support team, provide feedback, or participate in surveys.</li>
          <li><strong>Billing Information:</strong> If applicable, payment card details or other billing information for subscription services.</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2. Information We Collect Automatically</h3>
        <p className="mb-4 text-gray-700">
          When you access and use the Service, we may automatically collect certain information:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700 ml-4">
          <li><strong>Usage Data:</strong> Information on how the Service is accessed and used ("Usage Data"). This may include your computer's Internet Protocol (IP) address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.</li>
          <li><strong>Device Information:</strong> Information about the device you use to access the Service, including hardware model, operating system and version, unique device identifiers, and mobile network information.</li>
          <li><strong>Location Information:</strong> With your consent, we may collect precise location information from your device if you use features requiring it (e.g., geo-fencing for attendance). You can enable or disable location services when you use our Service at any time, through your device settings.</li>
          <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies (like web beacons, pixels) to track activity on our Service and hold certain information.
            <ul className="list-circle list-inside ml-4 space-y-1 mt-1">
              <li><strong>Cookies:</strong> Small data files stored on your device.</li>
              <li><strong>Web Beacons/Pixels:</strong> Electronic files used to record information about how you browse the Service.</li>
            </ul>
            We use these for essential functions, performance, analytics, and personalization. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-800 mb-3">1.3. Information from Third Parties</h3>
        <p className="mb-8 text-gray-700">
          We may receive information about you from third-party services, such as single sign-on providers (e.g., Google, Microsoft) or other HR/payroll systems if you choose to integrate them with Shiftry. We will treat such information in accordance with this Privacy Policy.
        </p>

        {/* Section 2: How We Use Your Information */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">2. How We Use Your Information</h2>
        <p className="mb-4 text-gray-700">
          Manocore uses the collected information for various purposes:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-8 text-gray-700 ml-4">
          <li><strong>To Provide and Maintain the Service:</strong> To operate, deliver, and improve the functionalities of the Shiftry platform (e.g., enabling scheduling, tracking attendance, facilitating communication).</li>
          <li><strong>To Manage Your Account:</strong> To register you as a user, provide you with access to the Service, and manage your preferences.</li>
          <li><strong>To Improve and Personalize the Service:</strong> To understand how you and your organization use the Service, optimize its performance, develop new features, and tailor the user experience.</li>
          <li><strong>For Communication:</strong> To send you service-related notifications, updates, security alerts, and support messages. We may also send promotional communications, from which you can opt-out.</li>
          <li><strong>For Security and Fraud Prevention:</strong> To protect the security and integrity of the Service, detect and prevent fraud, unauthorized access, and other malicious activity.</li>
          <li><strong>For Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, and governmental requests.</li>
          <li><strong>For Analytics and Research:</strong> To perform data analysis, research, and statistical analysis to understand usage patterns and enhance our offerings.</li>
        </ul>

        {/* Section 3: How We Share Your Information */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">3. How We Share Your Information</h2>
        <p className="mb-4 text-gray-700">
          We may share your information in the following situations:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-8 text-gray-700 ml-4">
          <li><strong>Within Your Organization:</strong> Employee data entered by an Employer/Organization is accessible to authorized personnel within that same organization's Shiftry account, as defined by their roles and permissions set by the Employer/Organization.</li>
          <li><strong>With Service Providers:</strong> We may share your information with trusted third-party service providers who perform functions on our behalf, such as cloud hosting (e.g., AWS, Google Cloud), data analytics, payment processing, customer support, and email delivery. These providers are obligated to protect your information and use it only for the purposes for which it was disclosed.</li>
          <li><strong>Business Transfers:</strong> If Manocore is involved in a merger, acquisition, asset sale, or bankruptcy, your personal information may be transferred as a business asset. We will provide notice before your personal information is transferred and becomes subject to a different Privacy Policy.</li>
          <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency). This includes complying with applicable laws and regulations in India (e.g., as per the Digital Personal Data Protection Act, 2023, and other relevant statutes) and other jurisdictions.</li>
          <li><strong>To Protect Our Rights:</strong> We may disclose information when we believe it is necessary to protect the rights, property, or safety of Manocore, our users, or the public.</li>
          <li><strong>With Your Consent:</strong> We may share your personal information with your explicit consent or at your direction.</li>
          <li><strong>Affiliates:</strong> We may share information with Manocore's current or future affiliates, subsidiaries, or other companies under common control and ownership.</li>
        </ul>

        {/* Section 4: Data Security */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">4. Data Security</h2>
        <p className="mb-8 text-gray-700">
          We implement reasonable technical and organizational measures designed to protect your personal information from unauthorized access, use, alteration, and disclosure. These measures include data encryption, access controls, and secure server environments. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
        </p>

        {/* Section 5: Data Retention */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">5. Data Retention</h2>
        <p className="mb-8 text-gray-700">
          We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, typically for the duration of your active account with Shiftry and for a reasonable period thereafter to comply with our legal obligations, resolve disputes, and enforce our agreements. If you are an employee of an organization using Shiftry, your data retention period is primarily determined by your employer.
        </p>

        {/* Section 6: Your Data Rights */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">6. Your Data Rights</h2>
        <p className="mb-4 text-gray-700">
          Depending on your jurisdiction and the nature of the data, you may have the following rights regarding your personal information. We are committed to facilitating these rights in accordance with applicable laws, including Indian data protection principles:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-8 text-gray-700 ml-4">
          <li><strong>Right to Access:</strong> Request a copy of the personal information we hold about you.</li>
          <li><strong>Right to Rectification/Correction:</strong> Request correction of inaccurate or incomplete personal information.</li>
          <li><strong>Right to Erasure/Deletion ("Right to be Forgotten"):</strong> Request the deletion of your personal information, subject to certain exceptions (e.g., legal obligations).</li>
          <li><strong>Right to Restriction of Processing:</strong> Request that we restrict the processing of your personal information under certain conditions.</li>
          <li><strong>Right to Object to Processing:</strong> Object to our processing of your personal information under certain conditions.</li>
          <li><strong>Right to Data Portability:</strong> Request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          <li><strong>Right to Withdraw Consent:</strong> If we process your personal information based on your consent, you have the right to withdraw that consent at any time. This will not affect the lawfulness of processing before the withdrawal.</li>
        </ul>
        <p className="mb-8 text-gray-700">
          To exercise any of these rights, please contact us using the details in the "Contact Us" section below. We may require you to verify your identity before responding to such requests.
        </p>

        {/* Section 7: Children's Privacy */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">7. Children's Privacy</h2>
        <p className="mb-8 text-gray-700">
          Our Service is not intended for individuals under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Children have provided us with Personal Information, please contact us. If we become aware that we have collected Personal Information from Children without verification of parental consent, we take steps to remove that information from our servers.
        </p>

        {/* Section 8: International Data Transfers */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">8. International Data Transfers</h2>
        <p className="mb-8 text-gray-700">
          As Manocore operates globally (or may in the future), your information, including personal data, may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction. By using the Service, you consent to such transfers. We take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy.
        </p>

        {/* Section 9: Changes to This Privacy Policy */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">9. Changes to This Privacy Policy</h2>
        <p className="mb-8 text-gray-700">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. We may also notify you via email or through a prominent notice on our Service prior to the change becoming effective. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        {/* Section 10: Contact Us */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">10. Contact Us</h2>
        <p className="mb-4 text-gray-700">
          If you have any questions about this Privacy Policy, your data rights, or our data practices, please contact us:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          <li><strong>By email:</strong> <a href="mailto:[Your Contact Email]" className="text-blue-600 hover:underline">[Your Contact Email]</a></li>
          <li><strong>By visiting this page on our website:</strong> <a href="[Link to your Contact Us page URL]" className="text-blue-600 hover:underline">[Link to your Contact Us page URL]</a></li>
          <li><strong>By mail:</strong> [Your Company Address, if applicable]</li>
        </ul>
      </div>
    </div>
    <FooterLanding/>
    </>
  );
};

export default PrivacyPolicy;