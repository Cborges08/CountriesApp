/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import Layout from '@/components/layout';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BorderCountry {
  commonName: string;
  officialName: string;
  countryCode: string;
  region: string;
}

interface PopulationCount {
  year: number;
  value: number;
}

interface CountryInfo {
  countryCode: string;
  commonName: string;
  officialName: string;
  region: string;
  borders: BorderCountry[];
  flagUrl: string;
  populationCounts: PopulationCount[];
}

export default function CountryPage() {
  const router = useRouter();
  const { countryCode } = router.query;

  const [country, setCountry] = useState<CountryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!countryCode) return;
    const fetchData = async () => {
      try {
        const res = await axios.get<CountryInfo>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/countries/${countryCode}`
        );
        setCountry(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch country details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [countryCode]);

  if (loading) {
    return (
      <Layout>
        <p className="text-blue-500">Loading...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className="text-red-500">{error}</p>
      </Layout>
    );
  }

  if (!country) {
    return (
      <Layout>
        <p>No data available.</p>
      </Layout>
    );
  }

  // Prepare data for Recharts
  const chartData = country.populationCounts.map((p) => ({
    year: p.year,
    population: p.value,
  }));

  return (
    <Layout>
      {/* CARD FOR MAIN COUNTRY INFO */}
      <div className="bg-white rounded shadow p-4 mb-6 max-w-md mx-auto">
        {/* Top section: name & flag side by side */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold mr-4">{country.commonName}</h1>
          {country.flagUrl && (
            <img
              src={country.flagUrl}
              alt={`${country.commonName} flag`}
              className="w-16 h-16 object-cover rounded"
            />
          )}
        </div>

        <p className="mb-1">
          <strong>Official Name:</strong> {country.officialName}
        </p>
        <p className="mb-1">
          <strong>Region:</strong> {country.region}
        </p>

        {/* Border Countries */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Border Countries</h2>
          {country.borders.length ? (
            <ul className="flex flex-wrap gap-2">
              {country.borders.map((b) => (
                <li
                  key={b.countryCode}
                  className="bg-gray-100 p-2 rounded hover:bg-gray-200 transition"
                >
                  <Link href={`/${b.countryCode}`} className="text-blue-600">
                    {b.commonName} ({b.countryCode})
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>None found.</p>
          )}
        </div>
      </div>

      {/* CARD FOR POPULATION CHART */}
      <div className="bg-white rounded shadow p-4 mb-6 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Population Over Time</h2>
        {chartData.length ? (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="population" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p>No population data available.</p>
        )}
      </div>

      <div className="max-w-md mx-auto text-center">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to All Countries
        </Link>
      </div>
    </Layout>
  );
}
