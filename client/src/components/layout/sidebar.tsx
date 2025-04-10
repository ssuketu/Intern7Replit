import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  User, 
  Briefcase, 
  Search, 
  Mail, 
  FileText, 
  Award,
  Settings,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/lib/userAuth";
import { cn } from "@/lib/utils";

type SidebarLink = {
  icon: React.ReactNode;
  label: string;
  href: string;
  roles: Array<'student' | 'employer' | 'admin'>;
};

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const userRole = user?.role || 'student';
  
  const sidebarLinks: SidebarLink[] = [
    { 
      icon: <Home size={18} />, 
      label: "Dashboard", 
      href: `/dashboard/${userRole}`,
      roles: ['student', 'employer', 'admin']
    },
    { 
      icon: <User size={18} />, 
      label: "Profile", 
      href: "/profile-setup",
      roles: ['student', 'employer', 'admin']
    },
    { 
      icon: <Search size={18} />, 
      label: "Find Internships", 
      href: "/jobs/search",
      roles: ['student']
    },
    { 
      icon: <Briefcase size={18} />, 
      label: "Post Internship", 
      href: "/jobs/create",
      roles: ['employer']
    },
    { 
      icon: <Search size={18} />, 
      label: "Find Candidates", 
      href: "/candidates/search",
      roles: ['employer']
    },
    { 
      icon: <FileText size={18} />, 
      label: "Applications", 
      href: "/applications",
      roles: ['student', 'employer']
    },
    { 
      icon: <Award size={18} />, 
      label: "Skill Development", 
      href: "#",
      roles: ['student']
    },
    { 
      icon: <Mail size={18} />, 
      label: "Messages", 
      href: "/messages",
      roles: ['student', 'employer', 'admin']
    },
    { 
      icon: <Settings size={18} />, 
      label: "Settings", 
      href: "#",
      roles: ['student', 'employer', 'admin']
    },
  ];
  
  // Filter links based on user role
  const filteredLinks = sidebarLinks.filter(link => 
    link.roles.includes(userRole as 'student' | 'employer' | 'admin')
  );
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed bottom-4 right-4 z-50 rounded-full shadow-md"
        onClick={toggleMobileSidebar}
      >
        {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>
      
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white h-screen flex-shrink-0 border-r border-gray-200 transition-all duration-300",
          "fixed inset-y-0 left-0 z-40 md:static",
          isMobileSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0 md:translate-x-0 md:w-64"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center py-4">
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
          </div>
          
          <Separator className="my-2" />
          
          <nav className="flex-1 mt-4 space-y-1">
            {filteredLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    location === link.href ? "bg-primary-100 text-primary-900 hover:bg-primary-200" : ""
                  )}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto pt-4">
            <Separator className="mb-4" />
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500 text-center">
                Need help? Contact support
              </p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden" 
          onClick={toggleMobileSidebar}
        />
      )}
    </>
  );
}
