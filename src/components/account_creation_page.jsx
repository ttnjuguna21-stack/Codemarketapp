import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './style.css';
import {
  User,
  Brain,
  Folder,
  Camera,
  ChevronRight,
  ArrowLeft,
  Upload,
} from "lucide-react";

export default function AccountCreation() {
  const [step, setStep] = useState("home");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    location: "",
    skills: "",
    experience: "",
    portfolio: "",
    photo: null,
  });
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("https://movie-nova-4.onrender.com/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      const profile = data.profile || {};
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        location: profile.location || "",
        skills: profile.skills || "",
        experience: profile.experience || "",
        portfolio: profile.portfolio || "",
        photo: profile.photoUrl || null, // This fixes profile picture
      });
    })
    .catch(console.error);
}, []);

  const steps = ["home", "basic", "skills", "portfolio", "photo"];
  const currentIndex = steps.indexOf(step);

  const progress =
    step === "home"
      ? 0
      : (currentIndex / (steps.length - 1)) * 100;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const inputStyle = "w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
  const handleSubmit = async () => {
  try {
    let base64Photo = null;

    // Only convert photo if selected
    if (formData.photo instanceof File) {
      base64Photo = await toBase64(formData.photo);
    }

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      location: formData.location,
      skills: formData.skills,
      experience: formData.experience,
      portfolio: formData.portfolio,
      photo: base64Photo, // send base64 directly
    };

    const token = localStorage.getItem("token");

    const response = await fetch(
      "https://movie-nova-4.onrender.com/profile/setup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    navigate("/home");

    if (!response.ok) {
        console.error("SERVER ERROR:", data);
        throw new Error(data.details || data.error || "Failed to save profile");
    }
    const result = await response.json();
    console.log("Profile updated:", result);
    alert("Profile Submitted!");
    
  } catch (err) {
    console.error(err);
    alert("Error submitting profile: " + err.message);
  }
};
  return (
  	<div className="min-h-screen w-full bg-white flex justify-center py-10">
  		<div className="w-full max-w-md min-h-screen bg-white rounded-3xl p-6">
        {/* HEADER */}
        <div className="relative flex items-center mb-6">

          {step !== "home" && (
            <button onClick={() => setStep("home")}>
              <ArrowLeft size={20} />
            </button>
          )}

          <h2 className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-semibold">
            Complete Your Profile
          </h2>
        </div>

        {/* HOME */}
        {step === "home" && (
          <>
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">

              <div className="relative w-28 h-28">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-cyan-400 to-blue-300 p-[4px]">
                  <div className="bg-white rounded-full w-full h-full flex items-center justify-center">
                    {formData.photo ? (
                        <img
                            src={formData.photo}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                        />
                        ) : (
                        <User size={32} className="text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {Math.round(progress)}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-56 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <StepCard
                icon={<User size={18} />}
                title="Basic Info"
                onClick={() => setStep("basic")}
              />

              <StepCard
                icon={<Brain size={18} />}
                title="Skills & Expertise"
                onClick={() => setStep("skills")}
              />

              <StepCard
                icon={<Folder size={18} />}
                title="Portfolio"
                onClick={() => setStep("portfolio")}
              />

              <StepCard
                icon={<Camera size={18} />}
                title="Profile Picture"
                onClick={() => setStep("photo")}
              />
            </div>

            {/* BLUE CONTINUE BUTTON */}
            <button
              onClick={() => setStep("basic")}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
            >
              Continue
            </button>
          </>
        )}

        {/* BASIC INFO */}
        {step === "basic" && (
          <FormSection
            title="Basic Information"
            onBack={() => setStep("home")}
            onNext={() => setStep("skills")}
          >
            <input
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className={inputStyle}
            />
            
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={inputStyle}
            />
            <input
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className={inputStyle}
            />
          </FormSection>
        )}

        {/* SKILLS */}
        {step === "skills" && (
          <FormSection
            title="Skills & Expertise"
            onBack={() => setStep("basic")}
            onNext={() => setStep("portfolio")}
          >
            <input
              name="skills"
              placeholder="Primary Skill"
              value={formData.skills}
              onChange={handleChange}
              className={inputStyle}
            />
            <input
              name="experience"
              placeholder="Years of Experience"
              value={formData.experience}
              onChange={handleChange}
              className={inputStyle}
            />
          </FormSection>
        )}

        {/* PORTFOLIO */}
        {step === "portfolio" && (
          <FormSection
            title="Portfolio"
            onBack={() => setStep("skills")}
            onNext={() => setStep("photo")}
          >
            <input
              name="portfolio"
              placeholder="Portfolio Link"
              value={formData.portfolio}
              onChange={handleChange}
              className={inputStyle}
            />
          </FormSection>
        )}

        {/* PHOTO */}
        {step === "photo" && (
          <FormSection
            title="Profile Picture"
            onBack={() => setStep("portfolio")}
            onNext={handleSubmit}
            isLast
          >
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-2xl p-8 cursor-pointer hover:bg-blue-50 transition">

              <Upload size={28} className="text-blue-500 mb-3" />

              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-2 rounded-full shadow-md font-medium">
                Choose Image
              </span>

              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    photo: e.target.files[0],
                  })
                }
              />
            </label>
          </FormSection>
        )}

      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StepCard({ icon, title, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm hover:bg-gray-100 cursor-pointer transition"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
          {icon}
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
    </div>
  );
}

function FormSection({
  title,
  children,
  onBack,
  onNext,
  isLast = false,
}) {
  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-lg text-center">
        {title}
      </h3>

      <div className="space-y-4">{children}</div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 py-3 rounded-xl"
        >
          Back
        </button>

        <button
          onClick={onNext}
          className={`flex-1 py-3 rounded-xl text-white ${
            isLast
              ? "bg-green-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLast ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
