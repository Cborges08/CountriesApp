import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Read environment variables once outside the handlers
const nagerBaseUrl = process.env.NAGER_BASE_URL || 'https://date.nager.at/api/v3';
const countriesNowBaseUrl = process.env.COUNTRIESNOW_BASE_URL || 'https://countriesnow.space/api/v0.1';

/**
 * GET /api/countries
 * Returns an array of { countryCode, name } from Nager.Date
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // GET /AvailableCountries
    const response = await axios.get(`${nagerBaseUrl}/AvailableCountries`);
    // ex: [ { "countryCode": "AD", "name": "Andorra" }, ... ]
    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

/**
 * GET /api/countries/:countryCode
 * Returns detailed info for a specific country:
 * - Borders (from Nager.Date: /CountryInfo/{code})
 * - Flag (from CountriesNow: POST /countries/flag/images)
 * - Population (from CountriesNow: POST /countries/population)
 */
router.get('/:countryCode', async (req: Request<{ countryCode: string }>, res: Response) => {
  const { countryCode } = req.params;

  try {
    // 1) Get country info (borders, names) from Nager.Date
    // e.g. GET https://date.nager.at/api/v3/CountryInfo/NG
    const infoUrl = `${nagerBaseUrl}/CountryInfo/${countryCode}`;
    const { data: infoData } = await axios.get(infoUrl);

    // infoData => {
    //   "commonName": "Nigeria",
    //   "officialName": "Federal Republic of Nigeria",
    //   "countryCode": "NG",
    //   "region": "Africa",
    //   "borders": [ { commonName: "Benin", countryCode: "BJ" }, ... ]
    // }

    // 2) Flag from CountriesNow => POST /countries/flag/images with { iso2: "NG" }
    const flagUrl = `${countriesNowBaseUrl}/countries/flag/images`;
    const flagBody = { iso2: infoData.countryCode }; // e.g., "NG"
    const { data: flagResponse } = await axios.post(flagUrl, flagBody);
    // flagResponse => {
    //   "error": false,
    //   "msg": "Nigeria and flag retrieved",
    //   "data": {
    //     "name": "Nigeria",
    //     "flag": "https://upload.wikimedia.org/...",
    //     "iso2": "NG",
    //     "iso3": "NGA"
    //   }
    // }

    // 3) Population from CountriesNow => POST /countries/population with { country: "<commonName>" }
    // e.g. { country: "Nigeria" }
    const populationUrl = `${countriesNowBaseUrl}/countries/population`;
    const popBody = { country: infoData.commonName };
    const { data: popResponse } = await axios.post(populationUrl, popBody);
    // popResponse => {
    //   "error": false,
    //   "msg": "Nigeria with population",
    //   "data": {
    //     "country": "Nigeria",
    //     "populationCounts": [
    //       { "year": 1960, "value": 45138458 }, ...
    //     ]
    //   }
    // }

    const result = {
      countryCode: infoData.countryCode,
      commonName: infoData.commonName,
      officialName: infoData.officialName,
      region: infoData.region,
      borders: infoData.borders || [],
      flagUrl: flagResponse.data?.flag, // from .data.flag
      populationCounts: popResponse.data?.populationCounts || [],
    };

    return res.json(result);
  } catch (error) {
    console.error('Error fetching country info:', error);
    return res.status(500).json({ error: 'Failed to fetch country info' });
  }
});

export default router;
