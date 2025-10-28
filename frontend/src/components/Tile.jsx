import React from 'react';

const Tile = ({ title, children, className = '', actions = null }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="overflow-auto max-h-96">
        {children}
      </div>
    </div>
  );
};

export default Tile;
