import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
 
function Signup() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  async function handleSignup(e) {
    e.preventDefault();
    setError("");
 
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (email.length < 3) {
      setError("email must be at least 3 characters");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
 
    setLoading(true);
 try {
  const response = await fetch( "https://ecommerce-api-v2-wd7q.onrender.com/auth/signup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password: password,
      }),
    }
  );

  const data = await response.json();
  console.log("Register response", data);
      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }
 
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify({ email: email.trim() }));
        navigate("/");
      } else {
        
        alert("Account created! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Create Account
        </h2>
        <p className="text-sm text-gray-500 text-center mt-2">
          Sign up to start shopping
        </p>
 
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
 
        <form onSubmit={handleSignup} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              email
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              disabled={loading}
            />
          </div>
 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
 
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
 
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-red-500 font-semibold hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
 
export default Signup;