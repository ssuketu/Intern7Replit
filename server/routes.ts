import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertStudentProfileSchema, 
  insertEmployerProfileSchema,
  insertJobSchema,
  insertApplicationSchema,
  insertMessageSchema,
  insertLearningResourceSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Helper to handle zod validation
const validateRequest = <T>(schema: z.ZodType<T>, data: unknown): { success: true, data: T } | { success: false, error: string } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedError = fromZodError(error);
      return { success: false, error: formattedError.message };
    }
    return { success: false, error: 'Invalid data format' };
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Authentication routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const validation = validateRequest(insertUserSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const existingUser = await storage.getUserByEmail(validation.data.email);
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      const newUser = await storage.createUser(validation.data);
      // Don't return the password
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  // User profile routes
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
  });

  // Student profile routes
  app.post('/api/student-profiles', async (req: Request, res: Response) => {
    const validation = validateRequest(insertStudentProfileSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const user = await storage.getUser(validation.data.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existingProfile = await storage.getStudentProfileByUserId(validation.data.userId);
      if (existingProfile) {
        return res.status(409).json({ error: 'Student profile already exists for this user' });
      }

      const newProfile = await storage.createStudentProfile(validation.data);
      res.status(201).json(newProfile);
    } catch (error) {
      console.error('Create student profile error:', error);
      res.status(500).json({ error: 'Failed to create student profile' });
    }
  });

  app.get('/api/student-profiles/user/:userId', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const profile = await storage.getStudentProfileByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Student profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Get student profile error:', error);
      res.status(500).json({ error: 'Failed to retrieve student profile' });
    }
  });

  app.patch('/api/student-profiles/:id', async (req: Request, res: Response) => {
    const profileId = parseInt(req.params.id);
    
    if (isNaN(profileId)) {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }

    try {
      const profile = await storage.getStudentProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

      const updatedProfile = await storage.updateStudentProfile(profileId, req.body);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Update student profile error:', error);
      res.status(500).json({ error: 'Failed to update student profile' });
    }
  });

  // Employer profile routes
  app.post('/api/employer-profiles', async (req: Request, res: Response) => {
    const validation = validateRequest(insertEmployerProfileSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const user = await storage.getUser(validation.data.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existingProfile = await storage.getEmployerProfileByUserId(validation.data.userId);
      if (existingProfile) {
        return res.status(409).json({ error: 'Employer profile already exists for this user' });
      }

      const newProfile = await storage.createEmployerProfile(validation.data);
      res.status(201).json(newProfile);
    } catch (error) {
      console.error('Create employer profile error:', error);
      res.status(500).json({ error: 'Failed to create employer profile' });
    }
  });

  app.get('/api/employer-profiles/user/:userId', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const profile = await storage.getEmployerProfileByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Employer profile not found' });
      }
      
      res.json(profile);
    } catch (error) {
      console.error('Get employer profile error:', error);
      res.status(500).json({ error: 'Failed to retrieve employer profile' });
    }
  });

  app.patch('/api/employer-profiles/:id', async (req: Request, res: Response) => {
    const profileId = parseInt(req.params.id);
    
    if (isNaN(profileId)) {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }

    try {
      const profile = await storage.getEmployerProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ error: 'Employer profile not found' });
      }

      const updatedProfile = await storage.updateEmployerProfile(profileId, req.body);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Update employer profile error:', error);
      res.status(500).json({ error: 'Failed to update employer profile' });
    }
  });

  // Job routes
  app.post('/api/jobs', async (req: Request, res: Response) => {
    const validation = validateRequest(insertJobSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const employerProfile = await storage.getEmployerProfile(validation.data.employerId);
      if (!employerProfile) {
        return res.status(404).json({ error: 'Employer profile not found' });
      }

      const newJob = await storage.createJob(validation.data);
      res.status(201).json(newJob);
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({ error: 'Failed to create job' });
    }
  });

  app.get('/api/jobs', async (req: Request, res: Response) => {
    try {
      const jobs = await storage.getAllActiveJobs();
      res.json(jobs);
    } catch (error) {
      console.error('Get jobs error:', error);
      res.status(500).json({ error: 'Failed to retrieve jobs' });
    }
  });

  app.get('/api/jobs/search', async (req: Request, res: Response) => {
    const { query, ...filters } = req.query;
    try {
      const jobs = await storage.searchJobs(query as string, filters);
      res.json(jobs);
    } catch (error) {
      console.error('Search jobs error:', error);
      res.status(500).json({ error: 'Failed to search jobs' });
    }
  });

  app.get('/api/jobs/employer/:employerId', async (req: Request, res: Response) => {
    const employerId = parseInt(req.params.employerId);
    
    if (isNaN(employerId)) {
      return res.status(400).json({ error: 'Invalid employer ID' });
    }

    try {
      const jobs = await storage.getJobsByEmployerId(employerId);
      res.json(jobs);
    } catch (error) {
      console.error('Get employer jobs error:', error);
      res.status(500).json({ error: 'Failed to retrieve employer jobs' });
    }
  });

  app.get('/api/jobs/:id', async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.id);
    
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    try {
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json(job);
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({ error: 'Failed to retrieve job' });
    }
  });

  app.patch('/api/jobs/:id', async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.id);
    
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    try {
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      console.error('Update job error:', error);
      res.status(500).json({ error: 'Failed to update job' });
    }
  });

  app.delete('/api/jobs/:id', async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.id);
    
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    try {
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const success = await storage.deleteJob(jobId);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ error: 'Failed to delete job' });
      }
    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({ error: 'Failed to delete job' });
    }
  });

  // Application routes
  app.post('/api/applications', async (req: Request, res: Response) => {
    const validation = validateRequest(insertApplicationSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const studentProfile = await storage.getStudentProfile(validation.data.studentId);
      if (!studentProfile) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

      const job = await storage.getJob(validation.data.jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      // Check if application already exists
      const existingApplications = await storage.getApplicationsByStudentId(validation.data.studentId);
      const alreadyApplied = existingApplications.some(app => app.jobId === validation.data.jobId);
      
      if (alreadyApplied) {
        return res.status(409).json({ error: 'You have already applied to this job' });
      }

      const newApplication = await storage.createApplication(validation.data);
      res.status(201).json(newApplication);
    } catch (error) {
      console.error('Create application error:', error);
      res.status(500).json({ error: 'Failed to create application' });
    }
  });

  app.get('/api/applications/student/:studentId', async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    
    if (isNaN(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    try {
      const applications = await storage.getApplicationsByStudentId(studentId);
      
      // Fetch job details for each application
      const applicationsWithJobs = await Promise.all(
        applications.map(async (app) => {
          const job = await storage.getJob(app.jobId);
          return { ...app, job };
        })
      );
      
      res.json(applicationsWithJobs);
    } catch (error) {
      console.error('Get student applications error:', error);
      res.status(500).json({ error: 'Failed to retrieve student applications' });
    }
  });

  app.get('/api/applications/job/:jobId', async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    try {
      const applications = await storage.getApplicationsByJobId(jobId);
      
      // Fetch student details for each application
      const applicationsWithStudents = await Promise.all(
        applications.map(async (app) => {
          const student = await storage.getStudentProfile(app.studentId);
          return { ...app, student };
        })
      );
      
      res.json(applicationsWithStudents);
    } catch (error) {
      console.error('Get job applications error:', error);
      res.status(500).json({ error: 'Failed to retrieve job applications' });
    }
  });

  app.patch('/api/applications/:id', async (req: Request, res: Response) => {
    const applicationId = parseInt(req.params.id);
    
    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    try {
      const application = await storage.getApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      const updatedApplication = await storage.updateApplication(applicationId, req.body);
      res.json(updatedApplication);
    } catch (error) {
      console.error('Update application error:', error);
      res.status(500).json({ error: 'Failed to update application' });
    }
  });

  // Skill matching routes
  app.get('/api/matching/jobs/:studentId', async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    if (isNaN(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    try {
      const matchingJobs = await storage.getTopMatchingJobsForStudent(studentId, limit);
      res.json(matchingJobs);
    } catch (error) {
      console.error('Get matching jobs error:', error);
      res.status(500).json({ error: 'Failed to retrieve matching jobs' });
    }
  });

  app.get('/api/matching/students/:jobId', async (req: Request, res: Response) => {
    const jobId = parseInt(req.params.jobId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    try {
      const matchingStudents = await storage.getTopMatchingStudentsForJob(jobId, limit);
      res.json(matchingStudents);
    } catch (error) {
      console.error('Get matching students error:', error);
      res.status(500).json({ error: 'Failed to retrieve matching students' });
    }
  });

  app.post('/api/matching/calculate', async (req: Request, res: Response) => {
    const { studentId, jobId, score } = req.body;
    
    if (!studentId || !jobId || score === undefined) {
      return res.status(400).json({ error: 'Student ID, job ID, and score are required' });
    }

    try {
      const matchScore = await storage.createOrUpdateSkillMatchScore(studentId, jobId, score);
      res.json(matchScore);
    } catch (error) {
      console.error('Calculate match score error:', error);
      res.status(500).json({ error: 'Failed to calculate match score' });
    }
  });

  // Skill gap analysis routes
  app.get('/api/skill-gap/:studentId', async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    
    if (isNaN(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    try {
      const analysis = await storage.getSkillGapAnalysisForStudent(studentId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Skill gap analysis not found' });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error('Get skill gap analysis error:', error);
      res.status(500).json({ error: 'Failed to retrieve skill gap analysis' });
    }
  });

  app.post('/api/skill-gap/:studentId', async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    const { results } = req.body;
    
    if (isNaN(studentId) || !results) {
      return res.status(400).json({ error: 'Invalid student ID or missing results' });
    }

    try {
      const student = await storage.getStudentProfile(studentId);
      
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }

      const analysis = await storage.createSkillGapAnalysis(studentId, results);
      res.json(analysis);
    } catch (error) {
      console.error('Create skill gap analysis error:', error);
      res.status(500).json({ error: 'Failed to create skill gap analysis' });
    }
  });

  // Learning resources routes
  app.get('/api/learning-resources', async (req: Request, res: Response) => {
    try {
      const resources = Array.from(storage['learningResources'].values());
      res.json(resources);
    } catch (error) {
      console.error('Get learning resources error:', error);
      res.status(500).json({ error: 'Failed to retrieve learning resources' });
    }
  });

  app.get('/api/learning-resources/skill/:skillTag', async (req: Request, res: Response) => {
    const { skillTag } = req.params;
    
    if (!skillTag) {
      return res.status(400).json({ error: 'Skill tag is required' });
    }

    try {
      const resources = await storage.getLearningResourcesBySkill(skillTag);
      res.json(resources);
    } catch (error) {
      console.error('Get skill learning resources error:', error);
      res.status(500).json({ error: 'Failed to retrieve skill learning resources' });
    }
  });

  app.get('/api/learning-resources/recommended/:studentId', async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.studentId);
    
    if (isNaN(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    try {
      const resources = await storage.getRecommendedLearningResourcesForStudent(studentId);
      res.json(resources);
    } catch (error) {
      console.error('Get recommended learning resources error:', error);
      res.status(500).json({ error: 'Failed to retrieve recommended learning resources' });
    }
  });

  // Message routes
  app.post('/api/messages', async (req: Request, res: Response) => {
    const validation = validateRequest(insertMessageSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }

    try {
      const sender = await storage.getUser(validation.data.senderId);
      if (!sender) {
        return res.status(404).json({ error: 'Sender not found' });
      }

      const receiver = await storage.getUser(validation.data.receiverId);
      if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
      }

      const newMessage = await storage.createMessage(validation.data);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error('Create message error:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  });

  app.get('/api/messages/:userId1/:userId2', async (req: Request, res: Response) => {
    const userId1 = parseInt(req.params.userId1);
    const userId2 = parseInt(req.params.userId2);
    
    if (isNaN(userId1) || isNaN(userId2)) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    try {
      const messages = await storage.getMessagesBetweenUsers(userId1, userId2);
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  });

  app.get('/api/messages/unread/:userId', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const count = await storage.getUnreadMessagesCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Get unread messages count error:', error);
      res.status(500).json({ error: 'Failed to retrieve unread messages count' });
    }
  });

  app.patch('/api/messages/:id/read', async (req: Request, res: Response) => {
    const messageId = parseInt(req.params.id);
    
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    try {
      const success = await storage.markMessageAsRead(messageId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Message not found' });
      }
    } catch (error) {
      console.error('Mark message as read error:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });

  return httpServer;
}
