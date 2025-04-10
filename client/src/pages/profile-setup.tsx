import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/userAuth";
import { apiRequest } from "@/lib/queryClient";
import { StudentProfile, EmployerProfile } from "@shared/schema";

const studentProfileSchema = z.object({
  university: z.string().min(1, { message: "University is required" }),
  degree: z.string().min(1, { message: "Degree is required" }),
  fieldOfStudy: z.string().min(1, { message: "Field of study is required" }),
  graduationYear: z.coerce.number().int().min(2000).max(2030),
  linkedinUrl: z.string().url({ message: "Enter a valid LinkedIn URL" }).optional().or(z.literal("")),
  portfolioUrl: z.string().url({ message: "Enter a valid portfolio URL" }).optional().or(z.literal("")),
  bio: z.string().max(500, { message: "Bio should be less than 500 characters" }).optional(),
  phoneNumber: z.string().optional(),
  location: z.string().min(1, { message: "Location is required" }),
  skills: z.array(z.string()).min(1, { message: "At least one skill is required" }),
});

const employerProfileSchema = z.object({
  companyName: z.string().min(1, { message: "Company name is required" }),
  industry: z.string().min(1, { message: "Industry is required" }),
  companySize: z.string().min(1, { message: "Company size is required" }),
  description: z.string().min(10, { message: "Description should be at least 10 characters" }),
  websiteUrl: z.string().url({ message: "Enter a valid website URL" }),
  location: z.string().min(1, { message: "Location is required" }),
  phoneNumber: z.string().optional(),
});

type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;
type EmployerProfileFormValues = z.infer<typeof employerProfileSchema>;

export default function ProfileSetup() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  // Determine active tab based on user role
  const activeTab = user?.role || "student";

  // Fetch student profile if user is a student
  const { data: studentProfile, isLoading: isStudentProfileLoading } = useQuery<StudentProfile>({
    queryKey: [user && user.role === "student" ? `/api/student-profiles/user/${user.id}` : null],
    enabled: !!user && user.role === "student",
  });

  // Fetch employer profile if user is an employer
  const { data: employerProfile, isLoading: isEmployerProfileLoading } = useQuery<EmployerProfile>({
    queryKey: [user && user.role === "employer" ? `/api/employer-profiles/user/${user.id}` : null],
    enabled: !!user && user.role === "employer",
  });

  // Student profile form
  const studentForm = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      university: studentProfile?.university || "",
      degree: studentProfile?.degree || "",
      fieldOfStudy: studentProfile?.fieldOfStudy || "",
      graduationYear: studentProfile?.graduationYear || new Date().getFullYear() + 1,
      linkedinUrl: studentProfile?.linkedinUrl || "",
      portfolioUrl: studentProfile?.portfolioUrl || "",
      bio: studentProfile?.bio || "",
      phoneNumber: studentProfile?.phoneNumber || "",
      location: studentProfile?.location || "",
      skills: studentProfile?.skills as string[] || [],
    },
  });

  // Employer profile form
  const employerForm = useForm<EmployerProfileFormValues>({
    resolver: zodResolver(employerProfileSchema),
    defaultValues: {
      companyName: employerProfile?.companyName || "",
      industry: employerProfile?.industry || "",
      companySize: employerProfile?.companySize || "",
      description: employerProfile?.description || "",
      websiteUrl: employerProfile?.websiteUrl || "",
      location: employerProfile?.location || "",
      phoneNumber: employerProfile?.phoneNumber || "",
    },
  });

  // Update form values when profiles are loaded
  useEffect(() => {
    if (studentProfile && user?.role === "student") {
      studentForm.reset({
        university: studentProfile.university || "",
        degree: studentProfile.degree || "",
        fieldOfStudy: studentProfile.fieldOfStudy || "",
        graduationYear: studentProfile.graduationYear || new Date().getFullYear() + 1,
        linkedinUrl: studentProfile.linkedinUrl || "",
        portfolioUrl: studentProfile.portfolioUrl || "",
        bio: studentProfile.bio || "",
        phoneNumber: studentProfile.phoneNumber || "",
        location: studentProfile.location || "",
        skills: studentProfile.skills as string[] || [],
      });
    }
  }, [studentProfile, user?.role, studentForm]);

  useEffect(() => {
    if (employerProfile && user?.role === "employer") {
      employerForm.reset({
        companyName: employerProfile.companyName || "",
        industry: employerProfile.industry || "",
        companySize: employerProfile.companySize || "",
        description: employerProfile.description || "",
        websiteUrl: employerProfile.websiteUrl || "",
        location: employerProfile.location || "",
        phoneNumber: employerProfile.phoneNumber || "",
      });
    }
  }, [employerProfile, user?.role, employerForm]);

  const handleStudentSkillInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      const currentSkills = studentForm.getValues().skills || [];
      const newSkill = e.currentTarget.value.trim();
      
      if (!currentSkills.includes(newSkill)) {
        studentForm.setValue('skills', [...currentSkills, newSkill]);
        e.currentTarget.value = '';
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = studentForm.getValues().skills || [];
    studentForm.setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const onStudentSubmit = async (data: StudentProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...data,
        userId: user.id,
      };
      
      if (studentProfile) {
        // Update existing profile
        await apiRequest("PATCH", `/api/student-profiles/${studentProfile.id}`, payload);
        toast({
          title: "Profile updated",
          description: "Your student profile has been successfully updated.",
        });
      } else {
        // Create new profile
        await apiRequest("POST", "/api/student-profiles", payload);
        toast({
          title: "Profile created",
          description: "Your student profile has been successfully created.",
        });
      }
      
      // Handle resume upload - this would be implemented in a real application
      if (resumeFile) {
        console.log("Would upload resume file:", resumeFile.name);
        // In a real application, you would upload the file to a server
      }
      
      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/student-profiles/user/${user.id}`] });
      
      // Redirect to dashboard
      setLocation("/dashboard/student");
    } catch (error) {
      console.error("Failed to save student profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEmployerSubmit = async (data: EmployerProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...data,
        userId: user.id,
      };
      
      if (employerProfile) {
        // Update existing profile
        await apiRequest("PATCH", `/api/employer-profiles/${employerProfile.id}`, payload);
        toast({
          title: "Profile updated",
          description: "Your employer profile has been successfully updated.",
        });
      } else {
        // Create new profile
        await apiRequest("POST", "/api/employer-profiles", payload);
        toast({
          title: "Profile created",
          description: "Your employer profile has been successfully created.",
        });
      }
      
      // Handle logo upload - this would be implemented in a real application
      if (logoFile) {
        console.log("Would upload logo file:", logoFile.name);
        // In a real application, you would upload the file to a server
      }
      
      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/employer-profiles/user/${user.id}`] });
      
      // Redirect to dashboard
      setLocation("/dashboard/employer");
    } catch (error) {
      console.error("Failed to save employer profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Profile Setup</h1>
              <p className="text-sm text-gray-500 mt-1">
                Complete your profile to get better matches and opportunities.
              </p>
            </div>
            
            <Tabs defaultValue={activeTab} className="space-y-6">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="student" disabled={user?.role !== "student"}>
                  Student Profile
                </TabsTrigger>
                <TabsTrigger value="employer" disabled={user?.role !== "employer"}>
                  Employer Profile
                </TabsTrigger>
              </TabsList>
              
              {/* Student Profile Form */}
              <TabsContent value="student">
                {isStudentProfileLoading ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Profile</CardTitle>
                      <CardDescription>Loading your profile information...</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Form {...studentForm}>
                    <form onSubmit={studentForm.handleSubmit(onStudentSubmit)}>
                      <Card>
                        <CardHeader>
                          <CardTitle>Education Information</CardTitle>
                          <CardDescription>
                            Enter your educational background to help us match you with relevant internships.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={studentForm.control}
                            name="university"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>University/College</FormLabel>
                                <FormControl>
                                  <Input placeholder="Stanford University" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={studentForm.control}
                              name="degree"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Bachelor of Science" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={studentForm.control}
                              name="fieldOfStudy"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Field of Study</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Computer Science" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={studentForm.control}
                            name="graduationYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expected Graduation Year</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                      
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>
                            Add details about yourself to help employers get to know you better.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={studentForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="San Francisco, CA" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormDescription>
                                  Your current location or where you're willing to work.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={studentForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (123) 456-7890" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={studentForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell employers a bit about yourself, your interests, and career goals." 
                                    className="resize-none h-32"
                                    {...field} 
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Maximum 500 characters.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                      
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle>Professional Information</CardTitle>
                          <CardDescription>
                            Add your professional details to showcase your experience and skillset.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={studentForm.control}
                            name="skills"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Skills</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Input 
                                      placeholder="Add skills (press Enter after each skill)"
                                      onKeyDown={handleStudentSkillInput}
                                      disabled={isSubmitting}
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {field.value.map((skill, index) => (
                                        <div 
                                          key={index} 
                                          className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-sm flex items-center"
                                        >
                                          {skill}
                                          <button 
                                            type="button" 
                                            className="ml-1 text-primary-500 hover:text-primary-700"
                                            onClick={() => removeSkill(skill)}
                                            disabled={isSubmitting}
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Add relevant skills that showcase your expertise.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={studentForm.control}
                              name="linkedinUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>LinkedIn URL (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://linkedin.com/in/yourprofile" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={studentForm.control}
                              name="portfolioUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Portfolio URL (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://yourportfolio.com" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div>
                            <FormLabel>Resume</FormLabel>
                            <FileUpload
                              id="resume"
                              label="Upload your resume"
                              accept=".pdf,.doc,.docx"
                              onChange={setResumeFile}
                              className="mt-2"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                              Supported formats: PDF, DOC, DOCX. Max size: 5MB.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="mt-6 flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="mr-4"
                        >
                          {isSubmitting ? "Saving..." : "Save Profile"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setLocation("/dashboard/student")}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </TabsContent>
              
              {/* Employer Profile Form */}
              <TabsContent value="employer">
                {isEmployerProfileLoading ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Employer Profile</CardTitle>
                      <CardDescription>Loading your profile information...</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Form {...employerForm}>
                    <form onSubmit={employerForm.handleSubmit(onEmployerSubmit)}>
                      <Card>
                        <CardHeader>
                          <CardTitle>Company Information</CardTitle>
                          <CardDescription>
                            Tell us about your company to help students find your internship opportunities.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={employerForm.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Corporation" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={employerForm.control}
                              name="industry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Industry</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Technology" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={employerForm.control}
                              name="companySize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Size</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. 1-10, 11-50, 51-200, 201-500, 500+" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={employerForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe your company, mission, values, and work culture." 
                                    className="resize-none h-32"
                                    {...field} 
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                      
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle>Contact Information</CardTitle>
                          <CardDescription>
                            Provide contact details for students to reach your company.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={employerForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="San Francisco, CA" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={employerForm.control}
                            name="websiteUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://www.example.com" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={employerForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (123) 456-7890" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div>
                            <FormLabel>Company Logo</FormLabel>
                            <FileUpload
                              id="logo"
                              label="Upload your company logo"
                              accept=".jpg,.jpeg,.png,.svg"
                              onChange={setLogoFile}
                              className="mt-2"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                              Recommended size: 400x400 pixels. Max size: 2MB.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="mt-6 flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="mr-4"
                        >
                          {isSubmitting ? "Saving..." : "Save Profile"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setLocation("/dashboard/employer")}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
