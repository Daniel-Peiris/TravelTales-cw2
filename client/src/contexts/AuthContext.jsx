import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api.js";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			// Verify token and get user data
			fetchCurrentUser();
		} else {
			setLoading(false);
		}
	}, []);

	const fetchCurrentUser = async () => {
		try {
			const response = await api.get("/auth/me");
			setUser(response.data);
		} catch (error) {
			// Token is invalid, remove it
			localStorage.removeItem("token");
			delete api.defaults.headers.common["Authorization"];
		} finally {
			setLoading(false);
		}
	};

	const login = async (email, password) => {
		try {
			const response = await api.post("/auth/login", { email, password });
			const { token, user } = response.data;

			localStorage.setItem("token", token);
			api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			setUser(user);

			toast.success("Login successful!");
			return { success: true };
		} catch (error) {
			const message = error.response?.data?.error || "Login failed";
			toast.error(message);
			return { success: false, error: message };
		}
	};

	const register = async (userData) => {
		try {
			const response = await api.post("/auth/register", userData);
			const { token, user } = response.data;

			localStorage.setItem("token", token);
			api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			setUser(user);

			toast.success("Registration successful!");
			return { success: true };
		} catch (error) {
			const message =
				error.response?.data?.error || "Registration failed";
			toast.error(message);
			return { success: false, error: message };
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		delete api.defaults.headers.common["Authorization"];
		setUser(null);
		toast.success("Logged out successfully");
	};

	const updateProfile = async (profileData) => {
		try {
			const response = await api.put("/auth/profile", profileData);
			setUser(response.data.user);
			toast.success("Profile updated successfully!");
			return { success: true };
		} catch (error) {
			const message =
				error.response?.data?.error || "Profile update failed";
			toast.error(message);
			return { success: false, error: message };
		}
	};

	const value = {
		user,
		loading,
		login,
		register,
		logout,
		updateProfile,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
