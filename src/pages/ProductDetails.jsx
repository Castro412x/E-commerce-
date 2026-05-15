import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useContext(AuthContext);
  
  const [productInfo, setProductInfo] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  useEffect(() => {
    getSingleProduct();
  }, [id]);

  async function getSingleProduct() {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }
      
      const data = await response.json();
      setProductInfo(data);
    } catch (err) {
      console.error("Failed to fetch product:", err);
      // Fallback to sample product data
      const sampleProduct = getSampleProduct(id);
      if (sampleProduct) {
        setProductInfo(sampleProduct);
        showNotification("Using sample product data - API unavailable", "warning");
      } else {
        showNotification("Product not found", "error");
        setTimeout(() => navigate("/products"), 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  // Sample product data for fallback
  const getSampleProduct = (productId) => {
    const sampleProducts = {
      "sample1": {
        _id: "sample1",
        name: "Premium Wireless Headphones",
        price: 299.99,
        description: "High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium comfort. Perfect for travel and daily use.",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        category: "Electronics",
        stock: 15,
        rating: 4.5
      },
      "sample2": {
        _id: "sample2",
        name: "Smart Watch Pro",
        price: 399.99,
        description: "Advanced smartwatch with heart rate monitoring, GPS, fitness tracking, and 7-day battery life. Water resistant up to 50m.",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category: "Electronics",
        stock: 8,
        rating: 4.8
      },
      "sample3": {
        _id: "sample3",
        name: "Laptop Backpack",
        price: 79.99,
        description: "Water-resistant backpack with padded laptop compartment, USB charging port, and anti-theft design. Perfect for work and travel.",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        category: "Accessories",
        stock: 25,
        rating: 4.3
      },
      "sample4": {
        _id: "sample4",
        name: "Wireless Mouse",
        price: 49.99,
        description: "Ergonomic wireless mouse with adjustable DPI, silent clicks, and long battery life. Compatible with all devices.",
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        category: "Electronics",
        stock: 50,
        rating: 4.6
      }
    };

    // If the ID matches a sample product, return it
    if (sampleProducts[productId]) {
      return sampleProducts[productId];
    }
    
    // For any other ID, return a generic product
    return {
      _id: productId,
      name: "Premium Product",
      price: 99.99,
      description: "High-quality product with excellent features and durability. Satisfaction guaranteed.",
      imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500",
      category: "General",
      stock: 10,
      rating: 4.0
    };
  };

  const increaseQty = () => {
    if (productInfo && quantity < (productInfo.stock || 99)) {
      setQuantity(prev => prev + 1);
    } else {
      showNotification(`Only ${productInfo?.stock || 99} items available in stock`, "warning");
    }
  };
  
  const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  // Add to cart using localStorage
  const addToCart = () => {
    if (!currentUser) {
      showNotification("Please log in to add items to your cart", "error");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    
    if (!productInfo) return;

    setAdding(true);
    
    try {
      // Get existing cart for this user
      const cartKey = `cart_${currentUser}`;
      const existingCart = localStorage.getItem(cartKey);
      let cart = existingCart ? JSON.parse(existingCart) : [];

      // Check if product already exists in cart
      const existingItemIndex = cart.findIndex(item => 
        (item.product?._id === productInfo._id) || (item.productId === productInfo._id)
      );

      if (existingItemIndex !== -1) {
        // Update quantity if product exists
        const newQuantity = cart[existingItemIndex].quantity + quantity;
        
        // Check stock limit
        if (productInfo.stock && newQuantity > productInfo.stock) {
          showNotification(`Cannot add more than ${productInfo.stock} items (stock limit)`, "error");
          setAdding(false);
          return;
        }
        
        cart[existingItemIndex].quantity = newQuantity;
        showNotification(`Updated ${productInfo.name} quantity to ${newQuantity} in cart! 🛒`, "success");
      } else {
        // Check if enough stock
        if (productInfo.stock && quantity > productInfo.stock) {
          showNotification(`Only ${productInfo.stock} items available in stock`, "error");
          setAdding(false);
          return;
        }
        
        // Add new item
        cart.push({
          productId: productInfo._id,
          product: {
            _id: productInfo._id,
            name: productInfo.name,
            price: productInfo.price,
            imageUrl: productInfo.imageUrl,
            description: productInfo.description,
            category: productInfo.category
          },
          quantity: quantity,
          addedAt: new Date().toISOString()
        });
        showNotification(`${quantity} × ${productInfo.name} added to cart! 🛒`, "success");
      }

      // Save back to localStorage
      localStorage.setItem(cartKey, JSON.stringify(cart));
      
      // Store last added item for cart preview
      localStorage.setItem(`lastAdded_${currentUser}`, JSON.stringify({
        product: productInfo,
        quantity: quantity,
        timestamp: Date.now()
      }));

      console.log("Cart updated:", cart);
      
      // Reset quantity after adding
      setQuantity(1);
      
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("Failed to add item to cart", "error");
    } finally {
      setAdding(false);
    }
  };

  // Buy now - add to cart and go to cart page
  const buyNow = () => {
    addToCart();
    setTimeout(() => {
      navigate("/cart");
    }, 500);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!productInfo) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Product not found</p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
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

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/products")}
            className="text-gray-500 hover:text-red-500 transition flex items-center gap-1"
          >
            ← Back to Products
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
              <img
                src={productInfo.imageUrl || "https://via.placeholder.com/400x400?text=Product"}
                alt={productInfo.name}
                className="w-full max-h-96 object-contain transition duration-300 hover:scale-105"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x400?text=Product+Image";
                }}
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              {/* Category Badge */}
              {productInfo.category && (
                <div className="mb-2">
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {productInfo.category}
                  </span>
                </div>
              )}

              <h1 className="text-3xl font-bold text-gray-800 leading-tight">
                {productInfo.name}
              </h1>

              {/* Rating */}
              {productInfo.rating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-yellow-400">
                    {"★".repeat(Math.floor(productInfo.rating))}
                    {"☆".repeat(5 - Math.floor(productInfo.rating))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {productInfo.rating} / 5
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mt-4">
                <span className="text-4xl font-bold text-red-500">
                  ${(productInfo.price || 0).toFixed(2)}
                </span>
                {productInfo.oldPrice && (
                  <span className="ml-2 text-gray-400 line-through">
                    ${productInfo.oldPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-2">
                {productInfo.stock && productInfo.stock > 0 ? (
                  <span className="text-green-600 text-sm">
                    ✓ In Stock ({productInfo.stock} available)
                  </span>
                ) : (
                  <span className="text-red-600 text-sm">
                    ✗ Out of Stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {productInfo.description || "No description available for this product."}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decreaseQty}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-red-500 hover:text-red-500 transition font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQty}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-red-500 hover:text-red-500 transition font-bold text-lg"
                  >
                    +
                  </button>
                  {productInfo.stock && (
                    <span className="text-sm text-gray-500 ml-2">
                      Max {productInfo.stock} items
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={addToCart}
                  disabled={adding || (productInfo.stock === 0)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {adding ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding...
                    </span>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
                <button
                  onClick={buyNow}
                  disabled={productInfo.stock === 0}
                  className="flex-1 border-2 border-red-500 text-red-500 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>🚚</span>
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔄</span>
                    <span>30-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔒</span>
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Animation Styles */}
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
  );
}

export default ProductDetails;