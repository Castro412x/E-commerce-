import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
 
function OrderDetail() {
  const { orderId } = useParams();
  const currentUser = useContext(AuthContext); 
  const navigate = useNavigate();
 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchOrder();
  }, [currentUser, orderId]);
 
  const fetchOrder = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser}`,
          },
        }
      );
 
      const data = await response.json();
      console.log("Order detail data:", data); 
      setOrder(data);
    } catch (err) {
      console.error("fetchOrder error:", err);
    } finally {
      setLoading(false);
    }
  };
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading order details...</p>
      </div>
    );
  }
 
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">Order not found.</p>
      </div>
    );
  }
 
 
  const orderTotal = (order.items || []).reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );
 
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        
        <button
          onClick={() => navigate("/orders")}
          className="text-sm text-gray-500 hover:text-red-500 mb-6 flex items-center gap-1"
        >
          ← Back to Orders
        </button>
 
        <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
 
        <div className="mt-2 space-y-1 text-sm text-gray-500">
          <p>
            Order ID:{" "}
            <span className="font-mono text-gray-700">{order._id}</span>
          </p>
          <p>
            Placed:{" "}
            {new Date(order.createdAt).toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="capitalize">
            Status:{" "}
            <span className="font-semibold text-green-600">{order.status}</span>
          </p>
          <p>Shipping to: {order.shippingAddress}</p>
        </div>
 
      
        <div className="mt-8 space-y-4">
          {(order.items || []).map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b pb-4"
            >
              
              {item.product?.imageUrl && (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 object-contain bg-gray-50 rounded-lg"
                />
              )}
 
             
              <div className="flex-grow">
                <p className="font-medium text-gray-900">
                  {item.product?.name}
                </p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × ${item.product?.price?.toFixed(2)}
                </p>
              </div>
 
              
              <p className="font-semibold text-gray-900">
                ${(item.product?.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
 
        <div className="mt-6 flex justify-end">
          <p className="text-lg font-bold text-gray-900">
            Order Total:{" "}
            <span className="text-red-500">${orderTotal.toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
 
export default OrderDetail;
 