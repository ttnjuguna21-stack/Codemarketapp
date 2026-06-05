import React from "react";
import { Mail, Lock } from "lucide-react";
import { useLockBodyScroll } from './useLockBodyScroll';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './style.css';

export default function Login() {
	const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [error, setError] = useState("");
	useLockBodyScroll();
	const navigate = useNavigate();
	useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token && role) {
            navigate("/home");
        }
    }, []);
    const handleLogin = async () => {
        setError("");

        if (!email || !password) {
            setError("Email and password required");
            return;
        }

        try {
            const res = await fetch("https://movie-nova-4.onrender.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role || "buyer");
            navigate("/home");
        } catch (err) {
            console.error(err);
            setError("Server error or server waking up...");
        }
    };

	return (
  	    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gray-100 px-6 pt-10">
            {/* Login Container */}
            <div className="w-full max-w-md">

            {/* Logo */}
            <div className="flex items-center justify-center mb-10">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {"</>"}
                </div>
                <span className="ml-3 text-2xl font-semibold text-gray-700">
                    CodeMarket
                </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back!
            </h2>

            <p className="text-gray-500 mb-8">
                Login to your account
            </p>

            {/* Email Input */}
            <div className="flex items-center bg-white border rounded-xl px-4 py-3 mb-4 shadow-sm">
                <Mail className="text-gray-400 mr-2" size={18} />
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full outline-none bg-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}

                />
            </div>

            {/* Password Input */}
            <div className="flex items-center bg-white border rounded-xl px-4 py-3 mb-2 shadow-sm">
                <Lock className="text-gray-400 mr-2" size={18} />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full outline-none bg-transparent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* Forgot Password */}
            <div className="text-right mb-6">
                <Link to="/otp" className="text-blue-600 font-medium hover:underline">
                    Forgot Password?
                </Link>
            </div>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

            {/* Login Button */}
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition" onClick={handleLogin}>
                Login
            </button>
     
            {/* Divider */}
            <div className="flex items-center my-6">
                <div className="flex-grow border-t"></div>
                <span className="mx-3 text-gray-400 text-sm">Or login with</span>
                <div className="flex-grow border-t"></div>
            </div>

            {/* Social Login */}
            <div className="flex gap-4">

                <button className="flex items-center justify-center w-1/2 border rounded-xl py-3 hover:bg-gray-50">
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        className="w-5 mr-2"
                        alt="google"
                    />
                    Google
                </button>

                <button className="flex items-center justify-center w-1/2 border rounded-xl py-3 hover:bg-gray-50">
                    <img
                        src="https://cdn.simpleicons.org/apple/000000"
                        className="w-5 mr-2"
                        alt="apple"
                    />
                    Apple
                </button>
            </div>
        </div>
    </div>
  );
}
