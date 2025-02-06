import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <header className="bg-blue-600 p-4 text-white">
        <nav className="container mx-auto">
          <Link href="/">
            <span className="font-bold cursor-pointer">Country Info</span>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto flex-grow p-4">
        {children}
      </main>

      <footer className="bg-blue-600 p-4 text-white text-center">
        <p>&copy; {new Date().getFullYear()} My Country App</p>
      </footer>
    </div>
  );
}
