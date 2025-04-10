import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}

export function calculateProfileCompletionPercentage(profile: any): number {
  if (!profile) return 0;
  
  const fields = [
    'university', 'degree', 'fieldOfStudy', 'graduationYear', 
    'resumeUrl', 'linkedinUrl', 'bio', 'phoneNumber', 'location'
  ];
  
  const arrayFields = [
    'skills', 'experience', 'projects', 'educations', 'certifications'
  ];
  
  let completedFields = 0;
  let totalFields = fields.length + arrayFields.length;
  
  fields.forEach(field => {
    if (profile[field]) {
      completedFields++;
    }
  });
  
  arrayFields.forEach(field => {
    const array = profile[field];
    if (array && array.length > 0) {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / totalFields) * 100);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

export function calculateMatchScore(studentSkills: string[], jobSkills: string[]): number {
  if (!studentSkills.length || !jobSkills.length) return 0;
  
  const matchingSkills = studentSkills.filter(skill => 
    jobSkills.includes(skill)
  ).length;
  
  return Math.round((matchingSkills / jobSkills.length) * 100);
}

export function getStatusColor(status: string): {bg: string, text: string} {
  switch (status.toLowerCase()) {
    case 'applied':
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
    case 'in_review':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'interview_scheduled':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'accepted':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
    case 'rejected':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

export function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'applied':
      return 'Application Sent';
    case 'in_review':
      return 'In Review';
    case 'interview_scheduled':
      return 'Interview Scheduled';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
}
