import React from "react";

export const Button = ({ className, children, ...props }) => {
  return (
    <button className={`px-4 py-2 rounded text-white ${className}`} {...props}>
      {children}
    </button>
  );
};
