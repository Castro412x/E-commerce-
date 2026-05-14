import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Cart() {
  const currentUser = useContext(AuthContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, message: "" });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [currentUser]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${currentUser}` },
      });
      const data = await response.json();
      console.log("Raw cart API response:", data);

      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data.items && Array.isArray(data.items)) {
        items = data.items;
      } else if (data.cart && Array.isArray(data.cart)) {
        items = data.cart;
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data;
      } else {
        console.warn("Unexpected cart response format:", data);
        items = [];
      }

      const normalizedItems = items.map(item => ({
        ...item,
        product: item.product || item.productId || null,
        _id: item._id || item.id,
      }));

      setCartItems(normalizedItems);
    } catch (err) {
      console.error("fetchCart error:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed: use product ID instead of cart item ID
  const removeFromCart = async (item) => {
    const productId = item.product?._id || item.productId;
    if (!productId) {
      alert("Cannot remove item: missing product identifier");
      return;
    }

    const confirmed = window.confirm("Remove this item from your cart?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cart/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Delete failed:", response.status, errorData);
        alert(errorData.message || "Could not remove item. Please try again.");
        return;
      }
      fetchCart(); // refresh cart
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    const confirmed = window.confirm("Proceed to checkout?");
    if (!confirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser}`,
        },
        body: JSON.stringify({ shippingAddress: "Lagos, Nigeria" }),
      });
      if (!response.ok) {
        alert("Could not place order. Please try again.");
        return;
      }
      const data = await response.json();
      console.log("Order placed:", data);
      setModal({ open: true, message: "Order placed successfully! 🎉" });
      setTimeout(() => navigate("/orders"), 2000);
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    const qty = item.quantity ?? 0;
    return sum + price * qty;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading your cart...</p>
      </div>
    );
  }

  const validCartItems = cartItems.filter(item => item.product && item.product.name);

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Your Cart
        </h2>

        {modal.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm mx-4">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-lg font-semibold text-gray-800">{modal.message}</p>
              <p className="text-sm text-gray-500 mt-1">Redirecting to your orders...</p>
            </div>
          </div>
        )}

        {validCartItems.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-lg">Your cart is empty.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-6">
              {validCartItems.map((item) => (
                <div key={item._id} className="flex gap-6 items-center border-b pb-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.product?.imageUrl || "/placeholder.png"}
                      alt={item.product?.name}
                      className="h-20 object-contain"
                      onError={(e) => { e.target.src = "/placeholder.png"; }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800">{item.product?.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ${(item.product?.price ?? 0).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">
                      ${((item.product?.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item)}  // ✅ pass whole item
                      className="mt-2 text-sm text-red-500 border border-red-300 hover:bg-red-50 px-3 py-1 rounded-lg transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
              <p className="text-lg font-bold text-gray-900">
                Total: <span className="text-red-500">${cartTotal.toFixed(2)}</span>
              </p>
              <button
                onClick={placeOrder}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;