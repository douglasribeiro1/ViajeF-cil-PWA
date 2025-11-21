import React from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, icon, children, action, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">{icon}</div>}
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};
