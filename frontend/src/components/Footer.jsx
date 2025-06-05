import React from "react";

const Footer = () => {
  return (
    <div className="bg-gray-800 text-white py-4 text-center">
      © {new Date().getFullYear()} dark DSA. All rights reserved.
    </div>
  );
};

export default Footer;
