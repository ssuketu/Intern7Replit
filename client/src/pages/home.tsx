import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/lib/userAuth";
import { LogoWithText } from "@/components/ui/logo";
import { AnimatedGrowthIcon } from "@/components/ui/animated-growth-icon";
import { 
  AptitudeCipherIcon, 
  ProficiencyNexusIcon, 
  EncounterLensIcon, 
  GrowthTrajectoryIcon 
} from "@/components/ui/feature-icons";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "student":
        return "/dashboard/student";
      case "employer":
        return "/dashboard/employer";
      case "admin":
        return "/dashboard/admin";
      default:
        return "/login";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <LogoWithText size="large" />
            </div>
            <div className="flex items-center justify-center mb-4">
              <AnimatedGrowthIcon className="mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Add Experience to Knowledge
              </h1>
            </div>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Intelligent pathways connecting ambition with opportunity, fostering holistic career emergence.
            </p>
            <div className="space-x-4">
              {isAuthenticated ? (
                <Link href={getDashboardLink()}>
                  <Button size="lg" className="bg-white text-primary-800 hover:bg-primary-50">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="bg-white text-primary-800 hover:bg-primary-50">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-primary-700">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Presentation */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">The InternVacancy Edge</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Intelligently connecting ambition with opportunity, fostering holistic career emergence.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-6 hover:shadow-md transition-shadow duration-300 rounded-lg">
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <AptitudeCipherIcon />
                </div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                  Aptitude Cipher
                </h3>
                <p className="text-gray-600">
                  Decode Your Readiness.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="text-center p-6 hover:shadow-md transition-shadow duration-300 rounded-lg">
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <ProficiencyNexusIcon />
                </div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                  Proficiency Nexus
                </h3>
                <p className="text-gray-600">
                  Bridge Your Skill Horizon.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="text-center p-6 hover:shadow-md transition-shadow duration-300 rounded-lg">
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <EncounterLensIcon />
                </div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                  Encounter Lens
                </h3>
                <p className="text-gray-600">
                  Sharpen Your Interview Persona.
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="text-center p-6 hover:shadow-md transition-shadow duration-300 rounded-lg">
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <GrowthTrajectoryIcon />
                </div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                  Growth Trajectory
                </h3>
                <p className="text-gray-600">
                  Chart Your Evolving Path.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* For Students Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="lg:flex lg:items-center lg:gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">For Students</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Find internships that align with your skills, interests, and career goals. Get personalized recommendations and insights to help you make informed decisions.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">AI-powered resume parsing and skill analysis</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Personalized internship recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Skill gap analysis and learning recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Career path visualization and development</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button>Create Student Account</Button>
                </Link>
              </div>
              <div className="mt-8 lg:mt-0 lg:w-1/2 bg-primary-100 rounded-lg p-6 lg:p-8">
                <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden shadow-lg">
                  <div className="bg-primary-200 w-full h-full flex items-center justify-center text-primary-700">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* For Employers Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="lg:flex lg:items-center lg:gap-12 flex-row-reverse">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">For Employers</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Connect with the most qualified candidates for your internship positions. Our AI matching system saves you time and ensures you find the right fit.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">AI-powered candidate matching and recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Streamlined application review process</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Direct messaging with qualified candidates</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Detailed analytics and insights on your postings</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button>Create Employer Account</Button>
                </Link>
              </div>
              <div className="mt-8 lg:mt-0 lg:w-1/2 bg-primary-100 rounded-lg p-6 lg:p-8">
                <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden shadow-lg">
                  <div className="bg-primary-200 w-full h-full flex items-center justify-center text-primary-700">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Colleges Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="lg:flex lg:items-center lg:gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">For Colleges</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Streamline pre-campus placements with our powerful tools for college administrators. Manage student data, approve employer connections, and track placement success.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Bulk student data uploading (CV/resumes and CSV)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Employer approval system for campus placements</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Comprehensive analytics on student placements</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-500 mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Curriculum guidance based on industry demand</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button>Create College Account</Button>
                </Link>
              </div>
              <div className="mt-8 lg:mt-0 lg:w-1/2 bg-primary-100 rounded-lg p-6 lg:p-8">
                <div className="aspect-w-16 aspect-h-9 rounded-md overflow-hidden shadow-lg">
                  <div className="bg-primary-200 w-full h-full flex items-center justify-center text-primary-700">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Employer CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Nurture Tomorrow's Innovators?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Discover nascent talent poised for impactful growth.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700">
                Cultivate Talent
              </Button>
            </Link>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">The InternVacancy Experience</h2>
            <p className="text-lg text-white opacity-90 mb-8">
              Join the platform intelligently connecting ambition with opportunity, fostering holistic career emergence.
            </p>
            <div className="space-x-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-primary-700">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
