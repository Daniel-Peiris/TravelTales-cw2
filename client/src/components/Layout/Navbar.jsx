import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
	MagnifyingGlassIcon,
	PlusIcon,
	UserCircleIcon,
	Bars3Icon,
	XMarkIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
			setSearchQuery("");
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/");
		setIsMobileMenuOpen(false);
	};

	const isActive = (path) => location.pathname === path;

	return (
		<nav className="bg-white shadow-lg sticky top-0 z-50">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link to="/" className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">
								TT
							</span>
						</div>
						<span className="font-bold text-xl text-gray-800">
							TravelTales
						</span>
					</Link>

					{/* Search Bar - Desktop */}
					<form
						onSubmit={handleSearch}
						className="hidden md:flex flex-1 max-w-md mx-8"
					>
						<div className="relative w-full">
							<input
								type="text"
								placeholder="Search countries, users, or posts..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
						</div>
					</form>

					{/* Desktop Menu */}
					<div className="hidden md:flex items-center space-x-4">
						{user ? (
							<>
								<Link
									to="/create"
									className="flex items-center space-x-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
								>
									<PlusIcon className="h-4 w-4" />
									<span>Create</span>
								</Link>
								<Link
									to="/following"
									className={`px-3 py-2 rounded-lg transition-colors ${
										isActive("/following")
											? "bg-blue-100 text-blue-700"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									Following
								</Link>
								<div className="relative group">
									<button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
										<UserCircleIcon className="h-6 w-6 text-gray-600" />
										<span className="text-gray-700">
											{user.username}
										</span>
									</button>
									<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
										<Link
											to={`/user/${user.username}`}
											className="block px-4 py-2 text-gray-700 hover:bg-gray-100 first:rounded-t-lg"
										>
											My Profile
										</Link>
										<button
											onClick={handleLogout}
											className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 last:rounded-b-lg"
										>
											Logout
										</button>
									</div>
								</div>
							</>
						) : (
							<>
								<Link
									to="/login"
									className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
								>
									Login
								</Link>
								<Link
									to="/register"
									className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
								>
									Register
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="md:hidden p-2 rounded-lg hover:bg-gray-100"
					>
						{isMobileMenuOpen ? (
							<XMarkIcon className="h-6 w-6" />
						) : (
							<Bars3Icon className="h-6 w-6" />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden border-t border-gray-200 py-4">
						{/* Mobile Search */}
						<form onSubmit={handleSearch} className="mb-4">
							<div className="relative">
								<input
									type="text"
									placeholder="Search..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
							</div>
						</form>

						{/* Mobile Navigation */}
						<div className="space-y-2">
							{user ? (
								<>
									<Link
										to="/create"
										onClick={() =>
											setIsMobileMenuOpen(false)
										}
										className="flex items-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg"
									>
										<PlusIcon className="h-5 w-5" />
										<span>Create Post</span>
									</Link>
									<Link
										to="/following"
										onClick={() =>
											setIsMobileMenuOpen(false)
										}
										className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										Following
									</Link>
									<Link
										to={`/user/${user.username}`}
										onClick={() =>
											setIsMobileMenuOpen(false)
										}
										className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										My Profile
									</Link>
									<button
										onClick={handleLogout}
										className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										Logout
									</button>
								</>
							) : (
								<>
									<Link
										to="/login"
										onClick={() =>
											setIsMobileMenuOpen(false)
										}
										className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
									>
										Login
									</Link>
									<Link
										to="/register"
										onClick={() =>
											setIsMobileMenuOpen(false)
										}
										className="block px-4 py-3 bg-blue-500 text-white rounded-lg text-center"
									>
										Register
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
