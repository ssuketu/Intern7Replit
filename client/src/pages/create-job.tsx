import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/userAuth";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { EmployerProfile } from "@shared/schema";

const jobSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  location: z.string().min(2, { message: "Location is required" }),
  isRemote: z.boolean().default(false),
  isHybrid: z.boolean().default(false),
  duration: z.string().min(2, { message: "Duration is required" }),
  salary: z.string().optional(),
  skills: z.array(z.string()).min(1, { message: "Add at least one required skill" }),
  requirements: z.array(z.string()).min(1, { message: "Add at least one requirement" }),
  expiresAt: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobSchema>;

export default function CreateJob() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch employer profile
  const { data: employerProfile } = useQuery<EmployerProfile>({
    queryKey: [user && user.role === "employer" ? `/api/employer-profiles/user/${user.id}` : null],
    enabled: !!user && user.role === "employer",
  });

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      isRemote: false,
      isHybrid: false,
      duration: "",
      salary: "",
      skills: [],
      requirements: [],
      expiresAt: "",
    },
  });

  const handleSkillInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      const currentSkills = form.getValues().skills || [];
      const newSkill = e.currentTarget.value.trim();
      
      if (!currentSkills.includes(newSkill)) {
        form.setValue('skills', [...currentSkills, newSkill]);
        e.currentTarget.value = '';
      }
    }
  };

  const handleRequirementInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      const currentRequirements = form.getValues().requirements || [];
      const newRequirement = e.currentTarget.value.trim();
      
      if (!currentRequirements.includes(newRequirement)) {
        form.setValue('requirements', [...currentRequirements, newRequirement]);
        e.currentTarget.value = '';
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues().skills || [];
    form.setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
  };

  const removeRequirement = (requirementToRemove: string) => {
    const currentRequirements = form.getValues().requirements || [];
    form.setValue('requirements', currentRequirements.filter(req => req !== requirementToRemove));
  };

  const onSubmit = async (data: JobFormValues) => {
    if (!user || !employerProfile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You need to set up your employer profile first",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...data,
        employerId: employerProfile.id,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      };
      
      await apiRequest("POST", "/api/jobs", payload);
      
      toast({
        title: "Job posted",
        description: "Your internship position has been successfully posted.",
      });
      
      // Redirect to employer dashboard
      setLocation("/dashboard/employer");
    } catch (error) {
      console.error("Failed to create job:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post internship. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || (user && user.role !== "employer")) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Post New Internship</h1>
              <p className="text-sm text-gray-500 mt-1">
                Create a new internship posting to find qualified student candidates.
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Provide the basic details about the internship position.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Software Engineering Intern" 
                              {...field} 
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the internship position, responsibilities, and what interns will learn" 
                              className="resize-none h-32"
                              {...field} 
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. San Francisco, CA" 
                                {...field} 
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="isRemote"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Remote Option</FormLabel>
                                <FormDescription>
                                  Can this internship be done remotely?
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isHybrid"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Hybrid Option</FormLabel>
                                <FormDescription>
                                  Is this a hybrid internship?
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements & Details</CardTitle>
                    <CardDescription>
                      Specify the requirements, skills, and other details for the internship.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. 3 months, Summer 2023" 
                                {...field} 
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salary/Stipend (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. $20/hr, $1000/month, Unpaid" 
                                {...field} 
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Skills</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input 
                                placeholder="Add skills (press Enter after each skill)"
                                onKeyDown={handleSkillInput}
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
                            Add skills that candidates should have for this position.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requirements</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input 
                                placeholder="Add requirements (press Enter after each requirement)"
                                onKeyDown={handleRequirementInput}
                                disabled={isSubmitting}
                              />
                              <div className="flex flex-col gap-2 mt-2">
                                {field.value.map((requirement, index) => (
                                  <div 
                                    key={index} 
                                    className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-md text-sm flex items-center justify-between"
                                  >
                                    <span>{requirement}</span>
                                    <button 
                                      type="button" 
                                      className="text-gray-500 hover:text-gray-700"
                                      onClick={() => removeRequirement(requirement)}
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
                            List requirements such as education level, experience, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Deadline (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormDescription>
                            If left blank, the posting will remain active until manually closed.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/dashboard/employer")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Posting..." : "Post Internship"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
