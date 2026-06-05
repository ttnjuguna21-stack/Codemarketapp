import React, { useState, useEffect } from "react";
import {
  User,
  Bookmark,
  Activity,
  Settings,
  Star,
  ArrowLeft,
  Search,
  Bell,
  Moon,
  Lock,
  Globe
} from "lucide-react"
const API = "https://movie-nova-4.onrender.com";

export default function ProfilePage() {
  const [page, setPage] = useState("profile");
  const [profile, setProfile] = useState(null);

useEffect(() => {
  fetch(`${API}/profile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => setProfile(data.profile))
    .catch(() => setProfile(null));
}, []);
 // if (!profile) return <div className="p-4">Loading...</div>;
  return (
    <div className="w-screen h-screen bg-[#f5f6fa] overflow-hidden">
        {page === "profile" && <MainProfile go={setPage} profile={profile} />}
        {page === "services" && <Services go={setPage} />}
        {page === "saved" && <Saved go={setPage} />}
        {page === "activity" && <ActivityPage go={setPage} />}
        {page === "settings" && <SettingsPage go={setPage} />}
        {page === "search" && <SearchPage go={setPage} />}
    </div>
  );
}

//////////////////////////////////////////////////
// 🔵 MAIN PROFILE
//////////////////////////////////////////////////
function MainProfile({ go, profile }) {
  return (
    <div className="relative h-full">
    	<div className="bg-gradient-to-b from-[#0f172a] to-[#1e3a8a] h-44 relative">
            <ArrowLeft
                onClick={() => go("profile")}
                className="absolute left-4 top-5 text-white w-5 h-5 cursor-pointer"
            />
            <Search
            onClick={() => go("search")}
            className="absolute right-4 top-5 text-white w-5 h-5 cursor-pointer"
            />
            <h2 className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-[15px] font-semibold py-10">
                My Profile
            </h2>
        </div>

      {/* CARD */}
      <div className="absolute top-[110px] left-1/2 -translate-x-1/2 w-[90%] bg-white rounded-2xl p-5 text-center shadow-md py-10">

        <img
          src={profile?.photoUrl || "https://via.placeholder.com/100"}
          className="w-20 h-20 rounded-full border-[5px] border-white mx-auto -mt-16"
        />

        <h3 className="mt-2 text-sm font-semibold text-gray-800">
          {profile?.fullName || "No Name"}
        </h3>

        <p className="text-gray-400 text-xs">{profile?.skills || "No skills"}</p>

        {/* STATS */}
        <div className="flex justify-between mt-5 px-6">
          <Stat label="Projects" value="45" />
          <Stat label="Rating" value="4.8" star />
          <Stat label="Followers" value="1.2k" />
        </div>

        <button className="mt-5 w-full bg-gray-100 text-blue-600 text-sm py-2 rounded-lg font-medium">
          Edit Profile
        </button>
      </div>

      {/* MENU */}
      <div className="mt-[150px] px-4 space-y-3 py-16">
        <MenuItem title="My Services" icon={<User size={18} />} onClick={() => go("services")} />
        <MenuItem title="Saved Items" icon={<Bookmark size={18} />} onClick={() => go("saved")} />
        <MenuItem title="Activity" icon={<Activity size={18} />} onClick={() => go("activity")} />
        <MenuItem title="Settings" icon={<Settings size={18} />} onClick={() => go("settings")} />
      </div>
    </div>
  );
}

//////////////////////////////////////////////////
// 🟣 SERVICES PAGE (EDITABLE)
//////////////////////////////////////////////////
function Services({ go }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({
    title: "",
    price: "",
    image: null, // File object
    category: "",
  });

  const token = localStorage.getItem("token");

  // Fetch existing services
  useEffect(() => {
    fetch(`${API}/my/services`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Services fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Convert File to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Add new service
  const addService = async () => {
    if (!newService.title || !newService.price || !newService.image || !newService.category) {
      alert("Please provide title, price, category, and image.");
      return;
    }

    try {
      const base64Image = await toBase64(newService.image);

      const res = await fetch(`${API}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newService.title,
          price: newService.price,
          category: newService.category,
          image: base64Image, // send base64
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setServices([...services, data.service]);
        setNewService({ title: "", price: "", category: "", image: null });
      } else {
        alert(data.error || "Failed to add service");
      }
    } catch (err) {
      console.error("Add service error:", err);
    }
  };
  // Update existing service
const updateService = async (index) => {
  const service = services[index];

  if (!service.title || !service.price || !service.category) {
    alert("Please provide title, price, and category.");
    return;
  }

  try {
    let base64Image = null;

    // Only convert new image if it is a File
    if (service.image instanceof File) {
      base64Image = await toBase64(service.image);
    }

    const res = await fetch(`${API}/services/${service._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: service.title,
        price: service.price,
        category: service.category,
        image: base64Image, // send base64 if changed
      }),
    });

    const data = await res.json();

    if (res.ok) {
      const copy = [...services];
      copy[index] = data.service;
      setServices(copy);
      alert("Service updated successfully!");
    } else {
      alert(data.error || "Failed to update service");
    }
  } catch (err) {
    console.error("Update service error:", err);
  }
};

  if (loading)
    return <p className="text-center mt-10 text-gray-400">Loading services...</p>;

  return (
    <Page className="flex-1 overflow-y-auto" title="My Services" go={go}>
      {/* Existing services */}
      <div className="space-y-4">
        {services.map((s, i) => (
          <div
            key={s._id || i}
            className="bg-white shadow-md rounded-2xl p-5 space-y-3 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center gap-4">
              {s.image && typeof s.image === "string" && (
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                />
              )}
              <div className="flex-1 space-y-2 overflow-y-auto">
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-1 focus:ring-blue-500"
                  value={s.title}
                  onChange={(e) => {
                    const copy = [...services];
                    copy[i].title = e.target.value;
                    setServices(copy);
                  }}
                />
                <input
                  type="number"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-1 focus:ring-blue-500"
                  value={s.price}
                  onChange={(e) => {
                    const copy = [...services];
                    copy[i].price = e.target.value;
                    setServices(copy);
                  }}
                />
                <select
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-1 focus:ring-blue-500"
                  value={s.category}
                  onChange={(e) => {
                    const copy = [...services];
                    copy[i].category = e.target.value;
                    setServices(copy);
                  }}
                >
                  <option value="">Select Category</option>
                  <option value="Web">Web</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Design">Design</option>
                </select>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              className="block mt-2"
              onChange={(e) => {
                const copy = [...services];
                copy[i].image = e.target.files[0];
                setServices(copy);
              }}
            />
          </div>
        ))}
      </div>

      {/* New service form */}
      <div className="bg-white shadow-md rounded-2xl p-5 mt-6 space-y-3">
        <h3 className="text-gray-700 font-semibold text-lg">Add New Service</h3>

        <input
          type="text"
          placeholder="Service Title"
          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-1 focus:ring-blue-500"
          value={newService.title}
          onChange={(e) =>
            setNewService({ ...newService, title: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-1 focus:ring-blue-500"
          value={newService.price}
          onChange={(e) =>
            setNewService({ ...newService, price: e.target.value })
          }
        />
        <select
          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-1 focus:ring-blue-500"
          value={newService.category}
          onChange={(e) =>
            setNewService({ ...newService, category: e.target.value })
          }
        >
          <option value="">Select Category</option>
          <option value="Web">Web</option>
          <option value="Mobile">Mobile</option>
          <option value="Design">Design</option>
        </select>
        <input
          type="file"
          accept="image/*"
          className="block"
          onChange={(e) =>
            setNewService({ ...newService, image: e.target.files[0] })
          }
        />

        <button
          onClick={addService}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Add Service
        </button>
      </div>
    </Page>
  );
}
//////////////////////////////////////////////////
// 🟢 SAVED PAGE
//////////////////////////////////////////////////
function Saved({ go }) {
  return (
    <Page title="Saved Items" go={go}>
      <p className="text-gray-400 text-sm">No saved items yet.</p>
    </Page>
  );
}

//////////////////////////////////////////////////
// 🟡 ACTIVITY PAGE
//////////////////////////////////////////////////
function ActivityPage({ go }) {
  const logs = ["New follower", "Completed project", "Got review"];

  return (
    <Page title="Activity" go={go}>
      {logs.map((l, i) => (
        <div key={i} className="bg-white p-4 rounded-xl">
          {l}
        </div>
      ))}
    </Page>
  );
}

//////////////////////////////////////////////////
// 🔴 SETTINGS PAGE (INTERACTIVE)
//////////////////////////////////////////////////
function SettingsPage({ go }) {
  const [dark, setDark] = useState(false);
  const [notify, setNotify] = useState(true);

  return (
    <Page title="Settings" go={go}>

      <SettingItem icon={<Bell size={18} />} title="Notifications">
        <input type="checkbox" checked={notify} onChange={() => setNotify(!notify)} />
      </SettingItem>

      <SettingItem icon={<Moon size={18} />} title="Dark Mode">
        <input type="checkbox" checked={dark} onChange={() => setDark(!dark)} />
      </SettingItem>

      <SettingItem icon={<Lock size={18} />} title="Privacy">
        <button className="text-blue-500 text-sm">Manage</button>
      </SettingItem>

      <SettingItem icon={<Globe size={18} />} title="Language">
        <select className="border rounded px-2 py-1 text-sm">
          <option>English</option>
          <option>Swahili</option>
        </select>
      </SettingItem>

    </Page>
  );
}

//////////////////////////////////////////////////
// 🔍 SEARCH PAGE
//////////////////////////////////////////////////
function SearchPage({ go }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;

    fetch(`${API}/services/search?q=${query}`)
      .then(res => res.json())
      .then(data => setResults(data.services || []));
  }, [query]);

  return (
    <Page title="Search" go={go}>
      <input
        placeholder="Search..."
        className="w-full p-3 rounded-lg border outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.map(s => (
        <div key={s._id} className="bg-white p-3 rounded-lg">
          {s.title}
        </div>
      ))}
    </Page>
  );
}
    
//////////////////////////////////////////////////
// 🔹 REUSABLE COMPONENTS
//////////////////////////////////////////////////
function Page({ title, children, go, className }) {
  return (
    <div className={`p-4 space-y-4 h-full overflow-y-auto ${className || ""}`}>
      <div className="flex items-center gap-3">
        <ArrowLeft onClick={() => go("profile")} className="cursor-pointer" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MenuItem({ icon, title, onClick }) {
  return (
    <div onClick={onClick} className="flex justify-between items-center bg-white px-4 py-3 rounded-xl cursor-pointer">
      <div className="flex gap-3 items-center">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
          {icon}
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <span className="text-gray-300">›</span>
    </div>
  );
}

function SettingItem({ icon, title, children }) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl">
      <div className="flex gap-3 items-center">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, star }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold flex items-center justify-center gap-1">
        {value}
        {star && <Star size={13} className="text-yellow-400 fill-yellow-400" />}
      </p>
      <p className="text-[11px] text-gray-400">{label}</p>
    </div>
  );
}
