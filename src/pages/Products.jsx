import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function ProductsPage() {
  const currentUser = useContext(AuthContext);
  const navigate = useNavigate();

  const [productsData, setProductsData] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const getQty = (id) => quantities[id] || 1;

  const increase = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: getQty(id) + 1,
    }));
  };

  const decrease = (id) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, getQty(id) - 1),
    }));
  };

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Fetch products from your API (this part still needs the backend)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      console.log("Products fetched:", data);
      setProductsData(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback to sample data if API fails
      setProductsData(getSampleProducts());
      showNotification("Using sample products - API unavailable", "warning");
    } finally {
      setLoading(false);
    }
  };

  // Sample products for fallback (in case API is down)
  const getSampleProducts = () => {
    return [
      {
        _id: "sample1",
        name: "Premium Wireless Headphones",
        price: 299.99,
        description: "High-quality wireless headphones with noise cancellation",
        imageUrl: "https://via.placeholder.com/300x300?text=Headphones",
        category: "Electronics"
      },
      {
        _id: "sample2",
        name: "Smart Watch Pro",
        price: 399.99,
        description: "Fitness tracker with heart rate monitor and GPS",
        imageUrl: "https://via.placeholder.com/300x300?text=Smart+Watch",
        category: "Electronics"
      },
      {
        _id: "sample3",
        name: "Laptop Backpack",
        price: 79.99,
        description: "Water-resistant backpack with laptop compartment",
        imageUrl: "https://via.placeholder.com/300x300?text=Backpack",
        category: "Accessories"
      },
      {
        _id: "sample4",
        name: "Wireless Mouse",
        price: 49.99,
        description: "Ergonomic wireless mouse with long battery life",
        imageUrl: "https://via.placeholder.com/300x300?text=Mouse",
        category: "Electronics"
      }
    ];
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add to cart function - stores in localStorage
  const addToCart = (product, quantity) => {
    if (!currentUser) {
      showNotification("Please log in to add items to your cart", "error");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      // Get existing cart for this user
      const cartKey = `cart_${currentUser}`;
      const existingCart = localStorage.getItem(cartKey);
      let cart = existingCart ? JSON.parse(existingCart) : [];

      // Check if product already exists in cart
      const existingItemIndex = cart.findIndex(item => 
        (item.product?._id === product._id) || (item.productId === product._id)
      );

      if (existingItemIndex !== -1) {
        // Update quantity if product exists
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + quantity;
      } else {
        // Add new item
        cart.push({
          productId: product._id,
          product: {
            _id: product._id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            description: product.description
          },
          quantity: quantity,
          addedAt: new Date().toISOString()
        });
      }

      // Save back to localStorage
      localStorage.setItem(cartKey, JSON.stringify(cart));

      // Show success message
      showNotification(`${quantity} × ${product.name} added to cart! 🛒`, "success");

      // Optional: Also store the last added item for cart preview
      localStorage.setItem(`lastAdded_${currentUser}`, JSON.stringify({
        product: product,
        quantity: quantity,
        timestamp: Date.now()
      }));

      console.log("Cart updated:", cart);
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("Failed to add item to cart", "error");
    }
  };

  // Alternative: If you want to navigate to product page after adding
  const addToCartAndNavigate = (product, quantity) => {
    addToCart(product, quantity);
    // Optional: navigate to cart page instead of product page
    // navigate("/cart");
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 animate-slideInRight max-w-md ${
          notification.type === "error" ? "bg-red-500" : 
          notification.type === "warning" ? "bg-yellow-500" : "bg-green-500"
        } text-white px-6 py-3 rounded-lg shadow-lg`}>
          <div className="flex items-center gap-2">
            {notification.type === "success" && <span>✅</span>}
            {notification.type === "error" && <span>❌</span>}
            {notification.type === "warning" && <span>⚠️</span>}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Products</h2>
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-sm transition"
          >
            🛒 View Cart
            {(() => {
              const cartKey = currentUser ? `cart_${currentUser}` : null;
              const cart = cartKey ? JSON.parse(localStorage.getItem(cartKey) || "[]") : [];
              const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
              return totalItems > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {totalItems}
                </span>
              );
            })()}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsData.map((product) => (
            <div
              key={product._id}
              className="h-full flex flex-col bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
            >
              <Link to={`/products/${product._id}`}>
                <div className="h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 overflow-hidden">
                  <img
                    src={product.imageUrl || "https://via.placeholder.com/300x300?text=Product"}
                    alt={product.name}
                    className="h-full object-contain transition duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x300?text=Product";
                    }}
                  />
                </div>
              </Link>

              <div className="flex flex-col flex-grow p-4">
                <Link to={`/products/${product._id}`} className="hover:no-underline">
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] hover:text-red-500 transition">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-lg font-bold text-red-500 mt-2">
                  ${(product.price || 0).toFixed(2)}
                </p>

                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {product.description || "No description available"}
                </p>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => decrease(product._id)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:text-red-500 transition font-bold"
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">
                      {getQty(product._id)}
                    </span>
                    <button
                      onClick={() => increase(product._id)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:text-red-500 transition font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => addToCart(product, getQty(product._id))}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition transform hover:scale-105"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      addToCart(product, getQty(product._id));
                      navigate("/cart");
                    }}
                    className="w-full border-2 border-red-500 text-red-500 hover:bg-red-50 py-2 rounded-lg font-semibold transition text-sm"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add to Cart Animation Styles */}
        <style jsx>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slideInRight {
            animation: slideInRight 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}

export default ProductsPage;