const axios = require('axios');

// Simple in-memory cache
const cache = {
    provinces: null,
    cities: {}, // key: provinceCode
    barangays: {} // key: cityCode
};

const API_BASE = 'https://psgc.gitlab.io/api';

class AddressController {
    static async getProvinces(req, res) {
        try {
            if (cache.provinces) {
                return res.json(cache.provinces);
            }

            const response = await axios.get(`${API_BASE}/provinces/`);
            // Sort alphabetically for better UX
            const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));

            cache.provinces = sorted;
            res.json(sorted);
        } catch (error) {
            console.error('Error fetching provinces:', error.message);
            res.status(500).json({ error: 'Failed to fetch provinces' });
        }
    }

    static async getCities(req, res) {
        try {
            const { provinceCode } = req.query;
            if (!provinceCode) {
                return res.status(400).json({ error: 'Province code is required' });
            }

            if (cache.cities[provinceCode]) {
                return res.json(cache.cities[provinceCode]);
            }

            // Fetch cities and municipalities (PSGC splits them sometimes, but usually this endpoint gets both for a province)
            const response = await axios.get(`${API_BASE}/provinces/${provinceCode}/cities-municipalities/`);
            const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));

            cache.cities[provinceCode] = sorted;
            res.json(sorted);
        } catch (error) {
            console.error(`Error fetching cities for province ${req.query.provinceCode}:`, error.message);
            res.status(500).json({ error: 'Failed to fetch cities' });
        }
    }

    static async getBarangays(req, res) {
        try {
            const { cityCode } = req.query;
            if (!cityCode) {
                return res.status(400).json({ error: 'City code is required' });
            }

            if (cache.barangays[cityCode]) {
                return res.json(cache.barangays[cityCode]);
            }

            const response = await axios.get(`${API_BASE}/cities-municipalities/${cityCode}/barangays/`);
            const sorted = response.data.sort((a, b) => a.name.localeCompare(b.name));

            cache.barangays[cityCode] = sorted;
            res.json(sorted);
        } catch (error) {
            console.error(`Error fetching barangays for city ${req.query.cityCode}:`, error.message);
            res.status(500).json({ error: 'Failed to fetch barangays' });
        }
    }
}

module.exports = AddressController;
