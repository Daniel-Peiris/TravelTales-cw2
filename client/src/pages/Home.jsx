// src/pages/Home.jsx
import React, { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import BlogCard from "../components/Blog/BlogCard.jsx";
import CountrySelector from "../components/Country/CountrySelector.jsx";
import api from "../services/api.js";

const Home = () => {
	const { user } = useAuth();
	const [filters, setFilters] = useState({
		page: 1,
		limit: 10,
		country: "",
		author: "",
		sortBy: "createdAt",
		sortOrder: "DESC",
	});

	const {
		data: blogsData,
		isLoading,
		error,
	} = useQuery(
		["blogs", filters],
		async () => {
			const params = new URLSearchParams();
			Object.entries(filters).forEach(([key, value]) => {
				if (value) params.append(key, value);
			});
			const response = await api.get(`/blogs?${params.toString()}`);
			return response.data;
		},
		{ keepPreviousData: true }
	);

	const handleFilterChange = (newFilters) => {
		setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
	};

	const handlePageChange = (newPage) => {
		setFilters((prev) => ({ ...prev, page: newPage }));
	};

	if (error) {
		return (
			<div className="text-center py-12">
				<div className="text-red-500 mb-4">
					<p>Failed to load blog posts</p>
					<p className="text-sm">{error.message}</p>
				</div>
				<button
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto">
			{/* Hero Section */}
			<div className="text-center mb-12">
				<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
					Welcome to{" "}
					<span className="text-blue-600">TravelTales</span>
				</h1>
				<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
					Share your travel adventures, discover amazing destinations,
					and connect with fellow travelers from around the world.
				</p>
				{!user && (
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link
							to="/register"
							className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold"
						>
							Start Your Journey
						</Link>
						<Link
							to="/login"
							className="px-8 py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
						>
							Sign In
						</Link>
					</div>
				)}
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow-sm p-6 mb-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Filter by Country
						</label>
						<CountrySelector
							value={filters.country}
							onChange={(country) =>
								handleFilterChange({ country })
							}
							placeholder="All countries"
							isClearable
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Author
						</label>
						<input
							type="text"
							placeholder="Search by username"
							value={filters.author}
							onChange={(e) =>
								handleFilterChange({ author: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Sort By
						</label>
						<select
							value={filters.sortBy}
							onChange={(e) =>
								handleFilterChange({ sortBy: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="createdAt">Date Created</option>
							<option value="likesCount">Most Liked</option>
							<option value="commentsCount">
								Most Commented
							</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Order
						</label>
						<select
							value={filters.sortOrder}
							onChange={(e) =>
								handleFilterChange({
									sortOrder: e.target.value,
								})
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							<option value="DESC">Newest First</option>
							<option value="ASC">Oldest First</option>
						</select>
					</div>
				</div>
			</div>

			{/* Blog Posts */}
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<div
							key={i}
							className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
						>
							<div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
							<div className="h-4 bg-gray-200 rounded mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-3/4"></div>
						</div>
					))}
				</div>
			) : blogsData?.blogPosts?.length > 0 ? (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
						{blogsData.blogPosts.map((blog) => (
							<BlogCard key={blog.id} blog={blog} />
						))}
					</div>

					{/* Pagination */}
					{blogsData.pagination.totalPages > 1 && (
						<div className="flex justify-center items-center space-x-2">
							<button
								onClick={() =>
									handlePageChange(filters.page - 1)
								}
								disabled={!blogsData.pagination.hasPrev}
								className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
							>
								Previous
							</button>

							<span className="px-4 py-2 text-gray-700">
								Page {blogsData.pagination.currentPage} of{" "}
								{blogsData.pagination.totalPages}
							</span>

							<button
								onClick={() =>
									handlePageChange(filters.page + 1)
								}
								disabled={!blogsData.pagination.hasNext}
								className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
							>
								Next
							</button>
						</div>
					)}
				</>
			) : (
				<div className="text-center py-12">
					<div className="text-gray-500 mb-4">
						<p className="text-xl">No blog posts found</p>
						<p>Try adjusting your filters or check back later!</p>
					</div>
					{user && (
						<Link
							to="/create"
							className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
						>
							Write Your First Post
						</Link>
					)}
				</div>
			)}
		</div>
	);
};

export default Home;
