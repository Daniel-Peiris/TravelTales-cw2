import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import Select from "react-select";
import api from "../../services/api";

const CountrySelector = ({
	value,
	onChange,
	placeholder = "Select a country...",
	isClearable = false,
	className = "",
}) => {
	const [searchTerm, setSearchTerm] = useState("");

	const { data: countriesData, isLoading } = useQuery(
		"countries-dropdown",
		async () => {
			const response = await api.get("/countries/list/dropdown");
			return response.data.countries;
		},
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 10 * 60 * 1000, // 10 minutes
		}
	);

	const options =
		countriesData?.map((country) => ({
			value: country.name,
			label: country.name,
			officialName: country.official_name,
		})) || [];

	const selectedOption = value ? { value, label: value } : null;

	const customStyles = {
		control: (provided, state) => ({
			...provided,
			borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
			boxShadow: state.isFocused
				? "0 0 0 2px rgba(59, 130, 246, 0.1)"
				: "none",
			"&:hover": {
				borderColor: "#3B82F6",
			},
		}),
		option: (provided, state) => ({
			...provided,
			backgroundColor: state.isSelected
				? "#3B82F6"
				: state.isFocused
				? "#EBF4FF"
				: "white",
			color: state.isSelected ? "white" : "#374151",
			"&:hover": {
				backgroundColor: state.isSelected ? "#3B82F6" : "#EBF4FF",
			},
		}),
		placeholder: (provided) => ({
			...provided,
			color: "#9CA3AF",
		}),
	};

	return (
		<div className={className}>
			<Select
				value={selectedOption}
				onChange={(option) => onChange(option?.value || "")}
				options={options}
				placeholder={placeholder}
				isClearable={isClearable}
				isLoading={isLoading}
				isSearchable
				styles={customStyles}
				className="react-select-container"
				classNamePrefix="react-select"
				noOptionsMessage={() => "No countries found"}
				loadingMessage={() => "Loading countries..."}
			/>
		</div>
	);
};

export default CountrySelector;
