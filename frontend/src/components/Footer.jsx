import React from "react";

const Footer = () => {
  return (
    <div className="bg-gray-800 text-white py-4 text-center  w-full">
      <span className="text-md font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
        © {new Date().getFullYear()} dsa01
      </span>
    </div>
  );
};

export default Footer;
