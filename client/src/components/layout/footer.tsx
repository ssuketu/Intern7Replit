import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white mt-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="text-primary-500 font-semibold text-xl">
              InternMatch
            </Link>
          </div>
          <div className="mt-4 md:mt-0 flex justify-center md:justify-end">
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700 mr-6">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700 mr-6">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700 mr-6">
              Help Center
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center md:text-left text-xs text-gray-400">
          &copy; {new Date().getFullYear()} InternMatch. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
