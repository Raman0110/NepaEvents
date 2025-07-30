import React from 'react'

export const Footer = () => {
  return (
      <footer className="bg-[#333333] text-white py-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-lg font-semibold mb-4">NepaEvents - 2025</p>
          <div className="flex justify-center gap-8 mb-6">
            <a href="#" className="hover:text-[#ED4A43]">About Us</a>
            <a href="#" className="hover:text-[#ED4A43]">Privacy Policy</a>
            <a href="#" className="hover:text-[#ED4A43]">Terms of Service</a>
          </div>
          <p className="text-sm">&copy; 2025 NepaEvents. All rights reserved.</p>
        </div>
      </footer>
    );
}
export default Footer;
