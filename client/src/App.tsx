import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./lib/userAuth.tsx";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import StudentDashboard from "@/pages/student-dashboard";
import EmployerDashboard from "@/pages/employer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ProfileSetup from "@/pages/profile-setup";
import CreateJob from "@/pages/create-job";
import JobDetails from "@/pages/job-details";
import SearchJobs from "@/pages/search-jobs";
import SearchCandidates from "@/pages/search-candidates";
import Applications from "@/pages/applications";
import Messages from "@/pages/messages";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard/student" component={StudentDashboard} />
      <Route path="/dashboard/employer" component={EmployerDashboard} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/jobs/create" component={CreateJob} />
      <Route path="/jobs/:id" component={JobDetails} />
      <Route path="/jobs/search" component={SearchJobs} />
      <Route path="/candidates/search" component={SearchCandidates} />
      <Route path="/applications" component={Applications} />
      <Route path="/messages" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
