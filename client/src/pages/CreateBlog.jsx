import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import CountrySelector from "../components/Country/CountrySelector.jsx";
import CountryInfo from "../components/Country/CountryInfo.jsx";
import api from "../services/api.js";

const CreateBlog = () => {
	const navigate = useNavigate();
	const [selectedCountry, setSelectedCountry] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm();

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

			const response = await api.post("/blogs", blogData);
			toast.success("Blog post created successfully!");
			navigate(`/blog/${response.data.blogPost.id}`);
		} catch (error) {
			toast.error(
				error.response?.data?.error || "Failed to create blog post"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="bg-white rounded-lg shadow-sm p-6">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Share Your Travel Story
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
							onClick={() => navigate(-1)}
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
									Publishing...
								</div>
							) : (
								"Publish Story"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateBlog;
