import React from "react";

export const AboutUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Header Section */}
        <h2 className="text-4xl font-extrabold text-[#ED4A43] mb-8">
          About NepaEvents
        </h2>

        {/* Mission Section */}
        <section className="mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2">
            <h3 className="text-3xl font-semibold text-gray-800 mb-4">Our Mission</h3>
            <p className="text-lg text-gray-600">
              At NepaEvents, our mission is to connect people with unforgettable experiences by providing a platform to discover and attend the best events in town. We believe in creating moments that bring people together and inspire joy.
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://i.pinimg.com/736x/65/d7/7d/65d77de5e9590a5e3f15b1947b363be7.jpg"
              alt="Our Mission"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2">
            <img
              src="https://i.pinimg.com/736x/44/8c/e7/448ce7eafc95e9c4acec6d5424b931cc.jpg"
              alt="Our Vision"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-3xl font-semibold text-gray-800 mb-4">Our Vision</h3>
            <p className="text-lg text-gray-600">
              Our vision is to become the leading event management platform in Nepal, providing a seamless experience for both event organizers and attendees. We aim to support diverse events, from concerts and workshops to exhibitions and conferences.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-[#ED4A43] text-white py-12 rounded-lg mb-16">
          <h3 className="text-3xl font-semibold mb-4">Contact Us</h3>
          <p className="text-lg mb-6">
            Have any questions or inquiries? Reach out to us, and we'd love to help you!
          </p>
          <a
            href="mailto:managemnetevent@gmail.com"
            className="inline-block bg-white text-[#ED4A43] px-6 py-3 rounded-md font-semibold"
          >
            Contact Us
          </a>
        </section>
      </div>
    </div>
  );
};
