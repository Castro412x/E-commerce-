import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";  // ← add useNavigate
import AuthContext from "../context/AuthContext";

function ProductsPage() {
  const currentUser = useContext(AuthContext);
  const navigate = useNavigate();  // ← initialize navigate

  const [productsData, setProductsData] = useState([]);
  const [quantities, setQuantities] = useState({});
  
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

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      console.log(data);
      setProductsData(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    if (!currentUser) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      console.log(currentUser);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/cart/add`,  
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentUser}`,
          },
          body: JSON.stringify({
            productId: productId,
            quantity: getQty(productId),
          }),
        }
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        alert(data.message || "Could not add to cart.");
        return;
      }


      navigate(`/products/${productId}`);
    } catch (error) {
      console.error(error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <h2 className="text-2xl font-bold text-gray-900">
          Products
        </h2>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

          {productsData.map((product) => (
            <div
              key={product._id}
              className="h-full flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-lg transition duration-300 overflow-hidden group"
            >
              <Link to={`/products/${product._id}`}>
                <div className="h-56 bg-gray-100 flex items-center justify-center p-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="flex flex-col flex-grow p-4">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px]">
                  {product.name}
                </h3>

                <p className="text-lg font-bold text-red-500 mt-2">
                  ${product.price.toFixed(2)}
                </p>

                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {product.description}
                </p>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => decrease(product._id)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-red-500 hover:text-red-500 transition font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">
                    {getQty(product._id)}
                  </span>
                  <button
                    onClick={() => increase(product._id)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-red-500 hover:text-red-500 transition font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="mt-auto pt-4">
                  <button
                    onClick={() => addToCart(product._id)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;