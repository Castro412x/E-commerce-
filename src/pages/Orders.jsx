import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
 
function Orders() {
  const currentUser = useContext(AuthContext); // JWT token or null
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
 
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [currentUser]);
 
  
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${currentUser}`,
        },
      });
 
      const data = await response.json();
      console.log("Orders data:", data); // ← check shape in DevTools
      setOrders(data);
    } catch (err) {
      console.error("fetchOrders error:", err);
    } finally {
      setLoading(false);
    }
  };
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading orders...</p>
      </div>
    );
  }
 
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Your Orders
        </h2>
 
        
        {orders.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-lg">
              You haven't placed any orders yet.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition"
              >
                <div>
                  
                  <p className="font-semibold text-gray-900">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-500 capitalize mt-1">
                    Status:{" "}
                    <span className="font-medium text-green-600">
                      {order.status}
                    </span>
                  </p>
                </div>
 
                
                <Link to={`/orders/${order._id}`}>
                  <button className="border border-gray-300 hover:border-red-500 hover:text-red-500 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
                    View Details →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 
export default Orders;
 