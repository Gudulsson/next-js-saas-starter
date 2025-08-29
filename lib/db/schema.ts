import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  json,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

// Nya tabeller för SaaS-funktionalitet
export const sites = pgTable('sites', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  name: varchar('name', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});

export const crawlJobs = pgTable('crawl_jobs', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id')
    .notNull()
    .references(() => sites.id),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, running, completed, failed
  priority: integer('priority').notNull().default(0),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id')
    .notNull()
    .references(() => sites.id),
  crawlJobId: integer('crawl_job_id')
    .references(() => crawlJobs.id),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  data: json('data'), // Crawl resultat och analysdata
  status: varchar('status', { length: 20 }).notNull().default('processing'), // processing, completed, failed
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usageEvents = pgTable('usage_events', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id')
    .references(() => users.id),
  eventType: varchar('event_type', { length: 50 }).notNull(), // crawl_started, report_generated, etc.
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  sites: many(sites),
  usageEvents: many(usageEvents),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  usageEvents: many(usageEvents),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const sitesRelations = relations(sites, ({ one, many }) => ({
  team: one(teams, {
    fields: [sites.teamId],
    references: [teams.id],
  }),
  crawlJobs: many(crawlJobs),
  reports: many(reports),
}));

export const crawlJobsRelations = relations(crawlJobs, ({ one, many }) => ({
  site: one(sites, {
    fields: [crawlJobs.siteId],
    references: [sites.id],
  }),
  reports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  site: one(sites, {
    fields: [reports.siteId],
    references: [sites.id],
  }),
  crawlJob: one(crawlJobs, {
    fields: [reports.crawlJobId],
    references: [crawlJobs.id],
  }),
}));

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  team: one(teams, {
    fields: [usageEvents.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [usageEvents.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type CrawlJob = typeof crawlJobs.$inferSelect;
export type NewCrawlJob = typeof crawlJobs.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type UsageEvent = typeof usageEvents.$inferSelect;
export type NewUsageEvent = typeof usageEvents.$inferInsert;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  SITE_CREATED = 'SITE_CREATED',
  CRAWL_STARTED = 'CRAWL_STARTED',
  REPORT_GENERATED = 'REPORT_GENERATED',
}

export enum CrawlJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ReportStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum UsageEventType {
  CRAWL_STARTED = 'crawl_started',
  REPORT_GENERATED = 'report_generated',
  SITE_CREATED = 'site_created',
  API_CALL = 'api_call',
}
