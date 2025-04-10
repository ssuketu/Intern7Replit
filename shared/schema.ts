import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['student', 'employer', 'admin', 'college']);
export const applicationStatusEnum = pgEnum('application_status', ['applied', 'in_review', 'interview_scheduled', 'accepted', 'rejected']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default('student'),
  createdAt: timestamp("created_at").defaultNow()
});

export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  university: text("university"),
  degree: text("degree"),
  fieldOfStudy: text("field_of_study"),
  graduationYear: integer("graduation_year"),
  resumeUrl: text("resume_url"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  bio: text("bio"),
  phoneNumber: text("phone_number"),
  location: text("location"),
  skills: jsonb("skills").default([]),
  experience: jsonb("experience").default([]),
  projects: jsonb("projects").default([]),
  educations: jsonb("educations").default([]),
  certifications: jsonb("certifications").default([]),
  profileCompletionPercentage: integer("profile_completion_percentage").default(0),
});

export const employerProfiles = pgTable("employer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  companySize: text("company_size"),
  description: text("description"),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  location: text("location"),
  phoneNumber: text("phone_number"),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => employerProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  isRemote: boolean("is_remote").default(false),
  isHybrid: boolean("is_hybrid").default(false),
  requirements: jsonb("requirements").default([]),
  skills: jsonb("skills").default([]),
  duration: text("duration"),
  salary: text("salary"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  status: applicationStatusEnum("status").default('applied'),
  coverLetter: text("cover_letter"),
  resumeUrl: text("resume_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const skillMatchScores = pgTable("skill_match_scores", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  score: real("score").notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const skillGapAnalyses = pgTable("skill_gap_analyses", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const learningResources = pgTable("learning_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  skillTag: text("skill_tag").notNull(),
  isFree: boolean("is_free").default(true),
  price: text("price"),
  imageUrl: text("image_url"),
  rating: real("rating"),
  ratingCount: integer("rating_count"),
});

export const collegeProfiles = pgTable("college_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  collegeName: text("college_name").notNull(),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  postalCode: text("postal_code"),
  website: text("website"),
  logoUrl: text("logo_url"),
  phoneNumber: text("phone_number"),
  establishedYear: integer("established_year"),
  accreditations: jsonb("accreditations").default([]),
  programsOffered: jsonb("programs_offered").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bulkUploads = pgTable("bulk_uploads", {
  id: serial("id").primaryKey(),
  collegeId: integer("college_id").notNull().references(() => collegeProfiles.id),
  filename: text("filename").notNull(),
  fileUrl: text("file_url").notNull(),
  recordCount: integer("record_count"),
  successCount: integer("success_count").default(0),
  errorCount: integer("error_count").default(0),
  status: text("status").default("processing"),
  errorDetails: jsonb("error_details").default([]),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const employerApprovals = pgTable("employer_approvals", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").notNull().references(() => employerProfiles.id),
  collegeId: integer("college_id").notNull().references(() => collegeProfiles.id),
  status: approvalStatusEnum("status").default("pending"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert and Select Types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  profileCompletionPercentage: true,
});

export const insertEmployerProfileSchema = createInsertSchema(employerProfiles).omit({
  id: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertLearningResourceSchema = createInsertSchema(learningResources).omit({
  id: true,
});

export const insertCollegeProfileSchema = createInsertSchema(collegeProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertBulkUploadSchema = createInsertSchema(bulkUploads).omit({
  id: true,
  successCount: true,
  errorCount: true,
  status: true,
  errorDetails: true,
  uploadedAt: true,
  processedAt: true,
});

export const insertEmployerApprovalSchema = createInsertSchema(employerApprovals).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;

export type InsertEmployerProfile = z.infer<typeof insertEmployerProfileSchema>;
export type EmployerProfile = typeof employerProfiles.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertLearningResource = z.infer<typeof insertLearningResourceSchema>;
export type LearningResource = typeof learningResources.$inferSelect;

export type InsertCollegeProfile = z.infer<typeof insertCollegeProfileSchema>;
export type CollegeProfile = typeof collegeProfiles.$inferSelect;

export type InsertBulkUpload = z.infer<typeof insertBulkUploadSchema>;
export type BulkUpload = typeof bulkUploads.$inferSelect;

export type InsertEmployerApproval = z.infer<typeof insertEmployerApprovalSchema>;
export type EmployerApproval = typeof employerApprovals.$inferSelect;

export type SkillMatchScore = typeof skillMatchScores.$inferSelect;
export type SkillGapAnalysis = typeof skillGapAnalyses.$inferSelect;
