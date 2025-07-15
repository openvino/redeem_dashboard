import React from "react";

const FormField = React.forwardRef(({ label, className = "", ...props }, ref) => (
  <div>
    <label className="block font-medium text-gray-700 mb-1">{label}</label>
    <input
      ref={ref}
      {...props}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#840C4A] ${className}`}
    />
  </div>
));

export default FormField;
