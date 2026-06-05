import React, { useState, useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useParams } from "react-router-dom";

export default function SellerProfile() {
  const images = [
    "https://res.cloudinary.com/dvvl4i8q9/image/upload/v1772129188/piggybank-HE75OJUXOFE-unsplash_q3meen.jpg",
    "https://res.cloudinary.com/dvvl4i8q9/image/upload/v1772129188/piggybank-HE75OJUXOFE-unsplash_q3meen.jpg",
    "https://res.cloudinary.com/dvvl4i8q9/image/upload/v1772129188/piggybank-HE75OJUXOFE-unsplash_q3meen.jpg"
  ];

  const [current, setCurrent] = useState(0);
  const { id } = useParams(); // seller ID from URL
  const [seller, setSeller] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
  const fetchData = async () => {
    try {
      const res1 = await fetch(`https://movie-nova-4.onrender.com/seller/${id}`);
      const sellerData = await res1.json();

      const res2 = await fetch(`https://movie-nova-4.onrender.com/seller/${id}/services`);
      const servicesData = await res2.json();

      setSeller(sellerData.profile);
      setServices(servicesData.services);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  fetchData();
}, [id]);
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">

      {/* HEADER / CAROUSEL */}
      <div className="relative h-[300px] w-full overflow-hidden rounded-b-3xl">

        {/* Carousel Images */}
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="bg"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Top Buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button className="bg-white/20 p-2 rounded-full text-white">
            <ArrowLeft size={20} />
          </button>

          <button className="bg-white/20 p-2 rounded-full text-white">
            <Search size={20} />
          </button>
        </div>

        {/* Seller Info */}
        <div className="absolute bottom-6 w-full text-center text-white z-10">
          <img
            src={seller?.photoUrl || "https://via.placeholder.com/150"}
            alt="profile"
            className="w-24 h-24 rounded-full border-4 border-white mx-auto mb-2"
          />
          <h2 className="text-lg font-semibold">
            {seller?.fullName || "Seller"}
          </h2>

          <span className="bg-orange-500 text-xs px-3 py-1 rounded-full inline-block mt-1">
            Top Rated Seller
          </span>

          <p className="text-sm mt-2">
            ⭐ 4.5 • {seller?.location || "Unknown"}
          </p>
        </div>
      </div>

      {/* SERVICES */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Services</h3>
          <span className="text-gray-500">⌄</span>
        </div>

        <div className="flex gap-4 mt-4 overflow-x-auto">
          {services.map((service) => (
            <div
              key={service._id}
              className="min-w-[150px] bg-white rounded-xl shadow"
            >
              <img
                src={service.image || "https://via.placeholder.com/150"}
                alt="service"
                className="w-full h-[100px] object-cover rounded-t-xl"
              />
              <div className="p-2">
                <h4 className="text-sm font-medium">{service.title}</h4>
                <p className="text-green-600 font-semibold text-sm">
                  ${service.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HIRE BUTTON */}
      <div className="mt-auto p-4">
        <button className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold">
          Hire Now
        </button>
      </div>

    </div>
  );
}
