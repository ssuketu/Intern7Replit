import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InternshipCard } from "@/components/dashboard/internship-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/userAuth";
import { Job, StudentProfile } from "@shared/schema";
import { Search, FilterX, Building, MapPin } from "lucide-react";
import { calculateMatchScore } from "@/lib/utils";

export default function SearchJobs() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    isRemote: false,
    location: "",
    skills: [] as string[],
  });
  
  // Fetch all jobs
  const { data: jobs, isLoading: isJobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });
  
  // Fetch student profile if user is logged in as student
  const { data: studentProfile } = useQuery<StudentProfile>({
    queryKey: [user && user.role === "student" ? `/api/student-profiles/user/${user.id}` : null],
    enabled: !!user && user.role === "student",
  });
  
  // Apply filters to jobs
  const filteredJobs = jobs?.filter(job => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesQuery = 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);
      
      if (!matchesQuery) return false;
    }
    
    // Remote filter
    if (filters.isRemote && !job.isRemote) return false;
    
    // Location filter
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    
    // Skills filter
    if (filters.skills.length > 0) {
      const jobSkills = job.skills as string[];
      const hasMatchingSkill = filters.skills.some(skill => jobSkills.includes(skill));
      if (!hasMatchingSkill) return false;
    }
    
    return true;
  });
  
  // Calculate match scores for filtered jobs
  const jobsWithScores = filteredJobs?.map(job => {
    const score = studentProfile ? 
      calculateMatchScore(studentProfile.skills as string[], job.skills as string[]) : 50;
    
    return { job, score };
  }).sort((a, b) => b.score - a.score);
  
  // Handle apply
  const handleApply = (jobId: number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to apply for internships",
        variant: "default",
      });
      setLocation("/login");
      return;
    }
    
    setLocation(`/jobs/${jobId}`);
  };
  
  // Handle save job
  const handleSaveJob = (jobId: number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save internships",
        variant: "default",
      });
      setLocation("/login");
      return;
    }
    
    toast({
      title: "Internship saved",
      description: "The internship has been saved to your bookmarks",
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      isRemote: false,
      location: "",
      skills: [],
    });
  };
  
  // Add skill to filter
  const toggleSkillFilter = (skill: string) => {
    setFilters(prev => {
      if (prev.skills.includes(skill)) {
        return {
          ...prev,
          skills: prev.skills.filter(s => s !== skill),
        };
      } else {
        return {
          ...prev,
          skills: [...prev.skills, skill],
        };
      }
    });
  };
  
  // Get unique locations from jobs
  const uniqueLocations = jobs ? 
    Array.from(new Set(jobs.map(job => job.location))) : [];
  
  // Get unique skills from jobs
  const uniqueSkills = jobs ? 
    Array.from(new Set(jobs.flatMap(job => job.skills as string[]))) : [];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Find Internships
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Browse through internship opportunities that match your skills and interests.
                </p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="flex rounded-md shadow-sm">
                <div className="relative flex-grow focus-within:z-10">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search internships by title, keyword, or company..."
                    className="pl-10 pr-3 py-2 block w-full rounded-l-md border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  className="relative -ml-px rounded-r-md"
                >
                  Search
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Sidebar */}
              <div className="lg:w-64 flex-shrink-0 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Filters</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetFilters}
                        className="h-8 px-2 text-xs"
                      >
                        <FilterX className="h-3.5 w-3.5 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Remote Filter */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="remote" 
                            checked={filters.isRemote}
                            onCheckedChange={() => setFilters({...filters, isRemote: !filters.isRemote})}
                          />
                          <Label htmlFor="remote">Remote Only</Label>
                        </div>
                      </div>
                      
                      {/* Location Filter */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Location</h3>
                        <Input
                          placeholder="Filter by location"
                          value={filters.location}
                          onChange={(e) => setFilters({...filters, location: e.target.value})}
                          className="mb-2"
                        />
                        <div className="max-h-36 overflow-auto mt-2 space-y-1">
                          {uniqueLocations.slice(0, 5).map((location, i) => (
                            <div key={i} className="flex items-center text-sm">
                              <button
                                className="text-left w-full hover:text-primary-500 flex items-center"
                                onClick={() => setFilters({...filters, location})}
                              >
                                <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                {location}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Skills Filter */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Skills</h3>
                        <div className="max-h-60 overflow-auto space-y-1">
                          {uniqueSkills.slice(0, 15).map((skill, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`skill-${i}`} 
                                checked={filters.skills.includes(skill)}
                                onCheckedChange={() => toggleSkillFilter(skill)}
                              />
                              <Label 
                                htmlFor={`skill-${i}`}
                                className="text-sm cursor-pointer"
                              >
                                {skill}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content */}
              <div className="flex-1">
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {isJobsLoading ? "Loading internships..." : 
                         `${jobsWithScores?.length || 0} Internships Found`}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                          <option>Match Score</option>
                          <option>Most Recent</option>
                          <option>Location</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                      {isJobsLoading ? (
                        <div className="p-6 text-center">
                          <p className="text-gray-500">Loading internships...</p>
                        </div>
                      ) : jobsWithScores && jobsWithScores.length > 0 ? (
                        jobsWithScores.map(({job, score}, index) => (
                          <InternshipCard
                            key={job.id}
                            job={job}
                            score={score}
                            isNew={index === 0}
                            isPopular={job.id % 3 === 0} // Just for demo variation
                            onApply={handleApply}
                            onSave={handleSaveJob}
                          />
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-gray-500">No internships found matching your criteria.</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={resetFilters}
                            className="mt-2"
                          >
                            Clear Filters
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {jobsWithScores && jobsWithScores.length > 0 && (
                      <div className="p-4 flex justify-center border-t border-gray-200">
                        <Button variant="outline">
                          Load More
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
