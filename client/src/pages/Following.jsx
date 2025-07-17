import React, { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import BlogCard from "../components/Blog/BlogCard";
import api from "../services/api";
import { UserGroupIcon, MapPinIcon } from "@heroicons/react/24/outline";

const Following = () => {
	const { user } = useAuth();
	const [page, setPage] = useState(1);

	// Fetch following feed
	const {
		data: feedData,
		isLoading,
		error,
	} = useQuery(
		["followingFeed", page],
		async () => {
			const response = await api.get(
				`/blogs/feed/following?page=${page}&limit=10`
			);
			return response.data;
		},
		{ keepPreviousData: true }
	);

	// Fetch user's following list
	const { data: followingData } = useQuery(
		["userFollowing", user?.username],
		async () => {
			const response = await api.get(
				`/users/${user.username}/following?limit=5`
			);
			return response.data;
		},
		{ enabled: !!user }
	);

	if (isLoading && page === 1) {
		return (
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<div className="space-y-6">
							{[...Array(3)].map((_, i) => (
								<div
									key={i}
									className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
								>
									<div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
									<div className="h-4 bg-gray-200 rounded mb-2"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2"></div>
								</div>
							))}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow-sm p-6 h-fit animate-pulse">
						<div className="h-6 bg-gray-200 rounded mb-4"></div>
						<div className="space-y-3">
							{[...Array(3)].map((_, i) => (
								<div
									key={i}
									className="flex items-center space-x-3"
								>
									<div className="w-10 h-10 bg-gray-200 rounded-full"></div>
									<div className="flex-1 h-4 bg-gray-200 rounded"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-4xl mx-auto text-center py-12">
				<div className="text-red-500 mb-4">
					<p className="text-xl">Failed to load your feed</p>
					<p>
						{error.response?.data?.error ||
							"Please try again later"}
					</p>
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
		<div className="max-w-6xl mx-auto">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Feed */}
				<div className="lg:col-span-2">
					<div className="mb-6">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Your Feed
						</h1>
						<p className="text-gray-600">
							Latest travel stories from people you follow
						</p>
					</div>

					{feedData?.blogPosts?.length > 0 ? (
						<>
							<div className="space-y-6 mb-8">
								{feedData.blogPosts.map((blog) => (
									<BlogCard key={blog.id} blog={blog} />
								))}
							</div>

							{/* Pagination */}
							{feedData.pagination.totalPages > 1 && (
								<div className="flex justify-center items-center space-x-2">
									<button
										onClick={() => setPage(page - 1)}
										disabled={!feedData.pagination.hasPrev}
										className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
									>
										Previous
									</button>

									<span className="px-4 py-2 text-gray-700">
										Page {feedData.pagination.currentPage}{" "}
										of {feedData.pagination.totalPages}
									</span>

									<button
										onClick={() => setPage(page + 1)}
										disabled={!feedData.pagination.hasNext}
										className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
									>
										Next
									</button>
								</div>
							)}
						</>
					) : (
						<div className="text-center py-12">
							<UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Your feed is empty
							</h3>
							<p className="text-gray-500 mb-6 max-w-md mx-auto">
								{followingData?.following?.length > 0
									? "The people you follow haven't shared any travel stories yet. Check back later!"
									: "Start following other travelers to see their latest adventures here."}
							</p>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Link
									to="/search"
									className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									Discover Travelers
								</Link>
								<Link
									to="/create"
									className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
								>
									Share Your Story
								</Link>
							</div>
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Following List */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-gray-900">
								Following
							</h2>
							{followingData?.pagination?.totalItems > 5 && (
								<Link
									to={`/user/${user?.username}`}
									className="text-blue-600 hover:text-blue-700 text-sm font-medium"
								>
									View All
								</Link>
							)}
						</div>

						{followingData?.following?.length > 0 ? (
							<div className="space-y-3">
								{followingData.following
									.slice(0, 5)
									.map((followedUser) => (
										<Link
											key={followedUser.id}
											to={`/user/${followedUser.username}`}
											className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
										>
											{followedUser.profileImage ? (
												<img
													src={
														followedUser.profileImage
													}
													alt={followedUser.username}
													className="w-10 h-10 rounded-full object-cover"
												/>
											) : (
												<div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
													<span className="text-sm font-medium text-gray-600">
														{followedUser.username
															.charAt(0)
															.toUpperCase()}
													</span>
												</div>
											)}
											<div className="flex-1 min-w-0">
												<p className="font-medium text-gray-900 truncate">
													{followedUser.firstName &&
													followedUser.lastName
														? `${followedUser.firstName} ${followedUser.lastName}`
														: followedUser.username}
												</p>
												<p className="text-sm text-gray-500 truncate">
													@{followedUser.username}
												</p>
											</div>
										</Link>
									))}
							</div>
						) : (
							<div className="text-center py-6">
								<UserGroupIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
								<p className="text-gray-500 text-sm">
									You're not following anyone yet
								</p>
								<Link
									to="/search"
									className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
								>
									Find people to follow
								</Link>
							</div>
						)}
					</div>

					{/* Quick Actions */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							Quick Actions
						</h2>
						<div className="space-y-3">
							<Link
								to="/create"
								className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
							>
								Share New Story
							</Link>
							<Link
								to="/search"
								className="block w-full px-4 py-3 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
							>
								Discover Content
							</Link>
							<Link
								to={`/user/${user?.username}`}
								className="block w-full px-4 py-3 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
							>
								View My Profile
							</Link>
						</div>
					</div>

					{/* Popular Countries */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							Trending Destinations
						</h2>
						<div className="space-y-2">
							{[
								"Japan",
								"Italy",
								"France",
								"Thailand",
								"Spain",
							].map((country) => (
								<Link
									key={country}
									to={`/search?country=${encodeURIComponent(
										country
									)}`}
									className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
								>
									<MapPinIcon className="h-4 w-4 text-gray-400" />
									<span className="text-gray-700 text-sm">
										{country}
									</span>
								</Link>
							))}
						</div>
						<Link
							to="/search"
							className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3 inline-block"
						>
							Explore all destinations →
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Following;
