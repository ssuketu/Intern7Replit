import { useEffect } from "react";
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
import { formatDate } from "@/lib/utils";
import { User, Job, Application } from "@shared/schema";
import { Users, Briefcase, MessageSquare, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (user && user.role !== "admin") {
      setLocation(`/dashboard/${user.role}`);
    }
  }, [isAuthenticated, user, setLocation]);

  // Fetch all users
  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "admin",
  });

  // Fetch all jobs
  const { data: jobs, isLoading: isJobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    enabled: !!user && user.role === "admin",
  });

  // If not authenticated or not an admin, don't render the dashboard
  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null;
  }

  const studentCount = users?.filter(u => u.role === "student").length || 0;
  const employerCount = users?.filter(u => u.role === "employer").length || 0;
  const jobCount = jobs?.length || 0;

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
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user?.name || "Admin"}. Here's what's happening on the platform.
                </p>
              </div>
            </div>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {/* Total Students */}
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Students</p>
                    <p className="text-2xl font-bold text-gray-900">{studentCount}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Total Employers */}
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                    <Briefcase className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employers</p>
                    <p className="text-2xl font-bold text-gray-900">{employerCount}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Total Jobs */}
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <Briefcase className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{jobCount}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Platform Activity */}
              <Card>
                <CardContent className="p-6 flex items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                    <BarChart3 className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Matches Made</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {studentCount > 0 && jobCount > 0 ? `${studentCount * 3}+` : "0"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Dashboard Grid Layout */}
            <div className="grid grid-cols-1 gap-6">
              {/* Recent Users */}
              <Card>
                <CardHeader className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <CardTitle className="text-lg font-medium text-gray-900">Recent Users</CardTitle>
                  <Button variant="outline" size="sm">View All Users</Button>
                </CardHeader>
                <CardContent className="p-0">
                  {isUsersLoading ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">Loading users...</p>
                    </div>
                  ) : users && users.length > 0 ? (
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="px-6 py-3">Name</TableHead>
                          <TableHead className="px-6 py-3">Email</TableHead>
                          <TableHead className="px-6 py-3">Role</TableHead>
                          <TableHead className="px-6 py-3">Joined</TableHead>
                          <TableHead className="px-6 py-3">Status</TableHead>
                          <TableHead className="px-6 py-3"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.slice(0, 5).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="px-6 py-4 font-medium">{user.name}</TableCell>
                            <TableCell className="px-6 py-4 text-gray-500">{user.email}</TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge
                                className={
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : user.role === "employer"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-gray-500">
                              {formatDate(user.createdAt)}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm">View</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No users found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Jobs */}
              <Card>
                <CardHeader className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <CardTitle className="text-lg font-medium text-gray-900">Recent Jobs</CardTitle>
                  <Button variant="outline" size="sm">View All Jobs</Button>
                </CardHeader>
                <CardContent className="p-0">
                  {isJobsLoading ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">Loading jobs...</p>
                    </div>
                  ) : jobs && jobs.length > 0 ? (
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="px-6 py-3">Title</TableHead>
                          <TableHead className="px-6 py-3">Company</TableHead>
                          <TableHead className="px-6 py-3">Location</TableHead>
                          <TableHead className="px-6 py-3">Posted</TableHead>
                          <TableHead className="px-6 py-3">Status</TableHead>
                          <TableHead className="px-6 py-3"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.slice(0, 5).map((job) => (
                          <TableRow key={job.id}>
                            <TableCell className="px-6 py-4 font-medium">{job.title}</TableCell>
                            <TableCell className="px-6 py-4 text-gray-500">{job.employerId}</TableCell>
                            <TableCell className="px-6 py-4 text-gray-500">
                              {job.location}
                              {job.isRemote && " (Remote)"}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-gray-500">
                              {formatDate(job.createdAt)}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge className={job.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {job.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm">View</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No jobs found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* System Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="px-6 py-5 border-b border-gray-200">
                    <CardTitle className="text-lg font-medium text-gray-900">User Growth</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md border border-dashed border-gray-300">
                      <p className="text-gray-500">User growth chart will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="px-6 py-5 border-b border-gray-200">
                    <CardTitle className="text-lg font-medium text-gray-900">Match Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md border border-dashed border-gray-300">
                      <p className="text-gray-500">Match success rate chart will be displayed here</p>
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
