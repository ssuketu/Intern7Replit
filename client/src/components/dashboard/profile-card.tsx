import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/userAuth";
import { PencilIcon, User2, FileText, PlusCircle, GraduationCap, Award } from "lucide-react";
import { Link } from "wouter";
import { StudentProfile } from "@shared/schema";

interface ProfileCardProps {
  profile: StudentProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get top 5 skills
  const topSkills = (profile.skills as string[]).slice(0, 5);
  const remainingSkillsCount = Math.max(0, (profile.skills as string[]).length - 5);
  
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 overflow-hidden">
            <User2 className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">{user?.name || "User"}</h2>
            <p className="text-sm text-gray-500">{profile.degree || "Student"}</p>
            <p className="text-sm text-gray-500">{profile.university || "University"}</p>
          </div>
          <div className="ml-auto">
            <Link href="/profile-setup">
              <Button variant="ghost" size="icon">
                <PencilIcon className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Profile Completion */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Profile Completion</p>
            <p className="text-sm font-medium text-primary-500">{profile.profileCompletionPercentage}%</p>
          </div>
          <Progress value={profile.profileCompletionPercentage} className="h-2" />
          <p className="mt-2 text-xs text-gray-500">Complete your profile to improve matching accuracy</p>
        </div>
        
        {/* Skills Section */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Top Skills</h3>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                {skill}
              </Badge>
            ))}
            {remainingSkillsCount > 0 && (
              <Button 
                variant="ghost" 
                className="px-2 py-1 h-auto text-xs font-medium text-gray-500 hover:text-primary-500"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                +{remainingSkillsCount} more
              </Button>
            )}
          </div>
          
          {isExpanded && (
            <div className="mt-2 flex flex-wrap gap-2">
              {(profile.skills as string[]).slice(5).map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick Links */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/profile-setup" className="flex items-center text-sm text-gray-600 hover:text-primary-500">
                <FileText className="h-4 w-4 mr-2" />
                Update Resume
              </Link>
            </li>
            <li>
              <Link href="/profile-setup" className="flex items-center text-sm text-gray-600 hover:text-primary-500">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Projects
              </Link>
            </li>
            <li>
              <Link href="/profile-setup" className="flex items-center text-sm text-gray-600 hover:text-primary-500">
                <GraduationCap className="h-4 w-4 mr-2" />
                Add Education
              </Link>
            </li>
            <li>
              <Link href="/profile-setup" className="flex items-center text-sm text-gray-600 hover:text-primary-500">
                <Award className="h-4 w-4 mr-2" />
                Take Skill Assessment
              </Link>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
