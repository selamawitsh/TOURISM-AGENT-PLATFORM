import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-emerald-400" />
              <span className="font-bold text-lg">Ethiopia Tours</span>
            </div>
            <p className="text-gray-400 text-sm">Timeless Landscapes, Crafted Journeys</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Explore</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/destinations" className="block hover:text-white">Destinations</Link>
              <Link href="/tours" className="block hover:text-white">Tours</Link>
              <Link href="/guides" className="block hover:text-white">Guides</Link>
              <Link href="/cultures" className="block hover:text-white">Cultures</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="/about" className="block hover:text-white">About</Link>
              <Link href="/auth/login" className="block hover:text-white">Sign In</Link>
              <Link href="/auth/register" className="block hover:text-white">Register</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Addis Ababa, Ethiopia</p>
              <p>info@ethiopiatours.com</p>
              <p>+251 000 000 000</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Ethiopia Tours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
