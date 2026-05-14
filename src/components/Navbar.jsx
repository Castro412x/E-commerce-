import { Link, useNavigate } from "react-router-dom";
 
export default function Navbar({ token, setToken }) {
  const navigate = useNavigate();
 
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setToken(null); 
    navigate("/login");
  };
 
  return (
    <div className="bg-white shadow p-4 flex flex-wrap justify-between items-center gap-3">
      
      <h1 className="text-2xl font-bold">
        CASTRO<span className="text-red-500">★</span>
      </h1>
 
   
      <div className="flex w-full sm:w-1/2">
        <input
          type="text"
          placeholder="Search products, brands and categories"
          className="w-full border px-4 py-2 rounded-l"
        />
        <button className="bg-red-500 text-white px-6 rounded-r">
          Search
        </button>
      </div>
 
      <div className="flex gap-4 flex-wrap items-center text-sm">
       
        <Link to="/" className="hover:text-red-500 transition">
          Products
        </Link>
 
        {/* Only show Cart and Orders when logged in */}
        {token && (
          <>
            <Link to="/cart" className="hover:text-red-500 transition">
              🛒 Cart
            </Link>
            <Link to="/orders" className="hover:text-red-500 transition">
              📦 Orders
            </Link>
            <Link to="/account" className="hover:text-red-500 transition">
              Account
            </Link>
          </>
        )}
 
        {token ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
 