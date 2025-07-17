// src/pages/Search.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import BlogCard from "../components/Blog/BlogCard";
import CountrySelector from "../components/Country/CountrySelector";
import api from "../services/api";
import {
	MagnifyingGlassIcon,
	UserCircleIcon,
	MapPinIcon,
} from "@heroicons/react/24/outline";

const Search = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchType, setSearchType] = useState("posts");
	const [filters, setFilters] = useState({
		query: searchParams.get("q") || "",
		country: searchParams.get("country") || "",
		sortBy: "createdAt",
		sortOrder: "DESC",
	});

	// Search blog posts
	const { data: blogResults, isLoading: blogsLoading } = useQuery(
		["searchBlogs", filters, searchType],
		async () => {
			if (!filters.query && !filters.country)
				return { blogPosts: [], pagination: {} };

			const params = new URLSearchParams();
			if (filters.query) params.append("author", filters.query);
			if (filters.country) params.append("country", filters.country);
			params.append("sortBy", filters.sortBy);
			params.append("sortOrder", filters.sortOrder);
			params.append("limit", "20");

			const response = await api.get(`/blogs?${params.toString()}`);
			return response.data;
		},
		{
			enabled:
				searchType === "posts" &&
				(!!filters.query || !!filters.country),
			keepPreviousData: true,
		}
	);

	// Search users
	const { data: userResults, isLoading: usersLoading } = useQuery(
		["searchUsers", filters.query],
		async () => {
			if (!filters.query || filters.query.length < 2)
				return { users: [], pagination: {} };

			const response = await api.get(
				`/users/search/${encodeURIComponent(filters.query)}`
			);
			return response.data;
		},
		{
			enabled: searchType === "users" && filters.query.length >= 2,
			keepPreviousData: true,
		}
	);

	useEffect(() => {
		const query = searchParams.get("q") || "";
		const country = searchParams.get("country") || "";
		setFilters((prev) => ({ ...prev, query, country }));
	}, [searchParams]);

	const handleSearch = (e) => {
		e.preventDefault();
		const newParams = new URLSearchParams();
		if (filters.query) newParams.set("q", filters.query);
		if (filters.country) newParams.set("country", filters.country);
		setSearchParams(newParams);
	};

	const handleFilterChange = (newFilters) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	};

	const clearFilters = () => {
		setFilters({
			query: "",
			country: "",
			sortBy: "createdAt",
			sortOrder: "DESC",
		});
		setSearchParams({});
	};

	const hasActiveFilters = filters.query || filters.country;
	const isLoading = blogsLoading || usersLoading;

	return (
		<div className="max-w-6xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">
					Search TravelTales
				</h1>

				{/* Search Form */}
				<form
					onSubmit={handleSearch}
					className="bg-white rounded-lg shadow-sm p-6 mb-6"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Search by Author or Keyword
							</label>
							<div className="relative">
								<input
									type="text"
									value={filters.query}
									onChange={(e) =>
										handleFilterChange({
											query: e.target.value,
										})
									}
									placeholder="Enter username or keyword..."
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Filter by Country
							</label>
							<CountrySelector
								value={filters.country}
								onChange={(country) =>
									handleFilterChange({ country })
								}
								placeholder="Select a country..."
								isClearable
							/>
						</div>
					</div>

					<div className="flex justify-between items-center">
						<div className="flex space-x-4">
							<button
								type="submit"
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Search
							</button>

							{hasActiveFilters && (
								<button
									type="button"
									onClick={clearFilters}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
								>
									Clear Filters
								</button>
							)}
						</div>

						{searchType === "posts" && hasActiveFilters && (
							<select
								value={filters.sortBy}
								onChange={(e) =>
									handleFilterChange({
										sortBy: e.target.value,
									})
								}
								className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="createdAt">Date</option>
								<option value="likesCount">Most Liked</option>
								<option value="commentsCount">
									Most Commented
								</option>
							</select>
						)}
					</div>
				</form>

				{/* Search Type Tabs */}
				<div className="bg-white rounded-lg shadow-sm overflow-hidden">
					<div className="border-b border-gray-200">
						<nav className="flex">
							<button
								onClick={() => setSearchType("posts")}
								className={`px-6 py-3 text-sm font-medium transition-colors ${
									searchType === "posts"
										? "border-b-2 border-blue-500 text-blue-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Travel Posts
							</button>
							<button
								onClick={() => setSearchType("users")}
								className={`px-6 py-3 text-sm font-medium transition-colors ${
									searchType === "users"
										? "border-b-2 border-blue-500 text-blue-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Travelers
							</button>
						</nav>
					</div>

					<div className="p-6">
						{/* Loading State */}
						{isLoading && (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{[...Array(6)].map((_, i) => (
									<div
										key={i}
										className="bg-gray-50 rounded-lg p-6 animate-pulse"
									>
										<div className="h-4 bg-gray-200 rounded mb-2"></div>
										<div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
										<div className="h-20 bg-gray-200 rounded"></div>
									</div>
								))}
							</div>
						)}

						{/* No Search Query */}
						{!hasActiveFilters && !isLoading && (
							<div className="text-center py-12">
								<MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-500 mb-4">
									Enter a search term or select a country to
									find travel stories and fellow travelers
								</p>
							</div>
						)}

						{/* Blog Posts Results */}
						{searchType === "posts" &&
							!isLoading &&
							hasActiveFilters && (
								<div>
									{blogResults?.blogPosts?.length > 0 ? (
										<>
											<p className="text-gray-600 mb-6">
												Found{" "}
												{
													blogResults.pagination
														.totalItems
												}{" "}
												travel posts
											</p>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
												{blogResults.blogPosts.map(
													(blog) => (
														<BlogCard
															key={blog.id}
															blog={blog}
														/>
													)
												)}
											</div>
										</>
									) : (
										<div className="text-center py-12">
											<MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
											<p className="text-gray-500 mb-4">
												No travel posts found matching
												your search
											</p>
											<p className="text-sm text-gray-400">
												Try different keywords or browse
												all countries
											</p>
										</div>
									)}
								</div>
							)}

						{/* Users Results */}
						{searchType === "users" &&
							!isLoading &&
							filters.query.length >= 2 && (
								<div>
									{userResults?.users?.length > 0 ? (
										<>
											<p className="text-gray-600 mb-6">
												Found{" "}
												{
													userResults.pagination
														.totalItems
												}{" "}
												travelers
											</p>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
												{userResults.users.map(
													(user) => (
														<Link
															key={user.id}
															to={`/user/${user.username}`}
															className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
														>
															<div className="flex items-center space-x-3 mb-3">
																{user.profileImage ? (
																	<img
																		src={
																			user.profileImage
																		}
																		alt={
																			user.username
																		}
																		className="w-12 h-12 rounded-full object-cover"
																	/>
																) : (
																	<UserCircleIcon className="w-12 h-12 text-gray-400" />
																)}
																<div>
																	<p className="font-semibold text-gray-900">
																		{user.firstName &&
																		user.lastName
																			? `${user.firstName} ${user.lastName}`
																			: user.username}
																	</p>
																	<p className="text-sm text-gray-500">
																		@
																		{
																			user.username
																		}
																	</p>
																</div>
															</div>
															{user.bio && (
																<p className="text-gray-600 text-sm line-clamp-2">
																	{user.bio}
																</p>
															)}
														</Link>
													)
												)}
											</div>
										</>
									) : (
										<div className="text-center py-12">
											<UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
											<p className="text-gray-500 mb-4">
												No travelers found matching "
												{filters.query}"
											</p>
											<p className="text-sm text-gray-400">
												Try a different username or name
											</p>
										</div>
									)}
								</div>
							)}

						{/* Minimum Query Length Message */}
						{searchType === "users" &&
							filters.query.length > 0 &&
							filters.query.length < 2 && (
								<div className="text-center py-12">
									<p className="text-gray-500">
										Enter at least 2 characters to search
										for travelers
									</p>
								</div>
							)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Search;
