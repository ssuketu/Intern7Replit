import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/ui/match-score";
import { Job } from "@shared/schema";
import { Bookmark } from "lucide-react";
import { Link } from "wouter";

interface InternshipCardProps {
  job: Job;
  score: number;
  isNew?: boolean;
  isPopular?: boolean;
  onApply?: (jobId: number) => void;
  onSave?: (jobId: number) => void;
}

export function InternshipCard({ 
  job, 
  score, 
  isNew, 
  isPopular,
  onApply,
  onSave
}: InternshipCardProps) {
  const handleApply = () => {
    if (onApply) {
      onApply(job.id);
    }
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(job.id);
    }
  };
  
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors border-b border-gray-200">
      <div className="sm:flex sm:items-start sm:justify-between">
        <div className="sm:flex sm:items-start">
          <div className="h-12 w-12 rounded-md bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
            {job.logoUrl ? (
              <img 
                src={job.logoUrl} 
                alt={job.title} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <span className="text-gray-400 text-xl font-bold">
                {job.title.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <div className="flex items-center">
              <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
              {isNew && (
                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                  New
                </Badge>
              )}
              {isPopular && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                  Popular
                </Badge>
              )}
            </div>
            
            <div className="mt-1 flex items-center">
              <p className="text-sm text-gray-600 font-medium">{job.employerName}</p>
              <span className="mx-1.5 text-gray-500">•</span>
              <p className="text-sm text-gray-600">
                {job.location} 
                {job.isRemote && " (Remote)"}
                {job.isHybrid && " (Hybrid)"}
              </p>
            </div>
            
            <div className="mt-2">
              <div className="flex items-center flex-wrap gap-2">
                {(job.skills as string[]).slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                    {skill}
                  </Badge>
                ))}
                {job.duration && (
                  <Badge variant="outline" className="text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                    {job.duration}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-end">
          {/* Match Score */}
          <div className="h-16 w-16">
            <MatchScore score={score} />
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleSave}
            >
              <Bookmark className="h-4 w-4 mr-1" />
              Save
            </Button>
            
            <Link href={`/jobs/${job.id}`}>
              <Button
                size="sm"
                className="text-xs"
                onClick={handleApply}
              >
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
