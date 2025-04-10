import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/userAuth";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { EmployerProfile, Job, Application, StudentProfile } from "@shared/schema";
import { PlusCircle, Users, Briefcase, TrendingUp, Eye } from "lucide-react";
import { Link } from "wouter";

export default function EmployerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not logged in or not an employer
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (user && user.role !== "employer") {
      setLocation(`/dashboard/${user.role}`);
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch employer profile
  const { data: profile, isLoading: isProfileLoading } = useQuery<EmployerProfile>({
    queryKey: [user ? `/api/employer-profiles/user/${user.id}` : null],
    enabled: !!user,
  });

  // Fetch employer's jobs
  const { data: jobs, isLoading: isJobsLoading } = useQuery<Job[]>({
    queryKey: [profile ? `/api/jobs/employer/${profile.id}` : null],
    enabled: !!profile,
  });

  // Fetch recent applications for all jobs
  const [recentApplications, setRecentApplications] = useState<(Application & { student?: StudentProfile, job?: Job })[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  useEffect(() => {
    if (!jobs || jobs.length === 0) return;

    const fetchApplications = async () => {
      setIsLoadingApplications(true);
      try {
        const allApplications = [];

        for (const job of jobs) {
          const response = await fetch(`/api/applications/job/${job.id}`, {
            credentials: "include",
          });

          if (response.ok) {
            const jobApplications = await response.json();
            allApplications.push(...jobApplications.map((app: any) => ({ ...app, job })));
          }
        }

        // Sort by date and take the most recent 5
        allApplications.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setRecentApplications(allApplications.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setIsLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [jobs]);

  // If not authenticated or not an employer, don't render the dashboard
  if (!isAuthenticated || (user && user.role !== "employer")) {
    return null;
  }

  const activeJobs = jobs?.filter(job => job.isActive) || [];
  const totalApplications = recentApplications.length;

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
                  Employer Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user?.name || "Employer"}. 
                  {profile && (
                    <span> Managing internships for <span className="font-medium">{profile.companyName}</span>.</span>
                  )}
                </p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4 flex gap-3">
                <Link href="/jobs/create">
                  <Button 
                    size="sm" 
                    className="inline-flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Post New Internship
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {/* Active Listings */}
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                    <Briefcase className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Listings</p>
                    <p className="text-2xl font-bold text-gray-900">{activeJobs.length}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Applications */}
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Pending Reviews */}
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <Eye className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recentApplications.filter(app => app.status === "applied").length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Potential Matches */}
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Potential Matches</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {jobs && jobs.length > 0 ? "25+" : "0"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Dashboard Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Internship Listings */}
              <Card className="lg:col-span-2">
                <CardHeader className="px-6 py-5 border-b border-gray-200">
                  <CardTitle className="text-lg font-medium text-gray-900">Active Internship Listings</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isJobsLoading ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">Loading internship listings...</p>
                    </div>
                  ) : jobs && jobs.length > 0 ? (
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="w-[300px] px-6 py-3">Position</TableHead>
                          <TableHead className="px-6 py-3">Location</TableHead>
                          <TableHead className="px-6 py-3">Posted</TableHead>
                          <TableHead className="px-6 py-3">Applications</TableHead>
                          <TableHead className="px-6 py-3">Status</TableHead>
                          <TableHead className="px-6 py-3"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="px-6 py-4 font-medium">{job.title}</TableCell>
                            <TableCell className="px-6 py-4 text-gray-500">
                              {job.location}
                              {job.isRemote && " (Remote)"}
                              {job.isHybrid && " (Hybrid)"}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-gray-500">
                              {formatDate(job.createdAt)}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="secondary">
                                {recentApplications.filter(app => app.jobId === job.id).length}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge 
                                variant={job.isActive ? "default" : "secondary"}
                                className={job.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                              >
                                {job.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/jobs/${job.id}`}>View</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No active internship listings.</p>
                      <Link href="/jobs/create">
                        <Button size="sm" className="mt-4">
                          Create Your First Listing
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Company Profile Card */}
              <Card>
                <CardHeader className="px-6 py-5 border-b border-gray-200">
                  <CardTitle className="text-lg font-medium text-gray-900">Company Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {isProfileLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                    </div>
                  ) : profile ? (
                    <div>
                      <div className="h-12 w-12 rounded-md bg-primary-100 flex items-center justify-center text-primary-700 mb-4">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{profile.companyName}</h3>
                      <p className="text-sm text-gray-500 mb-4">{profile.industry}</p>
                      
                      {profile.description && (
                        <p className="text-sm text-gray-600 mb-4">{profile.description}</p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        {profile.location && (
                          <div className="flex items-center text-sm">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {profile.location}
                          </div>
                        )}
                        
                        {profile.websiteUrl && (
                          <div className="flex items-center text-sm">
                            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                              {profile.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <Link href="/profile-setup">
                        <Button variant="outline" size="sm" className="w-full">
                          Edit Company Profile
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-500 mb-4">You need to complete your company profile.</p>
                      <Link href="/profile-setup">
                        <Button size="sm">Set Up Profile</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Applications */}
              <Card className="lg:col-span-3">
                <CardHeader className="px-6 py-5 border-b border-gray-200">
                  <CardTitle className="text-lg font-medium text-gray-900">Recent Applications</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingApplications ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">Loading recent applications...</p>
                    </div>
                  ) : recentApplications.length > 0 ? (
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="px-6 py-3">Applicant</TableHead>
                          <TableHead className="px-6 py-3">Position</TableHead>
                          <TableHead className="px-6 py-3">Applied</TableHead>
                          <TableHead className="px-6 py-3">Status</TableHead>
                          <TableHead className="px-6 py-3">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentApplications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell className="px-6 py-4 font-medium">
                              {application.student?.userId ? (
                                <Link href={`/candidates/${application.student.userId}`} className="text-primary-600 hover:text-primary-700">
                                  {application.student.userId}
                                </Link>
                              ) : (
                                "Unknown Student"
                              )}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-gray-500">
                              {application.job?.title || "Unknown Position"}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-gray-500">
                              {formatDate(application.createdAt)}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge 
                                className={`${getStatusColor(application.status).bg} ${getStatusColor(application.status).text}`}
                              >
                                {getStatusLabel(application.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Button variant="ghost" size="sm">
                                View Application
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No applications received yet.</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Post internship listings to start receiving applications.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
