import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useContext(AuthContext);
  
  const [productInfo, setProductInfo] = useState();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getSingleProduct();
  }, [id]);

  async function getSingleProduct() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
      const data = await response.json();
      setProductInfo(data);
    } catch (err) {
      console.error("Failed to fetch product:", err);
    }
  }

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const addToCart = async () => {
    if (!currentUser) {
      alert("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    if (!productInfo) return;

    setAdding(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser}`,
        },
        body: JSON.stringify({
          productId: productInfo._id,
          quantity: quantity,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Could not add to cart.");
      } else {
        alert(`${quantity} × ${productInfo.name} added to cart!`);
        // Optional: navigate to cart page
        // navigate("/cart");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  if (!productInfo) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex items-center justify-center bg-gray-100 rounded-xl p-6">
          <img
            src={productInfo.imageUrl}
            alt={productInfo.name}
            className="h-80 object-contain transition duration-300 hover:scale-105"
          />
        </div>

        <div className="flex flex-col justify-between">
          <h1 className="text-2xl font-bold text-gray-800 leading-snug">
            {productInfo.name}
          </h1>
          <p className="text-sm text-gray-500 mt-2 capitalize">
            Category: {productInfo.category}
          </p>
          <p className="text-3xl font-bold text-red-500 mt-4">
            ${productInfo.price}
          </p>
          <p className="text-gray-600 mt-4 leading-relaxed">
            {productInfo.description}
          </p>

          {/* Quantity selector */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={decreaseQty}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-red-500 hover:text-red-500 transition font-bold"
            >
              -
            </button>
            <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
            <button
              onClick={increaseQty}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-red-500 hover:text-red-500 transition font-bold"
            >
              +
            </button>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={addToCart}
              disabled={adding}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="border border-gray-300 hover:border-red-500 px-6 py-3 rounded-lg font-semibold transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;