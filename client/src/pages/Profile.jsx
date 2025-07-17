// src/pages/Profile.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import BlogCard from "../components/Blog/BlogCard";
import api from "../services/api";
import {
	UserCircleIcon,
	MapPinIcon,
	CalendarIcon,
	UserPlusIcon,
	UserMinusIcon,
	PencilIcon,
} from "@heroicons/react/24/outline";

const Profile = () => {
	const { username } = useParams();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("posts");
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [profileData, setProfileData] = useState({
		firstName: "",
		lastName: "",
		bio: "",
	});

	const isOwnProfile = user && user.username === username;

	// Fetch user profile
	const {
		data: profile,
		isLoading: profileLoading,
		error: profileError,
	} = useQuery(["profile", username], async () => {
		const response = await api.get(`/users/${username}`);
		return response.data;
	});

	// Fetch user's blog posts
	const { data: userBlogs, isLoading: blogsLoading } = useQuery(
		["userBlogs", username],
		async () => {
			const response = await api.get(
				`/blogs?author=${username}&limit=20`
			);
			return response.data;
		},
		{ enabled: !!username }
	);

	// Follow/Unfollow mutation
	const followMutation = useMutation(
		async () => {
			const response = await api.post(`/users/${username}/follow`);
			return response.data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(["profile", username]);
				toast.success("Follow status updated!");
			},
			onError: (error) => {
				toast.error(
					error.response?.data?.error ||
						"Failed to update follow status"
				);
			},
		}
	);

	// Update profile mutation
	const updateProfileMutation = useMutation(
		async (data) => {
			const response = await api.put("/auth/profile", data);
			return response.data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(["profile", username]);
				setIsEditingProfile(false);
				toast.success("Profile updated successfully!");
			},
			onError: (error) => {
				toast.error(
					error.response?.data?.error || "Failed to update profile"
				);
			},
		}
	);

	React.useEffect(() => {
		if (profile && isOwnProfile) {
			setProfileData({
				firstName: profile.firstName || "",
				lastName: profile.lastName || "",
				bio: profile.bio || "",
			});
		}
	}, [profile, isOwnProfile]);

	const handleFollow = () => {
		if (!user) {
			toast.error("Please login to follow users");
			return;
		}
		followMutation.mutate();
	};

	const handleProfileUpdate = (e) => {
		e.preventDefault();
		updateProfileMutation.mutate(profileData);
	};

	if (profileLoading) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
					<div className="flex items-center space-x-4 mb-6">
						<div className="w-24 h-24 bg-gray-200 rounded-full"></div>
						<div className="flex-1">
							<div className="h-6 bg-gray-200 rounded mb-2 w-1/3"></div>
							<div className="h-4 bg-gray-200 rounded w-1/4"></div>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4 mb-6">
						<div className="h-16 bg-gray-200 rounded"></div>
						<div className="h-16 bg-gray-200 rounded"></div>
						<div className="h-16 bg-gray-200 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (profileError || !profile) {
		return (
			<div className="max-w-4xl mx-auto text-center py-12">
				<div className="text-red-500 mb-4">
					<p className="text-xl">User not found</p>
					<p>
						{profileError?.response?.data?.error ||
							"This user may not exist."}
					</p>
				</div>
				<Link
					to="/"
					className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
				>
					Back to Home
				</Link>
			</div>
		);
	}

	const joinDate = formatDistanceToNow(new Date(profile.createdAt), {
		addSuffix: true,
	});

	return (
		<div className="max-w-4xl mx-auto">
			{/* Profile Header */}
			<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
				<div className="flex items-start justify-between mb-6">
					<div className="flex items-center space-x-4">
						{profile.profileImage ? (
							<img
								src={profile.profileImage}
								alt={profile.username}
								className="w-24 h-24 rounded-full object-cover"
							/>
						) : (
							<UserCircleIcon className="w-24 h-24 text-gray-400" />
						)}
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								{profile.firstName && profile.lastName
									? `${profile.firstName} ${profile.lastName}`
									: profile.username}
							</h1>
							<p className="text-gray-600">@{profile.username}</p>
							<p className="text-sm text-gray-500 flex items-center mt-1">
								<CalendarIcon className="h-4 w-4 mr-1" />
								Joined {joinDate}
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex space-x-2">
						{isOwnProfile ? (
							<button
								onClick={() =>
									setIsEditingProfile(!isEditingProfile)
								}
								className="flex items-center space-x-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<PencilIcon className="h-4 w-4" />
								<span>Edit Profile</span>
							</button>
						) : (
							<button
								onClick={handleFollow}
								disabled={followMutation.isLoading}
								className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
									profile.isFollowing
										? "bg-gray-200 text-gray-700 hover:bg-gray-300"
										: "bg-blue-600 text-white hover:bg-blue-700"
								}`}
							>
								{profile.isFollowing ? (
									<>
										<UserMinusIcon className="h-4 w-4" />
										<span>Unfollow</span>
									</>
								) : (
									<>
										<UserPlusIcon className="h-4 w-4" />
										<span>Follow</span>
									</>
								)}
							</button>
						)}
					</div>
				</div>

				{/* Bio */}
				{!isEditingProfile ? (
					profile.bio && (
						<div className="mb-6">
							<p className="text-gray-700">{profile.bio}</p>
						</div>
					)
				) : (
					<form
						onSubmit={handleProfileUpdate}
						className="mb-6 space-y-4"
					>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									First Name
								</label>
								<input
									type="text"
									value={profileData.firstName}
									onChange={(e) =>
										setProfileData((prev) => ({
											...prev,
											firstName: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Your first name"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Last Name
								</label>
								<input
									type="text"
									value={profileData.lastName}
									onChange={(e) =>
										setProfileData((prev) => ({
											...prev,
											lastName: e.target.value,
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Your last name"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Bio
							</label>
							<textarea
								value={profileData.bio}
								onChange={(e) =>
									setProfileData((prev) => ({
										...prev,
										bio: e.target.value,
									}))
								}
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Tell us about yourself..."
								maxLength={500}
							/>
							<p className="text-sm text-gray-500 mt-1">
								{profileData.bio.length}/500
							</p>
						</div>
						<div className="flex space-x-2">
							<button
								type="submit"
								disabled={updateProfileMutation.isLoading}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
							>
								{updateProfileMutation.isLoading
									? "Saving..."
									: "Save Changes"}
							</button>
							<button
								type="button"
								onClick={() => setIsEditingProfile(false)}
								className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
						</div>
					</form>
				)}

				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 text-center">
					<div className="bg-gray-50 rounded-lg p-4">
						<p className="text-2xl font-bold text-gray-900">
							{userBlogs?.pagination?.totalItems || 0}
						</p>
						<p className="text-sm text-gray-600">Posts</p>
					</div>
					<div className="bg-gray-50 rounded-lg p-4">
						<p className="text-2xl font-bold text-gray-900">
							{profile.followerCount || 0}
						</p>
						<p className="text-sm text-gray-600">Followers</p>
					</div>
					<div className="bg-gray-50 rounded-lg p-4">
						<p className="text-2xl font-bold text-gray-900">
							{profile.followingCount || 0}
						</p>
						<p className="text-sm text-gray-600">Following</p>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="bg-white rounded-lg shadow-sm overflow-hidden">
				<div className="border-b border-gray-200">
					<nav className="flex">
						<button
							onClick={() => setActiveTab("posts")}
							className={`px-6 py-3 text-sm font-medium transition-colors ${
								activeTab === "posts"
									? "border-b-2 border-blue-500 text-blue-600"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							Posts ({userBlogs?.pagination?.totalItems || 0})
						</button>
					</nav>
				</div>

				<div className="p-6">
					{activeTab === "posts" && (
						<div>
							{blogsLoading ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{[...Array(4)].map((_, i) => (
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
							) : userBlogs?.blogPosts?.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{userBlogs.blogPosts.map((blog) => (
										<BlogCard key={blog.id} blog={blog} />
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-500 mb-4">
										{isOwnProfile
											? "You haven't shared any travel stories yet"
											: `${profile.username} hasn't shared any travel stories yet`}
									</p>
									{isOwnProfile && (
										<Link
											to="/create"
											className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
										>
											Share Your First Story
										</Link>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Profile;
