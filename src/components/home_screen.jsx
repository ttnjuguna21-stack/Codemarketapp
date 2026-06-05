import React, { useState, useEffect, useRef } from "react";
import SideNav from "./side_bar_page"; // adjust path
import "./style.css";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Settings,
  Home,
  LayoutGrid,
  MessageCircle,
  User,
  Search,
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("All");
  const [activeNav, setActiveNav] = useState("Home");
  const [services, setServices] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef(null);
  const toggleFavorite = async (serviceId) => {
  try {
    const res = await fetch(
      "https://movie-nova-4.onrender.com/favorites/toggle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token")
        },
        body: JSON.stringify({ serviceId })
      }
    );

    const data = await res.json();

    console.log("Favorites response:", data); // 🔥 DEBUG

    if (!res.ok) return;

    setFavorites(data.favorites.map(String)); // 🔥 FORCE STRING
  } catch (err) {
    console.log(err);
  }
};
const rateService = async (serviceId, rating) => {
  try {
    const res = await fetch(
      `https://movie-nova-4.onrender.com/services/${serviceId}/rate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token")
        },
        body: JSON.stringify({ rating })
      }
    );

    const data = await res.json();
    console.log("Rating response:", data);

    if (!res.ok) return;

    fetchServices(activeTab); // ✅ refresh AFTER backend success
  } catch (err) {
    console.log(err);
  }
};
  const fetchServices = async (tab = activeTab, query = "") => {
    try {
        let url =
            tab === "All"
                ? `https://movie-nova-4.onrender.com/services?category=${tab}`
                : `https://movie-nova-4.onrender.com/services?category=${tab}`;

        if (query) {
            url += `&search=${query}`;
        }
        const res = await fetch(url);
        const data = await res.json();

        const formatted = (data.services || []).map((item) => ({
            id: item._id || item.id,// serviceId
            userId: item.userId,   // ✅ ADD THIS
            title: item.title,
            price: item.price,
            image: item.image || "https://via.placeholder.com/150",
            seller: item.userId?.username || "Unknown",
            avatar: item.userId?.profilePic || "https://via.placeholder.com/50",
            rating: item.rating ? Number(item.rating).toFixed(1) : "New",
        }));

        setServices(formatted);
        setLoading(false);
    } catch (error) {
        console.log(error);
        setLoading(false);
    }
 };
 useEffect(() => {
    setLoading(true);
    fetchServices(activeTab);
 }, [activeTab]);
 useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;

        if (
          container.scrollLeft + container.clientWidth >=
          container.scrollWidth
        ) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 270, behavior: "smooth" });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
 }, []);
 useEffect(() => {
  const loadFavorites = async () => {
    try {
      const res = await fetch("https://movie-nova-4.onrender.com/favorites", {
        headers: {
          token: localStorage.getItem("token")
        }
      });

      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      console.log(err);
    }
  };

  loadFavorites();
}, []);
const tabs = ["All", "Web", "App", "AI", "Data"];
const navigate = useNavigate();
  return (
    <div className="h-screen bg-[#F4F6F9] flex flex-col max-w-[430px] mx-auto overflow-hidden">
      {/* SIDEBAR */}
      <SideNav
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {/* ===== HEADER ===== */}
      <div className="bg-white px-6 pt-8 pb-5 shadow-sm rounded-b-3xl">
        <div className="flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dvvl4i8q9/image/upload/v1772129188/piggybank-HE75OJUXOFE-unsplash_q3meen.jpg"
              alt="Logo"
              className="w-6 h-6 object-contain"
            />
            <h1 className="text-[18px] font-semibold">
              CodeMarket
            </h1>
          </div>

          <div className="relative">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
        </div>

        <div className="mt-5 relative">
          <Search
            size={18}
            className="absolute left-4 top-3 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search Services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setLoading(true);
                fetchServices(activeTab, search);
              }
            }}
            className="w-full h-12 pl-10 pr-4 bg-[#F1F3F6] rounded-xl text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* ===== SCROLLABLE AREA ===== */}
      <div className="flex-1 overflow-y-auto">

        {/* ===== TABS ===== */}
        <div className="px-6 mt-5 flex gap-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ===== CAROUSEL ===== */}
        <div className="px-6 mt-6">
          <h2 className="text-sm font-semibold mb-4">
            Top Services
          </h2>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth"
          >
            {services.map((item) => (
              <div
                key={item.id}
                className="min-w-[260px] bg-white rounded-2xl p-4 shadow-md"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-24 w-full rounded-xl object-cover"
                />

                <h3 className="mt-3 text-sm font-semibold">
                  {item.title}
                </h3>

                <p className="text-blue-600 font-bold">
                  ${item.price}
                </p>

                <p className="text-xs text-gray-500">
                  {item.seller} • ⭐ {item.rating}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SERVICE LIST ===== */}
 
        <div className="px-6 mt-6 space-y-5 pb-6">
            {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : (
                services.map((service) => (
                    <div
                        key={service.id}
                        onClick={() => {
                            if (service.userId?._id) {
                                navigate(`/buyer/${service.userId._id}`);
                            }
                        }}// seller page
                        className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm cursor-pointer"
                    >
                        <img
                            src={service.image}
                            alt={service.title}
                            className="w-16 h-16 rounded-xl object-cover"
                        />

                        <div className="flex-1">
                            <h2 className="text-sm font-semibold">
                                {service.title}
                            </h2>

                            <p className="text-blue-600 font-bold mt-1">
                                ${service.price}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                {service.seller} • ⭐ {service.rating}
                            </p>
                            <div className="flex gap-1 mt-2">
                                {[1,2,3,4,5].map((star) => (
                                    <span
                                        key={star}
                                        className="cursor-pointer text-yellow-400 text-sm"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!service.id) return;

                                            await rateService(service.id, star);
                                        }}
                                    >
                                    ⭐
                                    </span>
                                ))}
                            </div>
                          
                            <div
                                
                                className="cursor-pointer text-xl"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!service.id) return;

                                    await toggleFavorite(service.id);
                                }}
                            >
                                {favorites.map(String).includes(String(service.id)) ? "❤️" : "🤍"}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
