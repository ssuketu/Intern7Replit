import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2, School, User, TrendingUp } from "lucide-react";
import { SkillGapAnalysis } from "@shared/schema";

interface CareerProgressProps {
  skillGapAnalysis?: SkillGapAnalysis;
}

export function CareerProgress({ skillGapAnalysis }: CareerProgressProps) {
  // If no skill gap analysis is provided, show default data
  const defaultSkills = [
    { name: "Machine Learning", proficiency: 75 },
    { name: "Cloud Computing", proficiency: 45 },
    { name: "Web Development", proficiency: 80 }
  ];
  
  const skills = skillGapAnalysis?.results?.skills || defaultSkills;
  
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Career Progress</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Skill Gap Analysis */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Skill Gap Analysis</p>
            <Button variant="link" size="sm" className="text-xs font-medium text-primary-500 hover:text-primary-600 p-0 h-auto">
              View Full Report
            </Button>
          </div>
          
          {/* Skills Progress Bars */}
          <div className="space-y-4 mt-4">
            {skills.map((skill, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-600">{skill.name}</p>
                  <p className="text-xs text-gray-500">{skill.proficiency}% proficiency</p>
                </div>
                <Progress value={skill.proficiency} className="h-2 bg-gray-200" indicatorClassName="bg-emerald-500" />
              </div>
            ))}
          </div>
          
          <Button variant="link" size="sm" className="mt-4 text-sm text-primary-500 hover:text-primary-600 p-0 h-auto">
            Recommended courses for improvement
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        {/* Career Path Visualization */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700">Career Path</p>
            <Button variant="link" size="sm" className="text-xs font-medium text-primary-500 hover:text-primary-600 p-0 h-auto">
              Explore Paths
            </Button>
          </div>
          
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute h-1 bg-gray-200 left-0 right-0 top-1/2 transform -translate-y-1/2 z-0"></div>
            <div className="absolute h-1 bg-primary-500 left-0 right-2/3 top-1/2 transform -translate-y-1/2 z-0"></div>
            
            {/* Nodes */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-700">Intern</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-primary-100 border-2 border-primary-500 flex items-center justify-center">
                  <School className="h-4 w-4 text-primary-500" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-700">Graduate</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-500">Junior</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-500">Senior</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
