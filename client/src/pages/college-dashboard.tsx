import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/userAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CollegeProfile, BulkUpload, EmployerApproval } from "@shared/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatDate(dateString: Date | null | undefined) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  let color = "";
  let icon = null;

  switch (status) {
    case "processing":
      color = "bg-yellow-200 text-yellow-800";
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case "completed":
      color = "bg-green-200 text-green-800";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "failed":
      color = "bg-red-200 text-red-800";
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    case "pending":
      color = "bg-yellow-200 text-yellow-800";
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case "approved":
      color = "bg-green-200 text-green-800";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "rejected":
      color = "bg-red-200 text-red-800";
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    default:
      color = "bg-gray-200 text-gray-800";
  }

  return (
    <Badge className={`flex items-center ${color}`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function CollegeDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    if (user.role !== "college") {
      setLocation("/");
      toast({
        title: "Access Denied",
        description: "You must be a college to access this page.",
        variant: "destructive",
      });
      return;
    }
  }, [user, setLocation, toast]);

  // Fetch college profile
  const {
    data: collegeProfile,
    isLoading: loadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: ["/api/college-profiles/user", user?.id],
    queryFn: () => {
      if (!user?.id) return null;
      return apiRequest("GET", `/api/college-profiles/user/${user.id}`).then(
        (res) => res.json()
      );
    },
    enabled: !!user?.id,
  });

  // Fetch bulk uploads
  const {
    data: bulkUploads,
    isLoading: loadingUploads,
    error: uploadsError,
  } = useQuery({
    queryKey: ["/api/bulk-uploads/college", collegeProfile?.id],
    queryFn: () => {
      if (!collegeProfile?.id) return [];
      return apiRequest(
        "GET",
        `/api/bulk-uploads/college/${collegeProfile.id}`
      ).then((res) => res.json());
    },
    enabled: !!collegeProfile?.id,
  });

  // Fetch employer approvals
  const {
    data: employerApprovals,
    isLoading: loadingApprovals,
    error: approvalsError,
  } = useQuery({
    queryKey: ["/api/employer-approvals/college", collegeProfile?.id],
    queryFn: () => {
      if (!collegeProfile?.id) return [];
      return apiRequest(
        "GET",
        `/api/employer-approvals/college/${collegeProfile.id}`
      ).then((res) => res.json());
    },
    enabled: !!collegeProfile?.id,
  });

  // Create approval mutation
  const approvalMutation = useMutation({
    mutationFn: async (data: {
      collegeId: number;
      employerId: number;
    }) => {
      const res = await apiRequest("POST", "/api/employer-approvals", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Approval requested",
        description: "Employer approval request has been created.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/employer-approvals/college", collegeProfile?.id],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create approval request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update approval status mutation
  const updateApprovalMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      reason,
    }: {
      id: number;
      status: string;
      reason?: string;
    }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/employer-approvals/${id}/status`,
        { status, reason }
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Employer approval status has been updated.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/employer-approvals/college", collegeProfile?.id],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !collegeProfile) return;

    setUploading(true);
    setFileUploadProgress(0);

    // Create a FormData object to upload the file
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // First, upload the file to get a URL
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const { fileUrl } = await uploadResponse.json();

      // Create a bulk upload record
      const bulkUploadData = {
        collegeId: collegeProfile.id,
        filename: selectedFile.name,
        fileUrl,
        recordCount: Math.floor(Math.random() * 100) + 10, // This would normally come from parsing the file
      };

      const createResponse = await apiRequest(
        "POST",
        "/api/bulk-uploads",
        bulkUploadData
      );

      if (!createResponse.ok) {
        throw new Error("Failed to create bulk upload record");
      }

      // Simulate processing progress
      const newUpload = await createResponse.json();
      
      queryClient.invalidateQueries({
        queryKey: ["/api/bulk-uploads/college", collegeProfile.id],
      });

      toast({
        title: "Upload successful",
        description: "File has been uploaded and is now being processed.",
      });
      
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p>
          {profileError instanceof Error
            ? profileError.message
            : "Failed to load profile data"}
        </p>
        <Button onClick={() => setLocation("/profile-setup")} className="mt-4">
          Create Your College Profile
        </Button>
      </div>
    );
  }

  if (!collegeProfile) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Welcome to College Dashboard</h2>
        <p className="mb-6">
          You need to create a college profile to use this dashboard.
        </p>
        <Button onClick={() => setLocation("/profile-setup")}>
          Create College Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">College Dashboard</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-8"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bulk-uploads">Bulk Uploads</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>College Profile</CardTitle>
                <CardDescription>Your college information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">College Name</h3>
                    <p>{collegeProfile.collegeName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p>{collegeProfile.address || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p>{collegeProfile.phoneNumber || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Website</h3>
                    <p>{collegeProfile.websiteUrl || "Not specified"}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/profile-setup`)}
                >
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dashboard Summary</CardTitle>
                <CardDescription>Key metrics and stats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Total Uploads</p>
                    <p className="text-2xl font-bold">
                      {bulkUploads ? bulkUploads.length : 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Pending Approvals</p>
                    <p className="text-2xl font-bold">
                      {employerApprovals
                        ? employerApprovals.filter(
                            (a: EmployerApproval) => a.status === "pending"
                          ).length
                        : 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600">Approved Employers</p>
                    <p className="text-2xl font-bold">
                      {employerApprovals
                        ? employerApprovals.filter(
                            (a: EmployerApproval) => a.status === "approved"
                          ).length
                        : 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600">Total Students</p>
                    <p className="text-2xl font-bold">
                      {bulkUploads
                        ? bulkUploads.reduce(
                            (acc: number, upload: BulkUpload) =>
                              acc + (upload.successCount || 0),
                            0
                          )
                        : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk-uploads" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Bulk Uploads</CardTitle>
              <CardDescription>
                Upload CSV files with student data or resume PDFs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="col-span-2">
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".csv,.pdf"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to select a file (.csv or .pdf)
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Maximum file size: 10MB
                      </span>
                    </Label>
                  </div>
                  {selectedFile && (
                    <div className="mt-4">
                      <p className="text-sm">
                        Selected file: <strong>{selectedFile.name}</strong> (
                        {Math.round(selectedFile.size / 1024)} KB)
                      </p>
                      <Button
                        onClick={uploadFile}
                        disabled={uploading}
                        className="mt-2"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload File"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium mb-2">Upload Instructions</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Accepted formats: CSV, PDF</li>
                    <li>For CSV: Include headers in the first row</li>
                    <li>
                      Required columns: Name, Email, Course, Year, Skills
                    </li>
                    <li>For bulk PDFs: Upload a zip file with resumes</li>
                  </ul>
                </div>
              </div>

              <div className="overflow-auto">
                <Table>
                  <TableCaption>
                    {loadingUploads ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading uploads...
                      </span>
                    ) : bulkUploads?.length === 0 ? (
                      "No uploads yet"
                    ) : (
                      "A list of your recent uploads"
                    )}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Success</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkUploads &&
                      bulkUploads.map((upload: BulkUpload) => (
                        <TableRow key={upload.id}>
                          <TableCell className="font-medium">
                            {upload.filename}
                          </TableCell>
                          <TableCell>
                            {formatDate(upload.uploadedAt)}
                          </TableCell>
                          <TableCell>{upload.recordCount || "N/A"}</TableCell>
                          <TableCell>
                            <StatusBadge status={upload.status || "unknown"} />
                          </TableCell>
                          <TableCell>{upload.successCount || 0}</TableCell>
                          <TableCell>{upload.errorCount || 0}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Employer Approvals</CardTitle>
              <CardDescription>
                Manage employers who can access your students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableCaption>
                    {loadingApprovals ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading approvals...
                      </span>
                    ) : employerApprovals?.length === 0 ? (
                      "No employer approvals yet"
                    ) : (
                      "A list of employer approval requests"
                    )}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employer</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employerApprovals &&
                      employerApprovals.map(
                        (approval: any) => (
                          <TableRow key={approval.id}>
                            <TableCell className="font-medium">
                              {approval.employer?.user?.name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {approval.employer?.companyName || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {approval.employer?.industry || "N/A"}
                            </TableCell>
                            <TableCell>
                              {formatDate(approval.createdAt)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={approval.status} />
                            </TableCell>
                            <TableCell>
                              {approval.status === "pending" && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-green-50 hover:bg-green-100 border-green-200"
                                    onClick={() =>
                                      updateApprovalMutation.mutate({
                                        id: approval.id,
                                        status: "approved",
                                      })
                                    }
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-50 hover:bg-red-100 border-red-200"
                                    onClick={() =>
                                      updateApprovalMutation.mutate({
                                        id: approval.id,
                                        status: "rejected",
                                        reason: "Not approved at this time",
                                      })
                                    }
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}