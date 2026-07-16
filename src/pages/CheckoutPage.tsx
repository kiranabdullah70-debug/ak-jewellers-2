import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { CartItem } from "../types";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, runTransaction } from "firebase/firestore";

export default function CheckoutPage({
  cart,
  clearCart,
}: {
  cart: CartItem[];
  clearCart: () => void;
}) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    email: "",
    emailOffers: true,
    country: "Pakistan",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "Karachi",
    postalCode: "",
    phone: "",
    saveInfo: false,
    paymentMethod: "COD"
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );
  const shipping =
    subtotal >= 5000 ? 0 : checkoutForm.city === "Karachi" ? 250 : 300;
  const total = subtotal + shipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const counterRef = doc(db, "counters", "orders");
      const orderIdStr = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let newNum = 1;
        if (counterDoc.exists()) {
          newNum = (counterDoc.data().lastNumber || 0) + 1;
        }
        transaction.set(counterRef, { lastNumber: newNum }, { merge: true });
        
        const formattedNum = newNum.toString().padStart(7, "0");
        const generatedId = `AKJ${formattedNum}`;
        
        const orderRef = doc(db, "orders", generatedId);
        
        const orderData = {
          customerInfo: {
            name: `${checkoutForm.firstName} ${checkoutForm.lastName}`.trim(),
            phone: checkoutForm.phone,
            email: checkoutForm.email,
            address: `${checkoutForm.address}${checkoutForm.apartment ? ', ' + checkoutForm.apartment : ''}`,
            city: checkoutForm.city,
            paymentMethod: checkoutForm.paymentMethod,
          },
          items: cart.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.salePrice,
            quantity: item.quantity,
            customization: item.customization,
            image: item.product.image,
          })),
          subtotal,
          shipping,
          total,
          status: "pending",
          createdAt: serverTimestamp(),
        };

        transaction.set(orderRef, orderData);
        return generatedId;
      });
      
      const stored = JSON.parse(localStorage.getItem("my_orders") || "[]");
      stored.push(orderIdStr);
      localStorage.setItem("my_orders", JSON.stringify(stored));

      // Add standard format for "Trigger Email" Firebase Extension
      try {
        await addDoc(collection(db, "mail"), {
          to: checkoutForm.email,
          message: {
            subject: `Order Confirmation - AK Jewellers #${orderIdStr}`,
            html: `
              <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
                <h2>Thank you for your order, ${checkoutForm.firstName}!</h2>
                <p>Your order <strong>#${orderIdStr}</strong> has been successfully placed.</p>
                <p><strong>Total Bill:</strong> Rs. ${total}</p>
                <br/>
                <h3>Order Details:</h3>
                <ul>
                  ${cart.map(item => `<li>${item.quantity}x ${item.product.name} (Customization: ${item.customization}) - Rs. ${item.product.salePrice}</li>`).join('')}
                </ul>
                <br/>
                <p>We will start crafting your items right away. Making and delivery usually takes 5-7 working days.</p>
                <p>If you have any questions, you can reply to this email or contact us on WhatsApp.</p>
                <p>Regards,<br/><strong>AK Jewellers</strong></p>
              </div>
            `,
          }
        });
      } catch (mailError) {
        console.error("Error queueing email", mailError);
        // We don't fail the order if email queueing fails
      }
      
      clearCart();
      navigate(`/success?orderId=${orderIdStr}`);
    } catch (error) {
      console.error("Error creating order: ", error);
      alert("There was an error placing your order. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty.</h1>
        <button onClick={() => navigate("/")} className="text-blue-600 underline">Go back to shop</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* Left Side: Checkout Form */}
        <div className="w-full lg:w-3/5">
          
          <h1 className="text-2xl font-display font-bold text-neutral-900 mb-8">
            AK Jewellers
          </h1>

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-bold text-neutral-900">Contact</h2>
            <Link to="/cart" className="text-blue-600 hover:underline text-sm transition-colors">
              Log in
            </Link>
          </div>

          <form id="checkoutForm" onSubmit={handleCheckout} className="space-y-6">
            
            <div className="space-y-4">
              <input
                type="text"
                value={checkoutForm.email}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                className="w-full border border-neutral-300 px-4 py-3 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-500"
                placeholder="Email or mobile phone number"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkoutForm.emailOffers}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, emailOffers: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                />
                <span className="text-sm text-neutral-700">Email me with news and offers</span>
              </label>
            </div>

            <div className="pt-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Delivery</h2>
              <div className="space-y-4">
                <div>
                  <select
                    value={checkoutForm.country}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, country: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-all text-neutral-700"
                  >
                    <option value="Pakistan">Pakistan</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    required
                    type="text"
                    value={checkoutForm.firstName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, firstName: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-500"
                    placeholder="First name"
                  />
                  <input
                    required
                    type="text"
                    value={checkoutForm.lastName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, lastName: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-500"
                    placeholder="Last name"
                  />
                </div>

                <input
                  required
                  type="text"
                  value={checkoutForm.address}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                  className="w-full border border-neutral-300 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-500"
                  placeholder="Address"
                />

                <input
                  type="text"
                  value={checkoutForm.apartment}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, apartment: e.target.value })}
                  className="w-full border border-neutral-300 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-500"
                  placeholder="Apartment, suite, etc. (optional)"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={checkoutForm.city}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-all text-neutral-700"
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Other">Other City</option>
                  </select>
                  <input
                    type="text"
                    value={checkoutForm.postalCode}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, postalCode: e.target.value })}
                    className="w-full border border-neutral-300 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-500"
                    placeholder="Postal code (optional)"
                  />
                </div>

                <input
                  required
                  type="tel"
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                  className="w-full border border-neutral-300 rounded-md px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-500"
                  placeholder="Phone"
                />

                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={checkoutForm.saveInfo}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, saveInfo: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-neutral-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700">Save this information for next time</span>
                </label>
              </div>
            </div>

            <div className="pt-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Shipping method</h2>
              <div className="border border-blue-500 rounded-md p-4 bg-blue-50/30 flex justify-between items-center">
                <span className="text-sm text-neutral-700">Standard Shipping</span>
                <span className="text-sm font-bold text-neutral-900">Rs. {shipping}</span>
              </div>
            </div>

            <div className="pt-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-2">Payment</h2>
              <p className="text-sm text-neutral-500 mb-4">All transactions are secure and encrypted.</p>
              
              <div className="border border-neutral-300 rounded-md overflow-hidden">
                
                {/* Cash on Delivery */}
                <label className={`flex items-center gap-3 p-4 border-b border-neutral-300 cursor-pointer transition-colors ${checkoutForm.paymentMethod === 'COD' ? 'bg-blue-50/30' : 'bg-white'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={checkoutForm.paymentMethod === 'COD'}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-neutral-900">Cash on Delivery (COD)</span>
                </label>
                {checkoutForm.paymentMethod === 'COD' && (
                  <div className="bg-neutral-50 p-4 border-b border-neutral-300 text-sm text-neutral-600 flex flex-col items-center text-center">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-neutral-400 mb-3" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                    <p>Pay with cash upon delivery.</p>
                  </div>
                )}

                {/* Credit Card */}
                <label className={`flex items-center justify-between p-4 border-b border-neutral-300 cursor-pointer transition-colors ${checkoutForm.paymentMethod === 'CARD' ? 'bg-blue-50/30' : 'bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={checkoutForm.paymentMethod === 'CARD'}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-neutral-900">Credit Card</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="bg-white border border-neutral-200 px-1 py-0.5 rounded text-[10px] font-bold text-[#1A1F71] shadow-sm flex items-center justify-center w-8">VISA</div>
                    <div className="bg-white border border-neutral-200 px-1 py-0.5 rounded text-[10px] font-bold text-[#EB001B] shadow-sm flex items-center justify-center w-8">MC</div>
                  </div>
                </label>
                {checkoutForm.paymentMethod === 'CARD' && (
                  <div className="bg-neutral-50 p-6 border-b border-neutral-300 text-sm text-neutral-600 flex flex-col items-center text-center">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-neutral-400 mb-3" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                    <p>After clicking "Place order", you will be redirected to securely complete your purchase.</p>
                  </div>
                )}

                {/* Bank Deposit */}
                <label className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${checkoutForm.paymentMethod === 'BANK' ? 'bg-blue-50/30' : 'bg-white'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK"
                    checked={checkoutForm.paymentMethod === 'BANK'}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-neutral-900">Bank Deposit</span>
                </label>
                {checkoutForm.paymentMethod === 'BANK' && (
                  <div className="bg-neutral-50 p-6 text-sm text-neutral-700 border-t border-neutral-300">
                    <div className="space-y-2 max-w-sm mx-auto">
                      <div className="flex justify-between border-b border-neutral-200 pb-2">
                        <span className="text-neutral-500">Bank:</span>
                        <span className="font-bold">Meezan Bank</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200 pb-2">
                        <span className="text-neutral-500">Account Title:</span>
                        <span className="font-bold">AK Jewellers</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200 pb-2">
                        <span className="text-neutral-500">Account Number:</span>
                        <span className="font-bold">0101 2345 6789</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-neutral-500">IBAN:</span>
                        <span className="font-bold text-[11px] sm:text-sm">PK35 MEZN 0101 2345 6789</span>
                      </div>
                      <div className="mt-4 bg-blue-50 p-3 rounded text-blue-800 text-xs sm:text-sm border border-blue-100 flex items-start gap-2">
                         <span className="text-lg">📱</span>
                         <p>Note: Payment ki slip WhatsApp <strong>0303-2111925</strong> par send karein with your Order ID.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              <h2 className="text-lg font-bold text-neutral-900 mb-2">Billing address</h2>
              <div className="border border-blue-500 rounded-md bg-blue-50/30 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={true}
                    readOnly
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-neutral-900">Same as shipping address</span>
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#111] hover:bg-black text-white hover:text-[#D4AF37] border border-[#111] hover:border-[#D4AF37] py-[14px] px-8 font-medium text-[16px] flex items-center justify-center transition-all duration-300 ease-in-out hover:-translate-y-0.5 rounded-[6px] uppercase disabled:opacity-70 shadow-sm"
                style={{ letterSpacing: "1.5px" }}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
            </div>
            
            <div className="pt-8 border-t border-neutral-200 flex justify-center gap-4 text-neutral-400">
               <Link to="/refund-policy" target="_blank" className="text-xs hover:text-neutral-700 hover:underline">Refund policy</Link>
               <Link to="/privacy" target="_blank" className="text-xs hover:text-neutral-700 hover:underline">Privacy policy</Link>
               <Link to="/terms" target="_blank" className="text-xs hover:text-neutral-700 hover:underline">Terms of service</Link>
            </div>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full lg:w-2/5">
          <div className="bg-neutral-50 border border-neutral-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-neutral-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.cartId} className="flex gap-4">
                  <div className="relative">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover border border-neutral-200 bg-white"
                    />
                    <span className="absolute -top-2 -right-2 bg-neutral-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-medium text-neutral-900 text-sm truncate">{item.product.name}</h4>
                    <p className="text-xs text-neutral-500 truncate">{item.customization}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Rs. {item.product.salePrice * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm text-neutral-600 border-t border-neutral-200 pt-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `Rs. ${shipping}`}</span>
              </div>
            </div>
            
            <div className="flex justify-between text-lg font-bold text-neutral-900 mt-6 border-t border-neutral-200 pt-6">
              <span>Total</span>
              <span>Rs. {total}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
