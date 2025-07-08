import React, { useState } from 'react'; // useState is needed for the currency slider
import LandingNav from '../components/Landing-Nav.js';
import FooterLanding from '../components/FooterLanding.js';

function PricingComponent() {
  const [selectedCurrency, setSelectedCurrency] = useState('GBP'); 

  const getFormattedPrice = (prices, currency) => {
    const price = prices[currency];
    if (price === undefined) return 'N/A'; 
    const numericPrice = parseFloat(price);

    switch (currency) {
      case 'USD':
        return `$${numericPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
      case 'INR':
        return `₹${numericPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      case 'GBP':
      default:
        return `£${numericPrice.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
  };
  const pricingPlans = [
    {
      title: '6-Months Plan', 
      prices: {
        GBP: '279',   
        USD: '299',   
        INR: '29999',
      },
      periodSuffix: '/mo',
      features: [
        'All features accessible',
        'Schedule',
        'Notify',
        '24/7 Customer Support',
      ],
      isHighlighted: false,
    },
    {
      title: 'Yearly Plan', 
      prices: {
        GBP: '3330',   
        USD: '3570',   
        INR: '350000', 
      },
      periodSuffix: '/yr',
      features: [
        'All features accessible',
        'Schedule',
        'Notify',
        '24/7 Customer Support',
      ],
      isHighlighted: true,
    },
  ];

  return (
    <>
      <LandingNav />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-inter">
        <div className="max-w-6xl mx-auto w-full pt-10 pb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Our Pricing Plans
          </h2>

          {/* Currency Selector - Re-introduced */}
          <div className="flex justify-center mb-10">
            <div className="relative inline-flex bg-white rounded-full p-1 shadow-inner">
              {['GBP', 'USD', 'INR'].map((currency) => (
                <button
                  key={currency}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    selectedCurrency === currency
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setSelectedCurrency(currency)}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-between
                  ${plan.isHighlighted ? 'border-4 border-blue-600' : ''}`}
              >
                {/* Card Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{plan.title}</h3>
                  <p className="text-5xl font-extrabold text-gray-900 flex items-baseline justify-center">
                    <span>
                      {getFormattedPrice(plan.prices, selectedCurrency)}
                    </span>
                    <span className="text-xl font-medium text-gray-600 ml-2">
                      {plan.periodSuffix}
                    </span>
                  </p>
                </div>

                {/* Features List */}
                <ul className="text-gray-700 mb-8 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <svg
                        className={`w-5 h-5 mr-2 flex-shrink-0 ${
                          feature.includes('Limited customer support') ? 'text-red-500' : 'text-blue-600'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >

                        {feature.includes('Limited customer support') ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        )}
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <div className="mt-auto">
                  <button
                    className={`w-full py-4 rounded-xl text-lg font-bold transition duration-300 ease-in-out
                      ${
                        plan.isHighlighted
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                      }`}
                  >
                    Choose Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FooterLanding />
    </>
  );
}

export default PricingComponent;