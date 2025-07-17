import express from "express";
import axios from "axios";

const router = express.Router();

// Countries API URL
const COUNTRIES_API_URL =
	process.env.COUNTRIES_API_URL || "http://localhost:5000/api";
const COUNTRIES_API_KEY = process.env.COUNTRIES_API_KEY;

// Create axios instance for countries API
const countriesAPI = axios.create({
	baseURL: COUNTRIES_API_URL,
	timeout: 10000,
	headers: COUNTRIES_API_KEY ? { "X-API-Key": COUNTRIES_API_KEY } : {},
});

// Get all countries
router.get("/", async (req, res) => {
	try {
		// Try to get from countries api microservice first
		if (COUNTRIES_API_KEY) {
			try {
				const response = await countriesAPI.get("/countries");
				return res.json(response.data);
			} catch (error) {
				console.log(
					"CW1 API unavailable, falling back to RestCountries"
				);
			}
		}

		// Fallback to RestCountries directly
		const response = await axios.get(
			"https://restcountries.com/v3.1/all?fields=name,currencies,capital,languages,flags",
			{ timeout: 10000 }
		);

		const countries = response.data.map((country) => ({
			name: country.name?.common || "N/A",
			official_name: country.name?.official || "N/A",
			capital: country.capital?.[0] || "N/A",
			currencies: country.currencies || {},
			languages: country.languages || {},
			flag: country.flags?.png || "N/A",
		}));

		res.json({
			status: "success",
			count: countries.length,
			data: countries,
		});
	} catch (error) {
		console.error("Get countries error:", error);
		res.status(500).json({
			error: "Failed to retrieve countries data",
			details: error.message,
		});
	}
});

// Get country by name
router.get("/:name", async (req, res) => {
	try {
		const { name } = req.params;

		// Try to get from countries api microservice first
		if (COUNTRIES_API_KEY) {
			try {
				const response = await countriesAPI.get(
					`/countries/${encodeURIComponent(name)}`
				);
				return res.json(response.data);
			} catch (error) {
				console.log(
					"CW1 API unavailable, falling back to RestCountries"
				);
			}
		}

		// Fallback to RestCountries directly
		const response = await axios.get(
			`https://restcountries.com/v3.1/name/${encodeURIComponent(
				name
			)}?fields=name,currencies,capital,languages,flags`,
			{ timeout: 10000 }
		);

		const countries = response.data.map((country) => ({
			name: country.name?.common || "N/A",
			official_name: country.name?.official || "N/A",
			capital: country.capital?.[0] || "N/A",
			currencies: country.currencies || {},
			languages: country.languages || {},
			flag: country.flags?.png || "N/A",
		}));

		res.json({
			status: "success",
			count: countries.length,
			data: countries,
		});
	} catch (error) {
		if (error.response?.status === 404) {
			return res.status(404).json({
				error: "Country not found",
				status: 404,
			});
		}

		console.error("Get country error:", error);
		res.status(500).json({
			error: "Failed to retrieve country data",
			details: error.message,
		});
	}
});

// Get countries for dropdown (simplified list)
router.get("/list/dropdown", async (req, res) => {
	try {
		// Try to get from countries api microservice first
		if (COUNTRIES_API_KEY) {
			try {
				const response = await countriesAPI.get("/countries");
				const countries = response.data.data
					.map((country) => ({
						name: country.name,
						official_name: country.official_name,
					}))
					.sort((a, b) => a.name.localeCompare(b.name));

				return res.json({ countries });
			} catch (error) {
				console.log(
					"CW1 API unavailable, falling back to RestCountries"
				);
			}
		}

		// Fallback to RestCountries directly
		const response = await axios.get(
			"https://restcountries.com/v3.1/all?fields=name",
			{ timeout: 10000 }
		);

		const countries = response.data
			.map((country) => ({
				name: country.name?.common || "N/A",
				official_name: country.name?.official || "N/A",
			}))
			.sort((a, b) => a.name.localeCompare(b.name));

		res.json({ countries });
	} catch (error) {
		console.error("Get countries dropdown error:", error);
		res.status(500).json({
			error: "Failed to retrieve countries list",
			details: error.message,
		});
	}
});

export default router;
