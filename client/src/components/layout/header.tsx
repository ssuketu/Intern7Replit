import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/userAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Briefcase, Settings } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "student":
        return "/dashboard/student";
      case "employer":
        return "/dashboard/employer";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/login";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <svg
                className="h-8 w-8 text-primary-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
              </svg>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                InternMatch
              </span>
            </Link>
          </div>

          {/* Navigation Menu - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/jobs/search" className={`text-gray-600 hover:text-primary-500 px-3 py-2 text-sm font-medium ${location === "/jobs/search" ? "text-primary-500" : ""}`}>
              For Students
            </Link>
            <Link href="/candidates/search" className={`text-gray-600 hover:text-primary-500 px-3 py-2 text-sm font-medium ${location === "/candidates/search" ? "text-primary-500" : ""}`}>
              For Employers
            </Link>
            <Link href="#" className="text-gray-600 hover:text-primary-500 px-3 py-2 text-sm font-medium">
              Success Stories
            </Link>
            <Link href="#" className="text-gray-600 hover:text-primary-500 px-3 py-2 text-sm font-medium">
              Resources
            </Link>
          </nav>

          {/* Authentication Buttons */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-3">
                    {user?.name || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="flex items-center w-full cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile-setup" className="flex items-center w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="flex items-center w-full cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="ml-3">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={toggleMenu}
              className="md:hidden ml-4 text-gray-600 hover:text-gray-900"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4">
          <div className="flex flex-col space-y-3">
            <Link
              href="/jobs/search"
              className="text-gray-700 hover:text-primary-500 px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              For Students
            </Link>
            <Link
              href="/candidates/search"
              className="text-gray-700 hover:text-primary-500 px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              For Employers
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-primary-500 px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Success Stories
            </Link>
            <Link
              href="#"
              className="text-gray-700 hover:text-primary-500 px-3 py-2 text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Resources
            </Link>
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-500 px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-gray-700 hover:text-primary-500 px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <Link
                  href={getDashboardLink()}
                  className="text-gray-700 hover:text-primary-500 px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile-setup"
                  className="text-gray-700 hover:text-primary-500 px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-gray-700 hover:text-primary-500 px-3 py-2 text-base font-medium"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
