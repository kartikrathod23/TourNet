import React from 'react';
import { CheckCircle } from 'lucide-react';

const FeatureCard = ({ title, description }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
      <CheckCircle className="text-blue-600 mb-2" size={28} />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
