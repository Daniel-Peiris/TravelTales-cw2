import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import CountryInfo from "../components/Country/CountryInfo";
import api from "../services/api";
import {
	HeartIcon,
	ChatBubbleLeftIcon,
	CalendarIcon,
	MapPinIcon,
	PencilIcon,
	TrashIcon,
	UserCircleIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const BlogPost = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [comment, setComment] = useState("");
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);

	// Fetch blog post
	const {
		data: blogPost,
		isLoading,
		error,
	} = useQuery(["blog", id], async () => {
		const response = await api.get(`/blogs/${id}`);
		return response.data;
	});

	// Like/Unlike mutation
	const likeMutation = useMutation(
		async ({ isLike }) => {
			const response = await api.post(`/blogs/${id}/like`, { isLike });
			return response.data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(["blog", id]);
				queryClient.invalidateQueries(["blogs"]);
			},
			onError: (error) => {
				toast.error(
					error.response?.data?.error || "Failed to update like"
				);
			},
		}
	);

	// Comment mutation
	const commentMutation = useMutation(
		async (content) => {
			const response = await api.post(`/blogs/${id}/comments`, {
				content,
			});
			return response.data;
		},
		{
			onSuccess: () => {
				setComment("");
				queryClient.invalidateQueries(["blog", id]);
				toast.success("Comment added successfully!");
			},
			onError: (error) => {
				toast.error(
					error.response?.data?.error || "Failed to add comment"
				);
			},
		}
	);

	// Delete blog mutation
	const deleteMutation = useMutation(
		async () => {
			await api.delete(`/blogs/${id}`);
		},
		{
			onSuccess: () => {
				toast.success("Blog post deleted successfully!");
				navigate("/");
			},
			onError: (error) => {
				toast.error(
					error.response?.data?.error || "Failed to delete post"
				);
			},
		}
	);

	const handleLike = (isLike) => {
		if (!user) {
			toast.error("Please login to like posts");
			return;
		}
		likeMutation.mutate({ isLike });
	};

	const handleComment = async (e) => {
		e.preventDefault();
		if (!user) {
			toast.error("Please login to comment");
			return;
		}
		if (!comment.trim()) return;

		setIsSubmittingComment(true);
		await commentMutation.mutateAsync(comment.trim());
		setIsSubmittingComment(false);
	};

	const handleDelete = () => {
		if (window.confirm("Are you sure you want to delete this post?")) {
			deleteMutation.mutate();
		}
	};

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
					<div className="h-8 bg-gray-200 rounded mb-4"></div>
					<div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
					<div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
					<div className="h-32 bg-gray-200 rounded mb-4"></div>
					<div className="space-y-2">
						<div className="h-4 bg-gray-200 rounded"></div>
						<div className="h-4 bg-gray-200 rounded"></div>
						<div className="h-4 bg-gray-200 rounded w-3/4"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !blogPost) {
		return (
			<div className="max-w-4xl mx-auto text-center py-12">
				<div className="text-red-500 mb-4">
					<p className="text-xl">Blog post not found</p>
					<p>
						{error?.response?.data?.error ||
							"This post may have been deleted or does not exist."}
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

	const timeAgo = formatDistanceToNow(new Date(blogPost.createdAt), {
		addSuffix: true,
	});
	const visitDateFormatted = new Date(blogPost.visitDate).toLocaleDateString(
		"en-US",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
		}
	);

	const isOwner = user && user.id === blogPost.author.id;

	return (
		<div className="max-w-4xl mx-auto">
			<article className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
				{/* Header */}
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center justify-between mb-4">
						<Link
							to={`/user/${blogPost.author.username}`}
							className="flex items-center space-x-3 hover:text-blue-600 transition-colors"
						>
							{blogPost.author.profileImage ? (
								<img
									src={blogPost.author.profileImage}
									alt={blogPost.author.username}
									className="w-12 h-12 rounded-full object-cover"
								/>
							) : (
								<UserCircleIcon className="w-12 h-12 text-gray-400" />
							)}
							<div>
								<p className="font-semibold text-gray-900">
									{blogPost.author.firstName &&
									blogPost.author.lastName
										? `${blogPost.author.firstName} ${blogPost.author.lastName}`
										: blogPost.author.username}
								</p>
								<p className="text-sm text-gray-500">
									{timeAgo}
								</p>
							</div>
						</Link>

						{isOwner && (
							<div className="flex space-x-2">
								<Link
									to={`/edit/${blogPost.id}`}
									className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
								>
									<PencilIcon className="h-5 w-5" />
								</Link>
								<button
									onClick={handleDelete}
									className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
									disabled={deleteMutation.isLoading}
								>
									<TrashIcon className="h-5 w-5" />
								</button>
							</div>
						)}
					</div>

					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						{blogPost.title}
					</h1>

					<div className="flex items-center space-x-6 text-sm text-gray-600">
						<div className="flex items-center space-x-1">
							<MapPinIcon className="h-4 w-4" />
							<span>{blogPost.country}</span>
						</div>
						<div className="flex items-center space-x-1">
							<CalendarIcon className="h-4 w-4" />
							<span>Visited on {visitDateFormatted}</span>
						</div>
					</div>
				</div>

				{/* Country Information */}
				<div className="p-6 border-b border-gray-200">
					<CountryInfo countryName={blogPost.country} />
				</div>

				{/* Images */}
				{blogPost.images && blogPost.images.length > 0 && (
					<div className="border-b border-gray-200">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
							{blogPost.images.map((image, index) => (
								<img
									key={index}
									src={image}
									alt={`${blogPost.title} - Image ${
										index + 1
									}`}
									className="w-full h-64 object-cover rounded-lg"
								/>
							))}
						</div>
					</div>
				)}

				{/* Content */}
				<div className="p-6 border-b border-gray-200">
					<div className="prose max-w-none">
						{blogPost.content
							.split("\n")
							.map((paragraph, index) => (
								<p
									key={index}
									className="mb-4 text-gray-700 leading-relaxed"
								>
									{paragraph}
								</p>
							))}
					</div>

					{/* Tags */}
					{blogPost.tags && blogPost.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-6">
							{blogPost.tags.map((tag, index) => (
								<span
									key={index}
									className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
								>
									#{tag}
								</span>
							))}
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center space-x-6">
						<div className="flex items-center space-x-2">
							<button
								onClick={() => handleLike(true)}
								disabled={likeMutation.isLoading || !user}
								className={`p-2 rounded-lg transition-colors ${
									blogPost.userLiked === true
										? "text-red-500 bg-red-50"
										: "text-gray-600 hover:text-red-500 hover:bg-red-50"
								} ${
									!user ? "cursor-not-allowed opacity-50" : ""
								}`}
							>
								{blogPost.userLiked === true ? (
									<HeartSolid className="h-6 w-6" />
								) : (
									<HeartIcon className="h-6 w-6" />
								)}
							</button>
							<span className="text-gray-600">
								{blogPost.likesCount} likes
							</span>
						</div>

						<div className="flex items-center space-x-2">
							<ChatBubbleLeftIcon className="h-6 w-6 text-gray-600" />
							<span className="text-gray-600">
								{blogPost.commentsCount} comments
							</span>
						</div>
					</div>
				</div>

				{/* Comments Section */}
				<div className="p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Comments
					</h3>

					{/* Add Comment Form */}
					{user ? (
						<form onSubmit={handleComment} className="mb-6">
							<textarea
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								placeholder="Share your thoughts about this travel story..."
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
								maxLength={1000}
							/>
							<div className="flex justify-between items-center mt-2">
								<span className="text-sm text-gray-500">
									{comment.length}/1000
								</span>
								<button
									type="submit"
									disabled={
										isSubmittingComment || !comment.trim()
									}
									className={`px-4 py-2 text-white rounded-lg transition-colors ${
										isSubmittingComment || !comment.trim()
											? "bg-gray-400 cursor-not-allowed"
											: "bg-blue-600 hover:bg-blue-700"
									}`}
								>
									{isSubmittingComment
										? "Posting..."
										: "Post Comment"}
								</button>
							</div>
						</form>
					) : (
						<div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
							<p className="text-gray-600 mb-2">
								Join the conversation!
							</p>
							<Link
								to="/login"
								className="text-blue-600 hover:text-blue-700 font-medium"
							>
								Sign in to comment
							</Link>
						</div>
					)}

					{/* Comments List */}
					<div className="space-y-4">
						{blogPost.comments && blogPost.comments.length > 0 ? (
							blogPost.comments.map((comment) => (
								<div
									key={comment.id}
									className="border-l-2 border-gray-200 pl-4"
								>
									<div className="flex items-start space-x-3">
										<Link
											to={`/user/${comment.author.username}`}
										>
											{comment.author.profileImage ? (
												<img
													src={
														comment.author
															.profileImage
													}
													alt={
														comment.author.username
													}
													className="w-8 h-8 rounded-full object-cover"
												/>
											) : (
												<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
													<span className="text-xs font-medium text-gray-600">
														{comment.author.username
															.charAt(0)
															.toUpperCase()}
													</span>
												</div>
											)}
										</Link>
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-1">
												<Link
													to={`/user/${comment.author.username}`}
													className="font-medium text-gray-900 hover:text-blue-600"
												>
													{comment.author.firstName &&
													comment.author.lastName
														? `${comment.author.firstName} ${comment.author.lastName}`
														: comment.author
																.username}
												</Link>
												<span className="text-sm text-gray-500">
													{formatDistanceToNow(
														new Date(
															comment.createdAt
														),
														{ addSuffix: true }
													)}
												</span>
											</div>
											<p className="text-gray-700">
												{comment.content}
											</p>
										</div>
									</div>
								</div>
							))
						) : (
							<p className="text-gray-500 text-center py-8">
								No comments yet. Be the first to share your
								thoughts!
							</p>
						)}
					</div>
				</div>
			</article>
		</div>
	);
};

export default BlogPost;
