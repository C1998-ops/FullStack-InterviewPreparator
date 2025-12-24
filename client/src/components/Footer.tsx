import React from "react";
import footerData from "@/constants/footerdata";
import { Link } from "react-router";

const Footer: React.FC = () => {
  if (!footerData || footerData.length === 0) {
    return null;
  }

  return (
    <footer className="footer w-full">
      <div className="footer-content">
        {footerData.map((item, index) => (
            <div key={index} className="footer-section">
              <h4 className="text-xl font-bold">{item.title}</h4>
              <p className="text-sm">{item.developer}</p>
              <p className="text-sm">{item.description}</p>
              <div className="footer-links bg-gray-100 p-2 rounded-md w-auto max-w-fit gap-2 flex flex-wrap">
                {Object.entries(item.links).map(([key, value]) => (
                  <Link
                    to={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-900 hover:text-gray-300 hover:underline border border-gray-300 p-1 rounded-md"
                  >
                    {key}
                  </Link>
                ))}
              </div>
            </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>
          &copy; 2025 JavaScript Interview Prep Browser. Web app by Chetan Kumar
          GN
        </p>
      </div>
    </footer>
  );
};

export default Footer;
