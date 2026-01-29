import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, CodalEntity } from "./entities";
import { ok, bad, isStr } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // CODALS
  app.get('/api/codals', async (c) => {
    await CodalEntity.ensureSeed(c.env);
    return ok(c, await CodalEntity.list(c.env));
  });
  // DASHBOARD
  app.get('/api/dashboard', async (c) => {
    const userId = "dev-user"; // Simplified for phase 1
    const user = new UserEntity(c.env, userId);
    if (!await user.exists()) {
      await user.save({ id: userId, name: "Bar Aspirant", joinedAt: Date.now(), progress: {} });
    }
    return ok(c, await user.getDashboardData(c.env));
  });
  // PRACTICE QUEUE
  app.get('/api/practice/queue', async (c) => {
    const userId = "dev-user";
    const user = new UserEntity(c.env, userId);
    return ok(c, await user.getDueQueue(c.env));
  });
  // REVIEW SUBMISSION
  app.post('/api/review', async (c) => {
    const { codalId, grade } = await c.req.json() as { codalId: string, grade: number };
    if (!isStr(codalId) || typeof grade !== 'number') return bad(c, 'Invalid payload');
    const userId = "dev-user";
    const user = new UserEntity(c.env, userId);
    await user.submitReview(codalId, grade);
    return ok(c, { success: true });
  });
}