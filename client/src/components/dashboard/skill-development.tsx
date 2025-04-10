import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star, StarHalf } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { LearningResource } from "@shared/schema";

interface SkillDevelopmentProps {
  studentId?: number;
}

export function SkillDevelopment({ studentId }: SkillDevelopmentProps) {
  const { data: resources, isLoading } = useQuery<LearningResource[]>({
    queryKey: [studentId ? `/api/learning-resources/recommended/${studentId}` : '/api/learning-resources'],
    enabled: true,
  });

  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-gray-900">
          Recommended Learning Resources
        </CardTitle>
        <Link href="#">
          <Button variant="link" size="sm" className="text-sm text-primary-500 hover:text-primary-600 p-0 h-auto">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <ResourceCardSkeleton />
            <ResourceCardSkeleton />
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {resources.slice(0, 2).map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No learning resources available</p>
            <p className="text-sm text-gray-400">Complete your profile to get personalized recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ResourceCardProps {
  resource: LearningResource;
}

function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
      <div className="h-40 bg-gray-100">
        {resource.imageUrl ? (
          <img
            src={resource.imageUrl}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-500">
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary-500">{resource.category}</p>
          <h4 className="text-base font-semibold text-gray-900 mt-1">{resource.title}</h4>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{resource.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            {Array.from({ length: Math.floor(resource.rating || 0) }).map((_, i) => (
              <Star key={i} className="text-yellow-400 h-4 w-4" />
            ))}
            {resource.rating && !Number.isInteger(resource.rating) && (
              <StarHalf className="text-yellow-400 h-4 w-4" />
            )}
            {Array.from({ length: 5 - Math.ceil(resource.rating || 0) }).map((_, i) => (
              <Star key={i} className="text-gray-300 h-4 w-4" />
            ))}
            <span className="ml-1 text-xs text-gray-500">
              ({resource.ratingCount || 0})
            </span>
          </div>
          <span className="text-xs font-medium text-gray-700">
            {resource.isFree ? "Free" : resource.price}
          </span>
        </div>
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          <Button className="mt-4 w-full">
            Start Learning
          </Button>
        </a>
      </div>
    </div>
  );
}

function ResourceCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col animate-pulse">
      <div className="h-40 bg-gray-200"></div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 w-10 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-4 h-9 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
}
