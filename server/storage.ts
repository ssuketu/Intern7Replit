import {
  type User, type InsertUser,
  type StudentProfile, type InsertStudentProfile,
  type EmployerProfile, type InsertEmployerProfile,
  type Job, type InsertJob,
  type Application, type InsertApplication,
  type Message, type InsertMessage,
  type SkillMatchScore, type SkillGapAnalysis,
  type LearningResource, type InsertLearningResource
} from "@shared/schema";

// Storage interface for the application
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Student profiles
  getStudentProfile(id: number): Promise<StudentProfile | undefined>;
  getStudentProfileByUserId(userId: number): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(id: number, profileData: Partial<InsertStudentProfile>): Promise<StudentProfile | undefined>;
  getAllStudentProfiles(): Promise<StudentProfile[]>;
  
  // Employer profiles
  getEmployerProfile(id: number): Promise<EmployerProfile | undefined>;
  getEmployerProfileByUserId(userId: number): Promise<EmployerProfile | undefined>;
  createEmployerProfile(profile: InsertEmployerProfile): Promise<EmployerProfile>;
  updateEmployerProfile(id: number, profileData: Partial<InsertEmployerProfile>): Promise<EmployerProfile | undefined>;
  getAllEmployerProfiles(): Promise<EmployerProfile[]>;
  
  // Jobs
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, jobData: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;
  getJobsByEmployerId(employerId: number): Promise<Job[]>;
  getAllActiveJobs(): Promise<Job[]>;
  searchJobs(query: string, filters?: any): Promise<Job[]>;
  
  // Applications
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, applicationData: Partial<InsertApplication>): Promise<Application | undefined>;
  getApplicationsByStudentId(studentId: number): Promise<Application[]>;
  getApplicationsByJobId(jobId: number): Promise<Application[]>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  getUnreadMessagesCount(userId: number): Promise<number>;
  markMessageAsRead(id: number): Promise<boolean>;
  
  // Skill matching and analysis
  createOrUpdateSkillMatchScore(studentId: number, jobId: number, score: number): Promise<SkillMatchScore>;
  getSkillMatchScore(studentId: number, jobId: number): Promise<SkillMatchScore | undefined>;
  getTopMatchingJobsForStudent(studentId: number, limit?: number): Promise<{job: Job, score: number}[]>;
  getTopMatchingStudentsForJob(jobId: number, limit?: number): Promise<{student: StudentProfile, score: number}[]>;
  
  // Skill Gap Analysis
  getSkillGapAnalysisForStudent(studentId: number): Promise<SkillGapAnalysis | undefined>;
  createSkillGapAnalysis(studentId: number, results: any): Promise<SkillGapAnalysis>;
  
  // Learning Resources
  getLearningResource(id: number): Promise<LearningResource | undefined>;
  createLearningResource(resource: InsertLearningResource): Promise<LearningResource>;
  getLearningResourcesBySkill(skillTag: string): Promise<LearningResource[]>;
  getRecommendedLearningResourcesForStudent(studentId: number): Promise<LearningResource[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private studentProfiles: Map<number, StudentProfile>;
  private employerProfiles: Map<number, EmployerProfile>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private messages: Map<number, Message>;
  private skillMatchScores: Map<string, SkillMatchScore>;
  private skillGapAnalyses: Map<number, SkillGapAnalysis>;
  private learningResources: Map<number, LearningResource>;
  
  private userIdCounter: number;
  private studentProfileIdCounter: number;
  private employerProfileIdCounter: number;
  private jobIdCounter: number;
  private applicationIdCounter: number;
  private messageIdCounter: number;
  private skillMatchScoreIdCounter: number;
  private skillGapAnalysisIdCounter: number;
  private learningResourceIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.studentProfiles = new Map();
    this.employerProfiles = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.messages = new Map();
    this.skillMatchScores = new Map();
    this.skillGapAnalyses = new Map();
    this.learningResources = new Map();
    
    this.userIdCounter = 1;
    this.studentProfileIdCounter = 1;
    this.employerProfileIdCounter = 1;
    this.jobIdCounter = 1;
    this.applicationIdCounter = 1;
    this.messageIdCounter = 1;
    this.skillMatchScoreIdCounter = 1;
    this.skillGapAnalysisIdCounter = 1;
    this.learningResourceIdCounter = 1;
    
    // Initialize with sample learning resources
    this.initializeLearningResources();
  }
  
  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Student profiles
  async getStudentProfile(id: number): Promise<StudentProfile | undefined> {
    return this.studentProfiles.get(id);
  }
  
  async getStudentProfileByUserId(userId: number): Promise<StudentProfile | undefined> {
    return Array.from(this.studentProfiles.values()).find(profile => profile.userId === userId);
  }
  
  async createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile> {
    const id = this.studentProfileIdCounter++;
    const newProfile: StudentProfile = {
      ...profile,
      id,
      profileCompletionPercentage: this.calculateProfileCompletion(profile)
    };
    this.studentProfiles.set(id, newProfile);
    return newProfile;
  }
  
  async updateStudentProfile(id: number, profileData: Partial<InsertStudentProfile>): Promise<StudentProfile | undefined> {
    const profile = this.studentProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile: StudentProfile = {
      ...profile,
      ...profileData,
      profileCompletionPercentage: this.calculateProfileCompletion({...profile, ...profileData})
    };
    this.studentProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  async getAllStudentProfiles(): Promise<StudentProfile[]> {
    return Array.from(this.studentProfiles.values());
  }
  
  // Employer profiles
  async getEmployerProfile(id: number): Promise<EmployerProfile | undefined> {
    return this.employerProfiles.get(id);
  }
  
  async getEmployerProfileByUserId(userId: number): Promise<EmployerProfile | undefined> {
    return Array.from(this.employerProfiles.values()).find(profile => profile.userId === userId);
  }
  
  async createEmployerProfile(profile: InsertEmployerProfile): Promise<EmployerProfile> {
    const id = this.employerProfileIdCounter++;
    const newProfile: EmployerProfile = {
      ...profile,
      id
    };
    this.employerProfiles.set(id, newProfile);
    return newProfile;
  }
  
  async updateEmployerProfile(id: number, profileData: Partial<InsertEmployerProfile>): Promise<EmployerProfile | undefined> {
    const profile = this.employerProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile: EmployerProfile = {
      ...profile,
      ...profileData
    };
    this.employerProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  async getAllEmployerProfiles(): Promise<EmployerProfile[]> {
    return Array.from(this.employerProfiles.values());
  }
  
  // Jobs
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }
  
  async createJob(job: InsertJob): Promise<Job> {
    const id = this.jobIdCounter++;
    const newJob: Job = {
      ...job,
      id,
      createdAt: new Date(),
      isActive: true
    };
    this.jobs.set(id, newJob);
    return newJob;
  }
  
  async updateJob(id: number, jobData: Partial<InsertJob>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob: Job = {
      ...job,
      ...jobData
    };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }
  
  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }
  
  async getJobsByEmployerId(employerId: number): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.employerId === employerId);
  }
  
  async getAllActiveJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.isActive);
  }
  
  async searchJobs(query: string, filters?: any): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values()).filter(job => job.isActive);
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(lowerQuery) || 
        job.description.toLowerCase().includes(lowerQuery) ||
        job.location.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (filters) {
      if (filters.location) {
        jobs = jobs.filter(job => job.location.toLowerCase().includes(filters.location.toLowerCase()));
      }
      
      if (filters.isRemote !== undefined) {
        jobs = jobs.filter(job => job.isRemote === filters.isRemote);
      }
      
      if (filters.skills && filters.skills.length > 0) {
        jobs = jobs.filter(job => {
          const jobSkills = job.skills as string[];
          return filters.skills.some((skill: string) => jobSkills.includes(skill));
        });
      }
    }
    
    return jobs;
  }
  
  // Applications
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }
  
  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const now = new Date();
    const newApplication: Application = {
      ...application,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.applications.set(id, newApplication);
    return newApplication;
  }
  
  async updateApplication(id: number, applicationData: Partial<InsertApplication>): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication: Application = {
      ...application,
      ...applicationData,
      updatedAt: new Date()
    };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  async getApplicationsByStudentId(studentId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(application => application.studentId === studentId);
  }
  
  async getApplicationsByJobId(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(application => application.jobId === jobId);
  }
  
  // Messages
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = {
      ...message,
      id,
      createdAt: new Date(),
      isRead: false
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async getUnreadMessagesCount(userId: number): Promise<number> {
    return Array.from(this.messages.values())
      .filter(message => message.receiverId === userId && !message.isRead)
      .length;
  }
  
  async markMessageAsRead(id: number): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;
    
    const updatedMessage: Message = {
      ...message,
      isRead: true
    };
    this.messages.set(id, updatedMessage);
    return true;
  }
  
  // Skill matching and analysis
  async createOrUpdateSkillMatchScore(studentId: number, jobId: number, score: number): Promise<SkillMatchScore> {
    const key = `${studentId}-${jobId}`;
    const existingScore = this.skillMatchScores.get(key);
    
    if (existingScore) {
      const updatedScore: SkillMatchScore = {
        ...existingScore,
        score,
        calculatedAt: new Date()
      };
      this.skillMatchScores.set(key, updatedScore);
      return updatedScore;
    } else {
      const id = this.skillMatchScoreIdCounter++;
      const newScore: SkillMatchScore = {
        id,
        studentId,
        jobId,
        score,
        calculatedAt: new Date()
      };
      this.skillMatchScores.set(key, newScore);
      return newScore;
    }
  }
  
  async getSkillMatchScore(studentId: number, jobId: number): Promise<SkillMatchScore | undefined> {
    const key = `${studentId}-${jobId}`;
    return this.skillMatchScores.get(key);
  }
  
  async getTopMatchingJobsForStudent(studentId: number, limit: number = 10): Promise<{job: Job, score: number}[]> {
    const studentScores = Array.from(this.skillMatchScores.values())
      .filter(score => score.studentId === studentId);
    
    const result = studentScores
      .map(score => {
        const job = this.jobs.get(score.jobId);
        return job && job.isActive ? { job, score: score.score } : null;
      })
      .filter((item): item is {job: Job, score: number} => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // If there aren't many pre-calculated scores, calculate some on the fly
    if (result.length < limit) {
      const student = await this.getStudentProfile(studentId);
      if (student) {
        const activeJobs = Array.from(this.jobs.values())
          .filter(job => job.isActive)
          .filter(job => !studentScores.some(score => score.jobId === job.id));
        
        const studentSkills = student.skills as string[];
        
        const calculatedScores = activeJobs.map(job => {
          const jobSkills = job.skills as string[];
          const matchingSkills = jobSkills.filter(skill => 
            studentSkills.includes(skill)
          ).length;
          
          const score = jobSkills.length > 0 
            ? (matchingSkills / jobSkills.length) * 100 
            : 0;
          
          return { job, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit - result.length);
        
        result.push(...calculatedScores);
      }
    }
    
    return result;
  }
  
  async getTopMatchingStudentsForJob(jobId: number, limit: number = 10): Promise<{student: StudentProfile, score: number}[]> {
    const jobScores = Array.from(this.skillMatchScores.values())
      .filter(score => score.jobId === jobId);
    
    const result = jobScores
      .map(score => {
        const student = this.studentProfiles.get(score.studentId);
        return student ? { student, score: score.score } : null;
      })
      .filter((item): item is {student: StudentProfile, score: number} => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // If there aren't many pre-calculated scores, calculate some on the fly
    if (result.length < limit) {
      const job = await this.getJob(jobId);
      if (job) {
        const students = Array.from(this.studentProfiles.values())
          .filter(student => !jobScores.some(score => score.studentId === student.id));
        
        const jobSkills = job.skills as string[];
        
        const calculatedScores = students.map(student => {
          const studentSkills = student.skills as string[];
          const matchingSkills = studentSkills.filter(skill => 
            jobSkills.includes(skill)
          ).length;
          
          const score = jobSkills.length > 0 
            ? (matchingSkills / jobSkills.length) * 100 
            : 0;
          
          return { student, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit - result.length);
        
        result.push(...calculatedScores);
      }
    }
    
    return result;
  }
  
  // Skill Gap Analysis
  async getSkillGapAnalysisForStudent(studentId: number): Promise<SkillGapAnalysis | undefined> {
    return Array.from(this.skillGapAnalyses.values())
      .find(analysis => analysis.studentId === studentId);
  }
  
  async createSkillGapAnalysis(studentId: number, results: any): Promise<SkillGapAnalysis> {
    const id = this.skillGapAnalysisIdCounter++;
    const newAnalysis: SkillGapAnalysis = {
      id,
      studentId,
      results,
      createdAt: new Date()
    };
    this.skillGapAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }
  
  // Learning Resources
  async getLearningResource(id: number): Promise<LearningResource | undefined> {
    return this.learningResources.get(id);
  }
  
  async createLearningResource(resource: InsertLearningResource): Promise<LearningResource> {
    const id = this.learningResourceIdCounter++;
    const newResource: LearningResource = {
      ...resource,
      id
    };
    this.learningResources.set(id, newResource);
    return newResource;
  }
  
  async getLearningResourcesBySkill(skillTag: string): Promise<LearningResource[]> {
    return Array.from(this.learningResources.values())
      .filter(resource => resource.skillTag.toLowerCase() === skillTag.toLowerCase());
  }
  
  async getRecommendedLearningResourcesForStudent(studentId: number): Promise<LearningResource[]> {
    const gapAnalysis = await this.getSkillGapAnalysisForStudent(studentId);
    if (!gapAnalysis) return [];
    
    const gapSkills = gapAnalysis.results.skillGaps as string[];
    const resources = Array.from(this.learningResources.values());
    
    return resources.filter(resource => 
      gapSkills.includes(resource.skillTag)
    );
  }
  
  // Helper methods
  private calculateProfileCompletion(profile: Partial<InsertStudentProfile>): number {
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
      if (profile[field as keyof InsertStudentProfile]) {
        completedFields++;
      }
    });
    
    arrayFields.forEach(field => {
      const array = profile[field as keyof InsertStudentProfile] as any[];
      if (array && array.length > 0) {
        completedFields++;
      }
    });
    
    return Math.round((completedFields / totalFields) * 100);
  }
  
  private initializeLearningResources() {
    const resources: InsertLearningResource[] = [
      {
        title: "Machine Learning Fundamentals with Python",
        description: "Learn the foundations of machine learning with practical Python examples and real-world datasets.",
        url: "https://example.com/ml-fundamentals",
        category: "Machine Learning",
        skillTag: "Machine Learning",
        isFree: true,
        imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159",
        rating: 4.5,
        ratingCount: 1245
      },
      {
        title: "AWS Cloud Practitioner Certification",
        description: "Prepare for AWS Cloud Practitioner certification with comprehensive lessons and practice exams.",
        url: "https://example.com/aws-certification",
        category: "Cloud Computing",
        skillTag: "Cloud Computing",
        isFree: false,
        price: "$49.99",
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
        rating: 4.0,
        ratingCount: 876
      },
      {
        title: "Web Development Bootcamp",
        description: "Complete web development bootcamp covering HTML, CSS, JavaScript, React, Node.js and more.",
        url: "https://example.com/web-dev-bootcamp",
        category: "Web Development",
        skillTag: "Web Development",
        isFree: false,
        price: "$89.99",
        imageUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8",
        rating: 4.8,
        ratingCount: 3254
      }
    ];
    
    resources.forEach(resource => {
      const id = this.learningResourceIdCounter++;
      this.learningResources.set(id, { ...resource, id });
    });
  }
}

export const storage = new MemStorage();
