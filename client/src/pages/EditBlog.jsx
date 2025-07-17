import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import CountrySelector from "../components/Country/CountrySelector";
import CountryInfo from "../components/Country/CountryInfo";
import api from "../services/api";

const EditBlog = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [selectedCountry, setSelectedCountry] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
		reset,
	} = useForm();

	// Fetch blog post
	const {
		data: blogPost,
		isLoading,
		error,
	} = useQuery(["blog", id], async () => {
		const response = await api.get(`/blogs/${id}`);
		return response.data;
	});

	// Populate form when data loads
	useEffect(() => {
		if (blogPost) {
			// Check if user owns this post
			if (blogPost.author.id !== user?.id) {
				toast.error("You can only edit your own posts");
				navigate("/");
				return;
			}

			reset({
				title: blogPost.title,
				content: blogPost.content,
				visitDate: blogPost.visitDate,
				tags: blogPost.tags ? blogPost.tags.join(", ") : "",
			});
			setSelectedCountry(blogPost.country);
		}
	}, [blogPost, user, navigate, reset]);

	const content = watch("content", "");

	const onSubmit = async (data) => {
		if (!selectedCountry) {
			toast.error("Please select a country");
			return;
		}

		setIsSubmitting(true);
		try {
			const blogData = {
				...data,
				country: selectedCountry,
				tags: data.tags
					? data.tags
							.split(",")
							.map((tag) => tag.trim())
							.filter(Boolean)
					: [],
			};

			await api.put(`/blogs/${id}`, blogData);
			toast.success("Blog post updated successfully!");
			navigate(`/blog/${id}`);
		} catch (error) {
			toast.error(
				error.response?.data?.error || "Failed to update blog post"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
					<div className="h-8 bg-gray-200 rounded mb-4"></div>
					<div className="space-y-4">
						<div className="h-10 bg-gray-200 rounded"></div>
						<div className="h-10 bg-gray-200 rounded"></div>
						<div className="h-32 bg-gray-200 rounded"></div>
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
							"This post may have been deleted."}
					</p>
				</div>
				<button
					onClick={() => navigate(-1)}
					className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
				>
					Go Back
				</button>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto">
			<div className="bg-white rounded-lg shadow-sm p-6">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Edit Your Travel Story
				</h1>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Title */}
					<div>
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Post Title *
						</label>
						<input
							id="title"
							type="text"
							{...register("title", {
								required: "Title is required",
								minLength: {
									value: 5,
									message:
										"Title must be at least 5 characters",
								},
								maxLength: {
									value: 200,
									message:
										"Title must not exceed 200 characters",
								},
							})}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.title
									? "border-red-300"
									: "border-gray-300"
							}`}
							placeholder="Enter an engaging title for your travel story"
						/>
						{errors.title && (
							<p className="mt-1 text-sm text-red-600">
								{errors.title.message}
							</p>
						)}
					</div>

					{/* Country Selection */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Country Visited *
						</label>
						<CountrySelector
							value={selectedCountry}
							onChange={setSelectedCountry}
							placeholder="Select the country you visited"
						/>
						{!selectedCountry && (
							<p className="mt-1 text-sm text-red-600">
								Please select a country
							</p>
						)}
					</div>

					{/* Country Info Display */}
					{selectedCountry && (
						<CountryInfo countryName={selectedCountry} />
					)}

					{/* Visit Date */}
					<div>
						<label
							htmlFor="visitDate"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Date of Visit *
						</label>
						<input
							id="visitDate"
							type="date"
							{...register("visitDate", {
								required: "Visit date is required",
								validate: (value) => {
									const date = new Date(value);
									const today = new Date();
									return (
										date <= today ||
										"Visit date cannot be in the future"
									);
								},
							})}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.visitDate
									? "border-red-300"
									: "border-gray-300"
							}`}
							max={new Date().toISOString().split("T")[0]}
						/>
						{errors.visitDate && (
							<p className="mt-1 text-sm text-red-600">
								{errors.visitDate.message}
							</p>
						)}
					</div>

					{/* Content */}
					<div>
						<label
							htmlFor="content"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Your Story *
						</label>
						<textarea
							id="content"
							rows={12}
							{...register("content", {
								required: "Content is required",
								minLength: {
									value: 10,
									message:
										"Content must be at least 10 characters",
								},
								maxLength: {
									value: 50000,
									message:
										"Content must not exceed 50,000 characters",
								},
							})}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
								errors.content
									? "border-red-300"
									: "border-gray-300"
							}`}
							placeholder="Share your travel experience, what you saw, what you learned, memorable moments..."
						/>
						<div className="flex justify-between items-center mt-1">
							{errors.content ? (
								<p className="text-sm text-red-600">
									{errors.content.message}
								</p>
							) : (
								<div></div>
							)}
							<p className="text-sm text-gray-500">
								{content.length}/50,000 characters
							</p>
						</div>
					</div>

					{/* Tags */}
					<div>
						<label
							htmlFor="tags"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Tags (Optional)
						</label>
						<input
							id="tags"
							type="text"
							{...register("tags")}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="adventure, culture, food, nature (separate with commas)"
						/>
						<p className="mt-1 text-sm text-gray-500">
							Add tags to help others discover your post (separate
							with commas)
						</p>
					</div>

					{/* Submit Buttons */}
					<div className="flex justify-end space-x-4 pt-6">
						<button
							type="button"
							onClick={() => navigate(`/blog/${id}`)}
							className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className={`px-6 py-2 text-white rounded-lg transition-colors ${
								isSubmitting
									? "bg-gray-400 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700"
							}`}
						>
							{isSubmitting ? (
								<div className="flex items-center">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Updating...
								</div>
							) : (
								"Update Story"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditBlog;
