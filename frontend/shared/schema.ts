import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Traffic simulation state
export const trafficStates = pgTable("traffic_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  simulationTime: real("simulation_time").notNull(),
  cycleNumber: integer("cycle_number").notNull(),
  northQueue: integer("north_queue").notNull(),
  southQueue: integer("south_queue").notNull(),
  eastQueue: integer("east_queue").notNull(),
  westQueue: integer("west_queue").notNull(),
  currentPhase: text("current_phase").notNull(), // 'NS_GREEN', 'EW_GREEN', 'NS_YELLOW', 'EW_YELLOW'
  phaseTimeRemaining: real("phase_time_remaining").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});

// RL Agent actions and decisions
export const agentActions = pgTable("agent_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stateId: varchar("state_id").references(() => trafficStates.id),
  action: text("action").notNull(), // 'EXTEND_NS', 'EXTEND_EW', 'SWITCH_NS', 'SWITCH_EW'
  qValue: real("q_value").notNull(),
  reward: real("reward").notNull(),
  epsilon: real("epsilon").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});

// Performance metrics
export const performanceMetrics = pgTable("performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  episode: integer("episode").notNull(),
  avgWaitTime: real("avg_wait_time").notNull(),
  maxQueueLength: integer("max_queue_length").notNull(),
  throughput: integer("throughput").notNull(), // vehicles per hour
  efficiencyScore: real("efficiency_score").notNull(),
  totalReward: real("total_reward").notNull(),
  isBaseline: boolean("is_baseline").default(false), // true for fixed-timer baseline
  timestamp: timestamp("timestamp").defaultNow()
});

// Agent training status
export const agentStatus = pgTable("agent_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  episode: integer("episode").notNull(),
  epsilon: real("epsilon").notNull(),
  learningRate: real("learning_rate").notNull(),
  replayBufferSize: integer("replay_buffer_size").notNull(),
  replayBufferCapacity: integer("replay_buffer_capacity").notNull(),
  lossValue: real("loss_value"),
  modelVersion: text("model_version").notNull(),
  isTraining: boolean("is_training").default(true),
  timestamp: timestamp("timestamp").defaultNow()
});

// Real-time simulation data
export const SimulationDataSchema = z.object({
  simulationTime: z.number(),
  cycleNumber: z.number(),
  intersection: z.object({
    northQueue: z.number(),
    southQueue: z.number(),
    eastQueue: z.number(),
    westQueue: z.number(),
    currentPhase: z.enum(['NS_GREEN', 'EW_GREEN', 'NS_YELLOW', 'EW_YELLOW', 'NS_RED', 'EW_RED']),
    phaseTimeRemaining: z.number(),
    vehicles: z.array(z.object({
      id: z.string(),
      lane: z.enum(['north', 'south', 'east', 'west']),
      position: z.number(),
      speed: z.number()
    }))
  }),
  performance: z.object({
    avgWaitTime: z.number(),
    throughput: z.number(),
    maxQueue: z.number(),
    efficiencyScore: z.number()
  }),
  agent: z.object({
    lastAction: z.string(),
    epsilon: z.number(),
    episode: z.number(),
    replayBufferFull: z.number(), // percentage
    recentActions: z.array(z.object({
      time: z.string(),
      action: z.string()
    }))
  })
});

export const insertTrafficStateSchema = createInsertSchema(trafficStates).omit({
  id: true,
  timestamp: true
});

export const insertAgentActionSchema = createInsertSchema(agentActions).omit({
  id: true,
  timestamp: true
});

export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  timestamp: true
});

export const insertAgentStatusSchema = createInsertSchema(agentStatus).omit({
  id: true,
  timestamp: true
});

export type TrafficState = typeof trafficStates.$inferSelect;
export type InsertTrafficState = z.infer<typeof insertTrafficStateSchema>;
export type AgentAction = typeof agentActions.$inferSelect;
export type InsertAgentAction = z.infer<typeof insertAgentActionSchema>;
export type PerformanceMetrics = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetrics = z.infer<typeof insertPerformanceMetricsSchema>;
export type AgentStatus = typeof agentStatus.$inferSelect;
export type InsertAgentStatus = z.infer<typeof insertAgentStatusSchema>;
export type SimulationData = z.infer<typeof SimulationDataSchema>;
