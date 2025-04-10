import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/userAuth";
import { apiRequest } from "@/lib/queryClient";
import { StudentProfile, EmployerProfile, Application, Job } from "@shared/schema";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Calendar,
  Filter,
  Eye
} from "lucide-react";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function Applications() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Redirect if not logged in
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Fetch student profile if user is a student
  const { data: studentProfile } = useQuery<StudentProfile>({
    queryKey: [user && user.role === "student" ? `/api/student-profiles/user/${user.id}` : null],
    enabled: !!user && user.role === "student",
  });

  // Fetch employer profile if user is an employer
  const { data: employerProfile } = useQuery<EmployerProfile>({
    queryKey: [user && user.role === "employer" ? `/api/employer-profiles/user/${user.id}` : null],
    enabled: !!user && user.role === "employer",
  });

  // Fetch applications based on user role
  const { 
    data: applications, 
    isLoading: isApplicationsLoading,
    refetch: refetchApplications 
  } = useQuery<Application[]>({
    queryKey: [
      user?.role === "student" && studentProfile 
        ? `/api/applications/student/${studentProfile.id}` 
        : (user?.role === "employer" && employerProfile) 
          ? "/api/applications/employer" 
          : null
    ],
    enabled: !!(
      (user?.role === "student" && studentProfile) || 
      (user?.role === "employer" && employerProfile)
    ),
  });

  // Filter applications by status if filter is applied
  const filteredApplications = applications?.filter(app => 
    statusFilter ? app.status === statusFilter : true
  );

  // Update application status (for employers)
  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      await apiRequest("PATCH", `/api/applications/${applicationId}`, {
        status: newStatus
      });
      
      toast({
        title: "Status updated",
        description: `Application status changed to ${getStatusLabel(newStatus)}`,
      });
      
      // Refresh applications data
      refetchApplications();
      setSelectedApplication(null);
    } catch (error) {
      console.error("Failed to update application status:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating the application status.",
      });
    }
  };

  // View application details
  const viewApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
  };

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
                  {user?.role === "student" ? "My Applications" : "Candidate Applications"}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.role === "student" 
                    ? "Track and manage your internship applications." 
                    : "Review and manage applications from candidates."}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Application Status Cards (for Students) */}
              {user?.role === "student" && applications && (
                <>
                  <Card className="bg-white shadow">
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white shadow">
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-4">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">In Review</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {applications.filter(app => app.status === "in_review" || app.status === "interview_scheduled").length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white shadow">
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Accepted</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {applications.filter(app => app.status === "accepted").length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {/* Application Status Cards (for Employers) */}
              {user?.role === "employer" && applications && (
                <>
                  <Card className="bg-white shadow">
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">New Applications</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {applications.filter(app => app.status === "applied").length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white shadow">
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-4">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Interviews Scheduled</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {applications.filter(app => app.status === "interview_scheduled").length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white shadow">
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Accepted Candidates</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {applications.filter(app => app.status === "accepted").length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            
            {/* Applications Table */}
            <div className="mt-6">
              <Card>
                <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-4">
                  <CardTitle>Applications</CardTitle>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 text-gray-400 mr-2" />
                    <select 
                      className="text-sm border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                      value={statusFilter || ""}
                      onChange={(e) => setStatusFilter(e.target.value || null)}
                    >
                      <option value="">All Statuses</option>
                      <option value="applied">Application Sent</option>
                      <option value="in_review">In Review</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isApplicationsLoading ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">Loading applications...</p>
                    </div>
                  ) : filteredApplications && filteredApplications.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {user?.role === "employer" && <TableHead>Candidate ID</TableHead>}
                            <TableHead>Position</TableHead>
                            {user?.role === "student" && <TableHead>Company</TableHead>}
                            <TableHead>Applied</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredApplications.map((application) => (
                            <TableRow key={application.id}>
                              {user?.role === "employer" && (
                                <TableCell className="font-medium">
                                  Student #{application.studentId}
                                </TableCell>
                              )}
                              <TableCell>
                                {application.job?.title || `Job #${application.jobId}`}
                              </TableCell>
                              {user?.role === "student" && (
                                <TableCell>
                                  {application.job?.employerName || "Company"}
                                </TableCell>
                              )}
                              <TableCell>
                                {formatDate(application.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={`${getStatusColor(application.status).bg} ${getStatusColor(application.status).text}`}
                                >
                                  {getStatusLabel(application.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => viewApplicationDetails(application)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">
                        {statusFilter 
                          ? "No applications found with the selected status." 
                          : "No applications found."}
                      </p>
                      {statusFilter && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setStatusFilter(null)}
                        >
                          Clear Filter
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Application Details Modal */}
            {selectedApplication && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Application Details</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedApplication(null)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        {selectedApplication.job?.title || `Job #${selectedApplication.jobId}`}
                      </h3>
                      {user?.role === "student" ? (
                        <p className="text-gray-600">
                          {selectedApplication.job?.employerName || "Company"}
                        </p>
                      ) : (
                        <p className="text-gray-600">
                          Student #{selectedApplication.studentId}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-600 text-sm">
                        Applied on {formatDate(selectedApplication.createdAt)}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Status</h4>
                      <Badge 
                        className={`${getStatusColor(selectedApplication.status).bg} ${getStatusColor(selectedApplication.status).text}`}
                      >
                        {getStatusLabel(selectedApplication.status)}
                      </Badge>
                    </div>
                    
                    {selectedApplication.coverLetter && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Cover Letter</h4>
                        <div className="bg-gray-50 p-4 rounded border text-gray-700 whitespace-pre-line">
                          {selectedApplication.coverLetter}
                        </div>
                      </div>
                    )}
                    
                    {selectedApplication.resumeUrl && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Resume</h4>
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-500 mr-2" />
                          <a 
                            href={selectedApplication.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700"
                          >
                            View Resume
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Action buttons for employers */}
                    {user?.role === "employer" && selectedApplication.status !== "accepted" && selectedApplication.status !== "rejected" && (
                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={() => updateApplicationStatus(selectedApplication.id, "interview_scheduled")}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Interview
                        </Button>
                        <Button
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateApplicationStatus(selectedApplication.id, "accepted")}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {/* Message button for both */}
                    <div className="flex justify-end mt-4 pt-4 border-t">
                      <Button 
                        variant="outline"
                        onClick={() => setLocation("/messages")}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
