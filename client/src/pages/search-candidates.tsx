import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchScore } from "@/components/ui/match-score";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/userAuth";
import { StudentProfile, EmployerProfile, Job } from "@shared/schema";
import { Search, FilterX, GraduationCap, MapPin, User2, Mail } from "lucide-react";
import { calculateMatchScore } from "@/lib/utils";

export default function SearchCandidates() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    university: "",
    location: "",
    skills: [] as string[],
    jobId: 0,
  });
  
  // Fetch all student profiles
  const { data: students, isLoading: isStudentsLoading } = useQuery<StudentProfile[]>({
    queryKey: ["/api/student-profiles"],
  });
  
  // Fetch employer profile if user is logged in as employer
  const { data: employerProfile } = useQuery<EmployerProfile>({
    queryKey: [user && user.role === "employer" ? `/api/employer-profiles/user/${user.id}` : null],
    enabled: !!user && user.role === "employer",
  });
  
  // Fetch employer's jobs for the job filter
  const { data: jobs } = useQuery<Job[]>({
    queryKey: [employerProfile ? `/api/jobs/employer/${employerProfile.id}` : null],
    enabled: !!employerProfile,
  });
  
  // Get selected job for matching
  const selectedJob = jobs?.find(job => job.id === filters.jobId);
  
  // Apply filters to students
  const filteredStudents = students?.filter(student => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesQuery = 
        (student.university && student.university.toLowerCase().includes(query)) ||
        (student.degree && student.degree.toLowerCase().includes(query)) ||
        (student.fieldOfStudy && student.fieldOfStudy.toLowerCase().includes(query)) ||
        (student.skills as string[]).some(skill => skill.toLowerCase().includes(query));
      
      if (!matchesQuery) return false;
    }
    
    // University filter
    if (filters.university && (!student.university || !student.university.toLowerCase().includes(filters.university.toLowerCase()))) {
      return false;
    }
    
    // Location filter
    if (filters.location && (!student.location || !student.location.toLowerCase().includes(filters.location.toLowerCase()))) {
      return false;
    }
    
    // Skills filter
    if (filters.skills.length > 0) {
      const studentSkills = student.skills as string[];
      const hasMatchingSkill = filters.skills.some(skill => studentSkills.includes(skill));
      if (!hasMatchingSkill) return false;
    }
    
    return true;
  });
  
  // Calculate match scores for filtered students
  const studentsWithScores = filteredStudents?.map(student => {
    const score = selectedJob ? 
      calculateMatchScore(student.skills as string[], selectedJob.skills as string[]) : 
      (student.profileCompletionPercentage || 50); // Use profile completion as fallback
    
    return { student, score };
  }).sort((a, b) => b.score - a.score);
  
  // Contact student
  const handleContact = (student: StudentProfile) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact candidates",
        variant: "default",
      });
      setLocation("/login");
      return;
    }
    
    setLocation("/messages");
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      university: "",
      location: "",
      skills: [],
      jobId: 0,
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
  
  // Get unique universities from students
  const uniqueUniversities = students ? 
    Array.from(new Set(students.filter(s => s.university).map(s => s.university as string))) : [];
  
  // Get unique locations from students
  const uniqueLocations = students ? 
    Array.from(new Set(students.filter(s => s.location).map(s => s.location as string))) : [];
  
  // Get unique skills from students
  const uniqueSkills = students ? 
    Array.from(new Set(students.flatMap(s => s.skills as string[]))) : [];
  
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
                  Find Candidates
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Discover talented students who match your internship requirements.
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
                    placeholder="Search candidates by skills, university, degree..."
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
                      {/* Job Posting Filter */}
                      {jobs && jobs.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Match for Posting</h3>
                          <select
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            value={filters.jobId}
                            onChange={(e) => setFilters({...filters, jobId: Number(e.target.value)})}
                          >
                            <option value={0}>All Candidates</option>
                            {jobs.map(job => (
                              <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {/* University Filter */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">University</h3>
                        <Input
                          placeholder="Filter by university"
                          value={filters.university}
                          onChange={(e) => setFilters({...filters, university: e.target.value})}
                          className="mb-2"
                        />
                        <div className="max-h-36 overflow-auto mt-2 space-y-1">
                          {uniqueUniversities.slice(0, 5).map((university, i) => (
                            <div key={i} className="flex items-center text-sm">
                              <button
                                className="text-left w-full hover:text-primary-500 flex items-center"
                                onClick={() => setFilters({...filters, university})}
                              >
                                <GraduationCap className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                {university}
                              </button>
                            </div>
                          ))}
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
                        {isStudentsLoading ? "Loading candidates..." : 
                         `${studentsWithScores?.length || 0} Candidates Found`}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                          <option>Match Score</option>
                          <option>University</option>
                          <option>Location</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                      {isStudentsLoading ? (
                        <div className="p-6 text-center">
                          <p className="text-gray-500">Loading candidates...</p>
                        </div>
                      ) : studentsWithScores && studentsWithScores.length > 0 ? (
                        studentsWithScores.map(({student, score}) => (
                          <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="sm:flex sm:items-start sm:justify-between">
                              <div className="sm:flex sm:items-start">
                                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 overflow-hidden">
                                  <User2 className="h-6 w-6" />
                                </div>
                                <div className="mt-3 sm:mt-0 sm:ml-4">
                                  <div className="flex items-center">
                                    <h4 className="text-lg font-semibold text-gray-900">Student ID: {student.id}</h4>
                                  </div>
                                  
                                  <div className="mt-1 flex items-center flex-wrap">
                                    {student.degree && student.university && (
                                      <p className="text-sm text-gray-600">
                                        {student.degree} • {student.university}
                                      </p>
                                    )}
                                  </div>
                                  
                                  {student.location && (
                                    <div className="mt-1 flex items-center">
                                      <MapPin className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                      <p className="text-sm text-gray-600">{student.location}</p>
                                    </div>
                                  )}
                                  
                                  <div className="mt-2">
                                    <div className="flex items-center flex-wrap gap-2">
                                      {(student.skills as string[]).slice(0, 5).map((skill, index) => (
                                        <Badge key={index} variant="outline" className="text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {(student.skills as string[]).length > 5 && (
                                        <span className="text-xs text-gray-500">
                                          +{(student.skills as string[]).length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-end">
                                {/* Match Score */}
                                <div className="h-16 w-16">
                                  <MatchScore score={score} />
                                </div>
                                
                                <div className="mt-4 flex space-x-2">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handleContact(student)}
                                  >
                                    <Mail className="h-4 w-4 mr-1" />
                                    Contact
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-gray-500">No candidates found matching your criteria.</p>
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
                    
                    {studentsWithScores && studentsWithScores.length > 0 && (
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
