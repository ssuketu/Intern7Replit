import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/ui/match-score";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/userAuth";
import { apiRequest } from "@/lib/queryClient";
import { Job, StudentProfile, EmployerProfile, Application } from "@shared/schema";
import { Bookmark, Building, Clock, MapPin, Share2, Users, Calendar, DollarSign, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function JobDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Fetch job details
  const { data: job, isLoading: isJobLoading } = useQuery<Job>({
    queryKey: [`/api/jobs/${id}`],
    enabled: !!id,
  });

  // Fetch student profile if user is a student
  const { data: studentProfile } = useQuery<StudentProfile>({
    queryKey: [user && user.role === "student" ? `/api/student-profiles/user/${user.id}` : null],
    enabled: !!user && user.role === "student",
  });

  // Fetch employer profile for the job
  const { data: employerProfile, isLoading: isEmployerLoading } = useQuery<EmployerProfile>({
    queryKey: [job ? `/api/employer-profiles/${job.employerId}` : null],
    enabled: !!job,
  });

  // Check if student has already applied
  const { data: applications } = useQuery<Application[]>({
    queryKey: [studentProfile ? `/api/applications/student/${studentProfile.id}` : null],
    enabled: !!studentProfile,
  });

  const hasApplied = applications?.some(app => app.jobId === Number(id));
  const matchScore = studentProfile && job ? 
    calculateMatchScore(studentProfile.skills as string[], job.skills as string[]) : 0;

  function calculateMatchScore(studentSkills: string[], jobSkills: string[]): number {
    if (!studentSkills.length || !jobSkills.length) return 0;
    
    const matchingSkills = studentSkills.filter(skill => 
      jobSkills.includes(skill)
    ).length;
    
    return Math.round((matchingSkills / jobSkills.length) * 100);
  }

  const handleApply = async () => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    if (!studentProfile) {
      toast({
        variant: "destructive",
        title: "Profile Required",
        description: "Please complete your student profile before applying.",
      });
      setLocation("/profile-setup");
      return;
    }

    setIsApplying(true);

    try {
      await apiRequest("POST", "/api/applications", {
        studentId: studentProfile.id,
        jobId: Number(id),
        status: "applied",
        coverLetter: coverLetter.trim() || undefined,
      });

      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
      });

      // Refresh the applications data
      // In a real app, we would use queryClient.invalidateQueries here
      setLocation(`/applications`);
    } catch (error) {
      console.error("Failed to submit application:", error);
      toast({
        variant: "destructive",
        title: "Application Failed",
        description: "There was a problem submitting your application. Please try again.",
      });
    } finally {
      setIsApplying(false);
    }
  };

  if (isJobLoading || isEmployerLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="h-96 bg-white rounded-lg animate-pulse" />
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Job Not Found</h2>
              <p className="mt-2 text-gray-600">The internship you're looking for doesn't exist or has been removed.</p>
              <Button 
                className="mt-6" 
                onClick={() => setLocation("/jobs/search")}
              >
                Browse Internships
              </Button>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Job Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="md:flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900 mr-3">{job.title}</h1>
                    {job.isActive && (
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-center flex-wrap gap-y-2">
                    {employerProfile && (
                      <div className="flex items-center mr-4">
                        <Building className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-gray-700 font-medium">{employerProfile.companyName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center mr-4">
                      <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-gray-700">
                        {job.location}
                        {job.isRemote && " (Remote)"}
                        {job.isHybrid && " (Hybrid)"}
                      </span>
                    </div>
                    
                    <div className="flex items-center mr-4">
                      <Clock className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-gray-700">{job.duration}</span>
                    </div>
                    
                    {job.salary && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-gray-700">{job.salary}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-gray-600 text-sm">Posted on {formatDate(job.createdAt)}</span>
                    
                    {job.expiresAt && (
                      <>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-gray-600 text-sm">
                          Deadline: {formatDate(job.expiresAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Action buttons and match score */}
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                  {user?.role === "student" && (
                    <div className="mb-3">
                      <MatchScore score={matchScore} size="lg" />
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Skills */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {(job.skills as string[]).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Apply button */}
              {user?.role === "student" && (
                <div className="mt-6 flex justify-end">
                  <Button 
                    size="lg" 
                    disabled={isApplying || hasApplied}
                    onClick={() => document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {hasApplied ? "Already Applied" : "Apply Now"}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Main content */}
            <div className="mt-6 gap-6 md:flex">
              {/* Left column - Job details */}
              <div className="md:flex-1">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Internship</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="description">
                      <TabsList className="mb-4">
                        <TabsTrigger value="description">Description</TabsTrigger>
                        <TabsTrigger value="requirements">Requirements</TabsTrigger>
                        <TabsTrigger value="company">Company</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="description">
                        <div className="prose max-w-none">
                          <p className="whitespace-pre-line">{job.description}</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="requirements">
                        <h3 className="text-lg font-medium mb-3">Requirements</h3>
                        <ul className="space-y-2">
                          {(job.requirements as string[]).map((requirement, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-primary-500 mr-2">•</span>
                              <span>{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </TabsContent>
                      
                      <TabsContent value="company">
                        {employerProfile ? (
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">{employerProfile.companyName}</h3>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="h-4 w-4 mr-2" />
                              <span>{employerProfile.industry} • {employerProfile.companySize} employees</span>
                            </div>
                            
                            {employerProfile.location && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{employerProfile.location}</span>
                              </div>
                            )}
                            
                            {employerProfile.websiteUrl && (
                              <div className="flex items-center text-sm">
                                <a 
                                  href={employerProfile.websiteUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  Visit company website
                                </a>
                              </div>
                            )}
                            
                            <Separator />
                            
                            <div>
                              <h4 className="text-md font-medium mb-2">About {employerProfile.companyName}</h4>
                              <p className="text-gray-700">{employerProfile.description}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600">Company information not available.</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                {/* Apply section */}
                {user?.role === "student" && !hasApplied && (
                  <Card className="mt-6" id="apply-section">
                    <CardHeader>
                      <CardTitle>Apply for this Internship</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Cover Letter (Optional)</h3>
                          <Textarea
                            placeholder="Tell the employer why you're interested in this position and why you'd be a good fit..."
                            className="resize-none h-40"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            disabled={isApplying}
                          />
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Resume</h3>
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">
                              {studentProfile?.resumeUrl ? 
                                "Your current resume will be included with your application" : 
                                "No resume uploaded. We recommend adding a resume to your profile."}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                          <Button 
                            onClick={handleApply} 
                            disabled={isApplying}
                          >
                            {isApplying ? "Submitting..." : "Submit Application"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Right column - Company and similar jobs */}
              <div className="md:w-80 mt-6 md:mt-0 space-y-6">
                {/* Similar internships */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Similar Internships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500 py-3">
                      <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                      <p>Similar internships will appear here.</p>
                    </div>
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
