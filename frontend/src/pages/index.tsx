import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Layout from '@/components/layout';

interface Country {
  countryCode: string;
  name: string;
}

export default function HomePage() {
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const res = await axios.get<Country[]>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/countries`
      );
      setCountries(res.data);
    };
    fetchCountries();
  }, []);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">All Countries</h1>
      <ul className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {countries.map((country) => (
          <li
            key={country.countryCode}
            className="border p-2 rounded shadow bg-white text-center"
          >
            <Link
              href={`/${country.countryCode}`}
              className="text-blue-600 hover:text-green-500 font-medium transition-colors duration-300"
            >
              {country.name}
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
