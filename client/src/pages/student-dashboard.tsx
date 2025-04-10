import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { CareerProgress } from "@/components/dashboard/career-progress";
import { InternshipCard } from "@/components/dashboard/internship-card";
import { ApplicationTracking } from "@/components/dashboard/application-tracking";
import { SkillDevelopment } from "@/components/dashboard/skill-development";
import { useAuth } from "@/lib/userAuth";
import { apiRequest } from "@/lib/queryClient";
import { StudentProfile, Job, Application, SkillGapAnalysis } from "@shared/schema";
import { RefreshCw, Search } from "lucide-react";

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSort, setSelectedSort] = useState("matchScore");

  // Redirect if not logged in or not a student
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (user && user.role !== "student") {
      setLocation(`/dashboard/${user.role}`);
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch student profile
  const { data: profile, isLoading: isProfileLoading } = useQuery<StudentProfile>({
    queryKey: [user ? `/api/student-profiles/user/${user.id}` : null],
    enabled: !!user,
  });

  // Fetch job matches
  const { data: jobMatches, isLoading: isJobsLoading } = useQuery<{ job: Job; score: number }[]>({
    queryKey: [profile ? `/api/matching/jobs/${profile.id}` : null],
    enabled: !!profile,
  });

  // Fetch applications
  const { data: applications, isLoading: isApplicationsLoading } = useQuery<Application[]>({
    queryKey: [profile ? `/api/applications/student/${profile.id}` : null],
    enabled: !!profile,
  });

  // Fetch skill gap analysis
  const { data: skillGapAnalysis, isLoading: isSkillGapLoading } = useQuery<SkillGapAnalysis>({
    queryKey: [profile ? `/api/skill-gap/${profile.id}` : null],
    enabled: !!profile,
  });

  // Apply for job
  const handleApply = async (jobId: number) => {
    if (!profile) return;
    
    try {
      await apiRequest("POST", "/api/applications", {
        studentId: profile.id,
        jobId,
        status: "applied",
      });
      
      // Invalidate applications query to refresh the data
      // This would typically be done with a mutation
    } catch (error) {
      console.error("Failed to apply for job:", error);
    }
  };

  // Save job
  const handleSaveJob = (jobId: number) => {
    // Would typically save to bookmarks collection
    console.log("Save job:", jobId);
  };

  // Sort jobs
  const sortedJobs = jobMatches ? [...jobMatches].sort((a, b) => {
    if (selectedSort === "matchScore") {
      return b.score - a.score;
    } else if (selectedSort === "mostRecent") {
      return new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime();
    }
    return 0;
  }) : [];

  // If not authenticated or not a student, don't render the dashboard
  if (!isAuthenticated || (user && user.role !== "student")) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Student Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user?.name || "Student"}. 
                  {jobMatches && jobMatches.length > 0 && (
                    <span className="font-medium text-primary-500"> You have {jobMatches.length} new matches based on your profile.</span>
                  )}
                </p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4 flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="inline-flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                <Button 
                  size="sm" 
                  className="inline-flex items-center"
                  onClick={() => setLocation("/jobs/search")}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Internships
                </Button>
              </div>
            </div>
            
            {/* Dashboard Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar */}
              <div className="lg:col-span-1">
                {/* Profile Card */}
                {isProfileLoading ? (
                  <div className="bg-white shadow rounded-lg h-96 animate-pulse p-6"></div>
                ) : profile ? (
                  <ProfileCard profile={profile} />
                ) : (
                  <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-center text-gray-500">
                      You need to complete your profile.
                    </p>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => setLocation("/profile-setup")}
                    >
                      Set Up Profile
                    </Button>
                  </div>
                )}
                
                {/* Career Progress Card */}
                {profile && (
                  <CareerProgress skillGapAnalysis={skillGapAnalysis} />
                )}
              </div>
              
              {/* Main Content Area */}
              <div className="lg:col-span-2">
                {/* Recommended Internships */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                  <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Recommended Internships</h3>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                      <select 
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        value={selectedSort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                      >
                        <option value="matchScore">Match Score</option>
                        <option value="mostRecent">Most Recent</option>
                        <option value="location">Location</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {isJobsLoading ? (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">Loading recommended internships...</p>
                      </div>
                    ) : sortedJobs.length > 0 ? (
                      <>
                        {sortedJobs.map((match, index) => (
                          <InternshipCard 
                            key={match.job.id}
                            job={match.job}
                            score={match.score}
                            isNew={index === 0}
                            isPopular={index === 2}
                            onApply={handleApply}
                            onSave={handleSaveJob}
                          />
                        ))}
                        
                        <div className="p-6 text-center">
                          <Button variant="outline" size="sm" onClick={() => setLocation("/jobs/search")}>
                            Load More
                            <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">No recommended internships available yet.</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Complete your profile to get personalized recommendations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Application Status Tracking */}
                <ApplicationTracking 
                  applications={applications || []} 
                  isLoading={isApplicationsLoading}
                />
                
                {/* Skill Development Resources */}
                <SkillDevelopment studentId={profile?.id} />
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
