import React from "react";
import { Link } from "react-router-dom";

export function AboutUs() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-neutral-900 mb-6">About Us</h1>
      <div className="prose text-neutral-700">
        <p className="mb-4">
          Welcome to AK Jewellers. We are dedicated to providing you with the highest quality custom jewelry.
          Our mission is to craft beautiful, personalized pieces that tell your unique story.
        </p>
        <p className="mb-4">
          Based in Karachi, we serve customers all over Pakistan. Every piece is carefully crafted with
          attention to detail and made from premium materials.
        </p>
      </div>
    </div>
  );
}

export function ContactUs() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-neutral-900 mb-6">Contact Us</h1>
      <div className="prose text-neutral-700">
        <p className="mb-4">We'd love to hear from you. Get in touch with us using the details below:</p>
        <ul className="list-none space-y-2 mt-6">
          <li><strong>Phone/WhatsApp:</strong> 0303 2111925 / 0318 0686389</li>
          <li><strong>Email:</strong> kiranabdullah70@gmail.com</li>
          <li><strong>Location:</strong> Karachi, Pakistan (Serving Nationwide)</li>
        </ul>
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-neutral-900 mb-6">Privacy Policy</h1>
      <div className="prose text-neutral-700">
        <p className="mb-4">
          At AK Jewellers, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, and protect your personal information when you use our website.
        </p>
        <h2 className="text-xl font-bold mt-6 mb-2">Information We Collect</h2>
        <p className="mb-4">We collect information that you provide to us directly, such as when you place an order, including your name, address, phone number, and custom jewelry text.</p>
        <h2 className="text-xl font-bold mt-6 mb-2">How We Use Your Information</h2>
        <p className="mb-4">We use this information to process and fulfill your orders, communicate with you about your order, and improve our services.</p>
      </div>
    </div>
  );
}

export function RefundPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-neutral-900 mb-6">Refund & Exchange Policy</h1>
      <div className="prose text-neutral-700">
        <h2 className="text-xl font-bold mt-6 mb-2">7 Days Replacement Guarantee</h2>
        <p className="mb-4">
          At AK Jewellers, your satisfaction is our priority. If you receive a damaged item, the wrong product, or an incorrect spelling compared to your order, we offer a free 7-day replacement guarantee. We will remake the item and send it to you at no extra cost.
        </p>
        <h2 className="text-xl font-bold mt-6 mb-2">Custom Jewelry Refunds</h2>
        <p className="mb-4">
          Because our products are custom-made specifically for you, we cannot offer cash refunds or exchanges if you change your mind. Once production begins, the custom item holds no resale value.
        </p>
        <h2 className="text-xl font-bold mt-6 mb-2">How to Request a Replacement</h2>
        <p className="mb-4">
          Please contact our support team on WhatsApp at <strong>0303 2111925</strong> within 7 days of receiving your parcel. Share clear photos or videos of the issue along with your Order ID, and we will guide you through the replacement process.
        </p>
      </div>
    </div>
  );
}

export function TermsConditions() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-neutral-900 mb-6">Terms and Conditions</h1>
      <div className="prose text-neutral-700">
        <p className="mb-4">
          By accessing or using the AK Jewellers website, you agree to be bound by these Terms and Conditions.
        </p>
        <h2 className="text-xl font-bold mt-6 mb-2">Custom Orders</h2>
        <p className="mb-4">All custom jewelry orders require an advance payment. Please ensure spelling for custom names is correct before placing an order, as custom items cannot be refunded or exchanged due to spelling errors provided by the customer.</p>
        <h2 className="text-xl font-bold mt-6 mb-2">Shipping & Delivery</h2>
        <p className="mb-4">We deliver across Pakistan. Delivery times may vary based on your location and the complexity of the custom piece.</p>
      </div>
    </div>
  );
}
