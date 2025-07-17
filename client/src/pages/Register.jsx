import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Register = () => {
	const { register, user } = useAuth();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		firstName: "",
		lastName: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	// Redirect if already logged in
	React.useEffect(() => {
		if (user) {
			navigate("/");
		}
	}, [user, navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.username) {
			newErrors.username = "Username is required";
		} else if (formData.username.length < 3) {
			newErrors.username = "Username must be at least 3 characters";
		} else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
			newErrors.username =
				"Username must contain only letters and numbers";
		}

		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Email is invalid";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		} else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
			newErrors.password =
				"Password must contain at least one lowercase letter, one uppercase letter, and one number";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (formData.firstName && formData.firstName.length > 50) {
			newErrors.firstName = "First name must not exceed 50 characters";
		}

		if (formData.lastName && formData.lastName.length > 50) {
			newErrors.lastName = "Last name must not exceed 50 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		const result = await register({
			username: formData.username,
			email: formData.email,
			password: formData.password,
			firstName: formData.firstName || undefined,
			lastName: formData.lastName || undefined,
		});
		setLoading(false);

		if (result.success) {
			navigate("/");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Join TravelTales
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Or{" "}
						<Link
							to="/login"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							sign in to your existing account
						</Link>
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700"
							>
								Username *
							</label>
							<input
								id="username"
								name="username"
								type="text"
								autoComplete="username"
								value={formData.username}
								onChange={handleChange}
								className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
									errors.username
										? "border-red-300"
										: "border-gray-300"
								} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
								placeholder="Choose a username"
							/>
							{errors.username && (
								<p className="mt-1 text-sm text-red-600">
									{errors.username}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email address *
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								value={formData.email}
								onChange={handleChange}
								className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
									errors.email
										? "border-red-300"
										: "border-gray-300"
								} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
								placeholder="Enter your email"
							/>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600">
									{errors.email}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-700"
								>
									First Name
								</label>
								<input
									id="firstName"
									name="firstName"
									type="text"
									autoComplete="given-name"
									value={formData.firstName}
									onChange={handleChange}
									className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
										errors.firstName
											? "border-red-300"
											: "border-gray-300"
									} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
									placeholder="First name"
								/>
								{errors.firstName && (
									<p className="mt-1 text-sm text-red-600">
										{errors.firstName}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-700"
								>
									Last Name
								</label>
								<input
									id="lastName"
									name="lastName"
									type="text"
									autoComplete="family-name"
									value={formData.lastName}
									onChange={handleChange}
									className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
										errors.lastName
											? "border-red-300"
											: "border-gray-300"
									} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
									placeholder="Last name"
								/>
								{errors.lastName && (
									<p className="mt-1 text-sm text-red-600">
										{errors.lastName}
									</p>
								)}
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password *
							</label>
							<div className="mt-1 relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									value={formData.password}
									onChange={handleChange}
									className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
										errors.password
											? "border-red-300"
											: "border-gray-300"
									} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
									placeholder="Create a password"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() =>
										setShowPassword(!showPassword)
									}
								>
									{showPassword ? (
										<EyeSlashIcon className="h-5 w-5 text-gray-400" />
									) : (
										<EyeIcon className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="mt-1 text-sm text-red-600">
									{errors.password}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700"
							>
								Confirm Password *
							</label>
							<div className="mt-1 relative">
								<input
									id="confirmPassword"
									name="confirmPassword"
									type={
										showConfirmPassword
											? "text"
											: "password"
									}
									autoComplete="new-password"
									value={formData.confirmPassword}
									onChange={handleChange}
									className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
										errors.confirmPassword
											? "border-red-300"
											: "border-gray-300"
									} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
									placeholder="Confirm your password"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() =>
										setShowConfirmPassword(
											!showConfirmPassword
										)
									}
								>
									{showConfirmPassword ? (
										<EyeSlashIcon className="h-5 w-5 text-gray-400" />
									) : (
										<EyeIcon className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
							{errors.confirmPassword && (
								<p className="mt-1 text-sm text-red-600">
									{errors.confirmPassword}
								</p>
							)}
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
								loading
									? "bg-gray-400 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							}`}
						>
							{loading ? (
								<div className="flex items-center">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Creating account...
								</div>
							) : (
								"Create account"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Register;
