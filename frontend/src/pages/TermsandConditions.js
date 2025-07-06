import React from 'react';
import LandingNav from '../components/Landing-Nav.js';
import FooterLanding from '../components/FooterLanding.js';

const TermsAndConditions = () => {
  return (
    <>
    <LandingNav/>
    <div className="font-inter bg-gray-50 py-4 px-0 sm:px-6 lg:px-0 min-h-screen">
      <div className="max-w-screen mx-auto bg-white p-8 md:p-10 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Shiftry Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8 text-center">Effective Date: July 1, 2025</p>

        <p className="mb-6 text-gray-700 leading-relaxed">
          Welcome to Shiftry! These Terms and Conditions ("Terms") govern your use of the Shiftry workforce management software and services (the "Service") provided by Manocore ("Manocore," "we," "us," or "our").
        </p>
        <p className="mb-8 text-gray-700 leading-relaxed">
          By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
        </p>

        {/* Section 1: Definitions */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">1. Definitions</h2>
        <ul className="list-disc list-inside space-y-2 mb-8 text-gray-700">
          <li><strong>Service:</strong> Refers to the Shiftry web and mobile applications, software, tools, features, and content provided by Manocore for workforce management, including but not limited to scheduling, attendance tracking, communication, and reporting.</li>
          <li><strong>User/You:</strong> Refers to any individual or entity that registers for an account or uses the Service, including administrators, managers, and employees.</li>
          <li><strong>Account:</strong> The user account created to access and use the Service.</li>
          <li><strong>Content:</strong> Any data, text, graphics, photos, or other materials uploaded, downloaded, or appearing on the Service.</li>
          <li><strong>Your Data:</strong> Any information, including personal data and employee data, that you or your authorized users submit, upload, or transmit to the Service.</li>
          <li><strong>Employer/Organization:</strong> The legal entity (e.g., company, business) that subscribes to the Shiftry Service and manages its workforce through the platform.</li>
        </ul>

        {/* Section 2: Acceptance of Terms */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">2. Acceptance of Terms</h2>
        <p className="mb-2 text-gray-700">
          2.1. By creating an Account, accessing, or using the Service, you signify your agreement to these Terms, our Privacy Policy, and any other policies referenced herein.
        </p>
        <p className="mb-8 text-gray-700">
          2.2. If you are using the Service on behalf of an Employer/Organization, you represent and warrant that you have the authority to bind that entity to these Terms, and "You" herein refers to that entity.
        </p>

        {/* Section 3: Account Registration and Security */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">3. Account Registration and Security</h2>
        <p className="mb-2 text-gray-700">
          3.1. To use certain features of the Service, you must register for an Account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
        </p>
        <p className="mb-2 text-gray-700">
          3.2. You are responsible for maintaining the confidentiality of your Account login credentials (username and password) and for all activities that occur under your Account.
        </p>
        <p className="mb-8 text-gray-700">
          3.3. You agree to notify Manocore immediately of any unauthorized use of your Account or any other breach of security. Manocore will not be liable for any loss or damage arising from your failure to comply with this Section.
        </p>

        {/* Section 4: Use of the Service */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">4. Use of the Service</h2>
        <p className="mb-2 text-gray-700">
          4.1. <strong>Permitted Use:</strong> The Service is intended for managing your workforce, including scheduling, time tracking, communication, and related administrative tasks. You agree to use the Service only for lawful purposes and in accordance with these Terms.
        </p>
        <p className="mb-2 text-gray-700">
          4.2. <strong>Prohibited Conduct:</strong> You agree not to:
        </p>
        <ul className="list-disc list-inside ml-4 space-y-1 mb-2 text-gray-700">
          <li>Use the Service for any illegal or unauthorized purpose.</li>
          <li>Upload or transmit any Content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of another's privacy, or otherwise objectionable.</li>
          <li>Interfere with or disrupt the integrity or performance of the Service or the data contained therein.</li>
          <li>Attempt to gain unauthorized access to the Service or its related systems or networks.</li>
          <li>Circumvent or disable any security or technological measure of the Service.</li>
          <li>Use any automated system (e.g., robots, spiders) to access the Service, except with Manocore's express written permission.</li>
          <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
          <li>Engage in any activity that could damage, disable, overburden, or impair any Manocore server, or the networks connected to any Manocore server.</li>
        </ul>
        <p className="mb-2 text-gray-700">
          4.3. <strong>Accuracy of Data:</strong> As an Employer/Organization, you are solely responsible for the accuracy, completeness, and legality of all Your Data, including employee information, schedules, and payroll data entered into the Service. Manocore is not responsible for errors or omissions in Your Data.
        </p>
        <p className="mb-8 text-gray-700">
          4.4. <strong>Compliance:</strong> You are responsible for ensuring that your use of the Service complies with all applicable local, state, national, and international laws, rules, and regulations, including but not limited to labor laws, wage and hour laws, and privacy laws (e.g., GDPR, CCPA, IT Act 2000 in India) relevant to your jurisdiction and your employees.
        </p>

        {/* Section 5: Intellectual Property Rights */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">5. Intellectual Property Rights</h2>
        <p className="mb-2 text-gray-700">
          5.1. <strong>Manocore's Intellectual Property:</strong> All rights, title, and interest in and to the Service (excluding Your Data), including all associated intellectual property rights (e.g., copyrights, trademarks, patents, trade secrets), are and will remain the exclusive property of Manocore and its licensors.
        </p>
        <p className="mb-2 text-gray-700">
          5.2. <strong>License to Use:</strong> Subject to your compliance with these Terms, Manocore grants you a limited, non-exclusive, non-transferable, non-sublicensable license to access and use the Service solely for your internal business operations.
        </p>
        <p className="mb-8 text-gray-700">
          5.3. <strong>Your Content:</strong> You retain all ownership rights to Your Data and any Content you submit or upload to the Service. By submitting Content, you grant Manocore a worldwide, non-exclusive, royalty-free, fully paid, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform Your Data solely for the purpose of providing and improving the Service.
        </p>

        {/* Section 6: Payments and Billing */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">6. Payments and Billing</h2>
        <p className="mb-2 text-gray-700">
          6.1. If the Service or any part thereof is offered on a subscription basis, you agree to pay all applicable fees and charges as described on our website or in your service agreement.
        </p>
        <p className="mb-2 text-gray-700">
          6.2. All fees are exclusive of applicable taxes, which you are responsible for paying.
        </p>
        <p className="mb-2 text-gray-700">
          6.3. Manocore reserves the right to change its pricing and billing methods at any time, with reasonable notice to you.
        </p>
        <p className="mb-8 text-gray-700">
          6.4. All payments are non-refundable unless otherwise expressly stated in your service agreement.
        </p>

        {/* Section 7: Data Privacy */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">7. Data Privacy</h2>
        <p className="mb-8 text-gray-700">
          Your privacy is important to us. Our collection and use of Your Data and other information are governed by our Privacy Policy, available at <a href="[Link to your Privacy Policy URL]" className="text-blue-600 hover:underline">[Link to your Privacy Policy URL]</a>. By using the Service, you consent to the data practices described in our Privacy Policy.
        </p>

        {/* Section 8: Third-Party Links and Services */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">8. Third-Party Links and Services</h2>
        <p className="mb-8 text-gray-700">
          The Service may contain links to third-party websites or services that are not owned or controlled by Manocore. Manocore has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that Manocore shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
        </p>

        {/* Section 9: Disclaimers */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">9. Disclaimers</h2>
        <p className="mb-8 text-gray-700">
          THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE. MANOCORE DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE; THAT DEFECTS WILL BE CORRECTED; OR THAT THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
        </p>

        {/* Section 10: Limitation of Liability */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">10. Limitation of Liability</h2>
        <p className="mb-2 text-gray-700">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MANOCORE, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICE.
        </p>
        <p className="mb-8 text-gray-700">
          IN NO EVENT SHALL MANOCORE'S CUMULATIVE AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICE EXCEED THE GREATER OF: (A) THE AMOUNTS PAID BY YOU TO MANOCORE FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM; OR (B) ONE HUNDRED U.S. DOLLARS ($100).
        </p>

        {/* Section 11: Indemnification */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">11. Indemnification</h2>
        <p className="mb-8 text-gray-700">
          You agree to defend, indemnify, and hold harmless Manocore and its affiliates, officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including but not limited to attorney's fees) arising from: (i) your use of and access to the Service; (ii) your violation of any term of these Terms; (iii) your violation of any third-party right, including without limitation any intellectual property or privacy right; or (iv) any claim that Your Data caused damage to a third party.
        </p>

        {/* Section 12: Termination */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">12. Termination</h2>
        <p className="mb-2 text-gray-700">
          12.1. Manocore may terminate or suspend your Account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
        <p className="mb-2 text-gray-700">
          12.2. Upon termination, your right to use the Service will immediately cease. If you wish to terminate your Account, you may simply discontinue using the Service or contact us at <a href="mailto:[Your Contact Email]" className="text-blue-600 hover:underline">[Your Contact Email]</a>.
        </p>
        <p className="mb-8 text-gray-700">
          12.3. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
        </p>

        {/* Section 13: Governing Law and Dispute Resolution */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">13. Governing Law and Dispute Resolution</h2>
        <p className="mb-2 text-gray-700">
          13.1. These Terms shall be governed and construed in accordance with the laws of [Your Country/State/Jurisdiction, e.g., India or the State of Telangana], without regard to its conflict of law provisions.
        </p>
        <p className="mb-8 text-gray-700">
          13.2. Any dispute, controversy, or claim arising out of or relating to these Terms or the breach, termination, or invalidity thereof, shall be exclusively settled by arbitration in accordance with the provisions of [Specify Arbitration Rules, e.g., the Arbitration and Conciliation Act, 1996, of India]. The seat of arbitration shall be [City, e.g., Hanamkonda, Telangana]. The language of the arbitration shall be English.
        </p>

        {/* Section 14: Changes to Terms */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">14. Changes to Terms</h2>
        <p className="mb-8 text-gray-700">
          Manocore reserves the right, at its sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </p>

        {/* Section 15: Miscellaneous */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">15. Miscellaneous</h2>
        <p className="mb-2 text-gray-700">
          15.1. <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Manocore regarding our Service and supersede and replace any prior agreements.
        </p>
        <p className="mb-2 text-gray-700">
          15.2. <strong>Waiver and Severability:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
        </p>
        <p className="mb-8 text-gray-700">
          15.3. <strong>Assignment:</strong> You may not assign or transfer your rights or obligations under these Terms without Manocore's prior written consent. Manocore may assign these Terms without restriction.
        </p>

        {/* Section 16: Contact Us */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">16. Contact Us</h2>
        <p className="mb-4 text-gray-700">
          If you have any questions about these Terms, please contact us:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
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

export default TermsAndConditions;