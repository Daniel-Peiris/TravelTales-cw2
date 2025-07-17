import React from "react";
import { useQuery } from "react-query";
import api from "../../services/api";

const CountryInfo = ({ countryName, className = "" }) => {
	const {
		data: countryData,
		isLoading,
		error,
	} = useQuery(
		["country", countryName],
		async () => {
			const response = await api.get(
				`/countries/${encodeURIComponent(countryName)}`
			);
			return response.data.data[0]; // Get first match
		},
		{
			enabled: !!countryName,
			staleTime: 5 * 60 * 1000, // 5 minutes
		}
	);

	if (!countryName) return null;

	if (isLoading) {
		return (
			<div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
					<div className="h-16 bg-gray-200 rounded mb-2"></div>
					<div className="h-4 bg-gray-200 rounded w-3/4"></div>
				</div>
			</div>
		);
	}

	if (error || !countryData) {
		return (
			<div
				className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
			>
				<p className="text-red-600 text-sm">
					Unable to load country information for {countryName}
				</p>
			</div>
		);
	}

	const currencies = Object.entries(countryData.currencies || {});
	const languages = Object.values(countryData.languages || {});

	return (
		<div
			className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
		>
			<div className="flex items-start space-x-4">
				{/* Flag */}
				{countryData.flag && countryData.flag !== "N/A" && (
					<img
						src={countryData.flag}
						alt={`${countryData.name} flag`}
						className="w-16 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
					/>
				)}

				{/* Country Details */}
				<div className="flex-1 min-w-0">
					<h4 className="font-semibold text-gray-900 mb-2">
						{countryData.name}
						{countryData.official_name &&
							countryData.official_name !== countryData.name && (
								<span className="text-sm text-gray-600 font-normal ml-2">
									({countryData.official_name})
								</span>
							)}
					</h4>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
						{/* Capital */}
						{countryData.capital &&
							countryData.capital !== "N/A" && (
								<div>
									<span className="font-medium text-gray-700">
										Capital:
									</span>
									<span className="ml-1 text-gray-600">
										{countryData.capital}
									</span>
								</div>
							)}

						{/* Currencies */}
						{currencies.length > 0 && (
							<div>
								<span className="font-medium text-gray-700">
									Currency:
								</span>
								<span className="ml-1 text-gray-600">
									{currencies
										.map(
											([code, currency]) =>
												`${currency.name} (${
													currency.symbol || code
												})`
										)
										.join(", ")}
								</span>
							</div>
						)}

						{/* Languages */}
						{languages.length > 0 && (
							<div className="sm:col-span-2">
								<span className="font-medium text-gray-700">
									Languages:
								</span>
								<span className="ml-1 text-gray-600">
									{languages.join(", ")}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CountryInfo;
