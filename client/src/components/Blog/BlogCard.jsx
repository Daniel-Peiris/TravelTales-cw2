import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
	HeartIcon,
	ChatBubbleLeftIcon,
	CalendarIcon,
	MapPinIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const BlogCard = ({ blog }) => {
	const {
		id,
		title,
		content,
		country,
		visitDate,
		likesCount,
		commentsCount,
		createdAt,
		author,
		userLiked,
		images,
	} = blog;

	const excerpt =
		content.length > 150 ? content.substring(0, 150) + "..." : content;
	const timeAgo = formatDistanceToNow(new Date(createdAt), {
		addSuffix: true,
	});
	const visitDateFormatted = new Date(visitDate).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
			{/* Image */}
			{images && images.length > 0 && (
				<div className="h-48 overflow-hidden">
					<img
						src={images[0]}
						alt={title}
						className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
					/>
				</div>
			)}

			<div className="p-6">
				{/* Author and Date */}
				<div className="flex items-center mb-3">
					<Link
						to={`/user/${author.username}`}
						className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
					>
						{author.profileImage ? (
							<img
								src={author.profileImage}
								alt={author.username}
								className="w-8 h-8 rounded-full object-cover"
							/>
						) : (
							<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
								<span className="text-sm font-medium text-gray-600">
									{author.username.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
						<div>
							<p className="text-sm font-medium text-gray-900">
								{author.firstName && author.lastName
									? `${author.firstName} ${author.lastName}`
									: author.username}
							</p>
							<p className="text-xs text-gray-500">{timeAgo}</p>
						</div>
					</Link>
				</div>

				{/* Title */}
				<Link to={`/blog/${id}`}>
					<h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
						{title}
					</h3>
				</Link>

				{/* Country and Visit Date */}
				<div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
					<div className="flex items-center space-x-1">
						<MapPinIcon className="h-4 w-4" />
						<span>{country}</span>
					</div>
					<div className="flex items-center space-x-1">
						<CalendarIcon className="h-4 w-4" />
						<span>{visitDateFormatted}</span>
					</div>
				</div>

				{/* Excerpt */}
				<p className="text-gray-600 text-sm mb-4 line-clamp-3">
					{excerpt}
				</p>

				{/* Stats */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-1">
							{userLiked ? (
								<HeartSolid className="h-5 w-5 text-red-500" />
							) : (
								<HeartIcon className="h-5 w-5 text-gray-400" />
							)}
							<span className="text-sm text-gray-600">
								{likesCount}
							</span>
						</div>
						<div className="flex items-center space-x-1">
							<ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
							<span className="text-sm text-gray-600">
								{commentsCount}
							</span>
						</div>
					</div>

					<Link
						to={`/blog/${id}`}
						className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
					>
						Read more
					</Link>
				</div>
			</div>
		</div>
	);
};

export default BlogCard;
