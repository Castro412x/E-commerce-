import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function Cart() {
  const currentUser = useContext(AuthContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, message: "" });

  // Load cart from localStorage when component mounts
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    loadCartFromLocalStorage();
  }, [currentUser]);

  const loadCartFromLocalStorage = () => {
    setLoading(true);
    try {
      const storedCart = localStorage.getItem(`cart_${currentUser}`);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
        console.log("Cart loaded from localStorage:", parsedCart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Error loading cart:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToLocalStorage = (items) => {
    try {
      localStorage.setItem(`cart_${currentUser}`, JSON.stringify(items));
      setCartItems(items);
    } catch (err) {
      console.error("Error saving cart:", err);
    }
  };

  const removeFromCart = (item) => {
    const productId = item.product?._id || item.productId;
    if (!productId) {
      alert("Cannot remove item: missing product identifier");
      return;
    }

    const confirmed = window.confirm("Remove this item from your cart?");
    if (!confirmed) return;

    const updatedCart = cartItems.filter(
      (cartItem) => (cartItem.product?._id || cartItem.productId) !== productId
    );
    
    saveCartToLocalStorage(updatedCart);
    
    // Show success message
    setModal({ open: true, message: "Item removed from cart! 🗑️" });
    setTimeout(() => setModal({ open: false, message: "" }), 1500);
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const confirmed = window.confirm("Proceed to checkout?");
    if (!confirmed) return;

    // Create order object
    const order = {
      id: Date.now().toString(),
      userId: currentUser,
      items: cartItems,
      total: cartTotal,
      shippingAddress: "Lagos, Nigeria",
      orderDate: new Date().toISOString(),
      status: "pending",
      orderNumber: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    // Save order to localStorage
    try {
      const existingOrders = localStorage.getItem(`orders_${currentUser}`);
      let orders = existingOrders ? JSON.parse(existingOrders) : [];
      orders.unshift(order); // Add new order at the beginning
      localStorage.setItem(`orders_${currentUser}`, JSON.stringify(orders));

      // Clear the cart
      localStorage.removeItem(`cart_${currentUser}`);
      setCartItems([]);

      console.log("Order placed:", order);
      setModal({ open: true, message: `Order placed successfully! 🎉\nOrder #${order.orderNumber}` });
      
      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        setModal({ open: false, message: "" });
        navigate("/orders");
      }, 2000);
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? item.price ?? 0;
    const qty = item.quantity ?? 1;
    return sum + price * qty;
  }, 0);

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(item);
      return;
    }

    const updatedCart = cartItems.map(cartItem => {
      const cartProductId = cartItem.product?._id || cartItem.productId;
      const itemProductId = item.product?._id || item.productId;
      
      if (cartProductId === itemProductId) {
        return { ...cartItem, quantity: newQuantity };
      }
      return cartItem;
    });
    
    saveCartToLocalStorage(updatedCart);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading your cart...</p>
        </div>
      </div>
    );
  }

  const validCartItems = cartItems.filter(item => {
    const hasProduct = item.product && item.product.name;
    const hasProductId = item.productId && item.name;
    return hasProduct || hasProductId;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
            <h2 className="text-3xl font-bold text-gray-900">
              Your Cart
            </h2>
            <p className="text-gray-500 mt-1">
              {validCartItems.length} {validCartItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Success Modal */}
          {modal.open && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4 transform animate-scaleUp">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-lg font-semibold text-gray-800 whitespace-pre-line">
                  {modal.message}
                </p>
                <div className="mt-4 w-16 h-1 bg-green-500 rounded-full mx-auto animate-pulse"></div>
              </div>
            </div>
          )}

          {validCartItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg">Your cart is empty.</p>
              <p className="text-gray-400 text-sm mt-2">Looks like you haven't added anything yet</p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {validCartItems.map((item) => {
                  const productName = item.product?.name || item.name;
                  const productPrice = item.product?.price ?? item.price ?? 0;
                  const productImage = item.product?.imageUrl || item.imageUrl || "/placeholder.png";
                  const productId = item.product?._id || item.productId;
                  const quantity = item.quantity ?? 1;
                  
                  return (
                    <div key={productId} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-28 h-28 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                          <img
                            src={productImage}
                            alt={productName}
                            className="h-24 object-contain"
                            onError={(e) => { e.target.src = "/placeholder.png"; }}
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-800 text-lg">{productName}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            ${productPrice.toFixed(2)} per item
                          </p>
                          
                          {/* Quantity controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              onClick={() => updateQuantity(item, quantity - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition"
                            >
                              -
                            </button>
                            <span className="font-medium w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(item, quantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900 text-xl">
                            ${(productPrice * quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item)}
                            className="mt-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-gray-50 px-6 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-gray-600">Subtotal</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${cartTotal.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Shipping calculated at checkout
                    </p>
                  </div>
                  
                  <button
                    onClick={placeOrder}
                    className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg w-full sm:w-auto"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleUp {
          animation: scaleUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Cart;