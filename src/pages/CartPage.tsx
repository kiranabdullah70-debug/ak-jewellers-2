import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { CartItem } from "../types";

export default function CartPage({
  cart,
  removeFromCart,
  updateQuantity,
}: {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
}) {
  const navigate = useNavigate();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center flex flex-col items-center">
        <ShoppingCart size={64} className="text-neutral-300 mb-6" />
        <h1 className="text-3xl font-display font-bold text-neutral-900 mb-4">
          Your cart is empty
        </h1>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added any beautiful custom pieces to your cart yet.
        </p>
        <Link
          to="/"
          className="bg-neutral-900 text-white px-8 py-3 font-medium transition-colors hover:bg-black"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl font-display font-bold text-neutral-900 mb-10">
        Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3">
          <div className="border-t border-neutral-200">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="flex flex-col sm:flex-row gap-6 py-6 border-b border-neutral-200"
              >
                <Link to={`/product/${item.product.id}`} className="shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-32 h-32 object-cover bg-neutral-100"
                  />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="font-medium text-neutral-900 text-lg hover:underline"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex flex-col items-end shrink-0 ml-4">
                        {item.product.originalPrice > item.product.salePrice && (
                          <span className="text-sm text-neutral-400 line-through mb-0.5">
                            Rs. {item.product.originalPrice}
                          </span>
                        )}
                        <span className="font-bold text-neutral-900 text-lg">
                          Rs. {item.product.salePrice}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-500 mb-3">
                      Customization:{" "}
                      <span className="font-medium text-neutral-900">
                        {item.customization}
                      </span>
                    </p>
                    <div className="w-full bg-red-50 border border-red-100 py-1.5 mt-2 mb-3 text-center">
                      <p className="text-[#D32F2F] text-[11px] sm:text-xs font-bold">
                        🔥 Limited Time Offer - Valid for next 5 to 6 Days Only
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-neutral-300">
                      <button
                        onClick={() => updateQuantity(item.cartId, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 text-neutral-600 hover:bg-neutral-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm font-medium border-x border-neutral-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="px-3 py-1 text-neutral-600 hover:bg-neutral-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <Link
              to="/"
              className="text-neutral-600 hover:text-neutral-900 flex items-center gap-2 font-medium transition-colors w-fit"
            >
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-neutral-50 p-6 md:p-8 border border-neutral-200">
            <div className="bg-green-50/50 border border-green-100 p-4 mb-6 rounded-sm text-sm text-neutral-700 space-y-2">
              <div className="flex gap-2 items-center font-medium">
                <span className="text-green-600">✅</span> 5-7 Working Days Delivery
              </div>
              <div className="flex gap-2 items-center font-medium">
                <span className="text-green-600">✅</span> Rs. 200 Advance Only, Rest COD
              </div>
              <div className="flex gap-2 items-center font-medium">
                <span className="text-green-600">✅</span> WhatsApp Support: 0303 2111925
              </div>
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-6">
              Order Summary
            </h2>
            <div className="space-y-4 text-sm text-neutral-600 border-b border-neutral-200 pb-6 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span className="font-medium text-neutral-900">Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-neutral-900 mb-8">
              <span>Estimated Total</span>
              <span>Rs. {subtotal}</span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-[#111] hover:bg-black text-white hover:text-[#D4AF37] border border-[#111] hover:border-[#D4AF37] py-[14px] px-8 flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:-translate-y-0.5 text-[16px] font-medium uppercase rounded-[6px] shadow-sm"
              style={{ letterSpacing: "1.5px" }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
