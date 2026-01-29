import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, CodalEntity } from "./entities";
import { ok, bad, isStr, notFound } from './core-utils';
import type { CodalProvision } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // CODALS LIST
  app.get('/api/codals', async (c) => {
    await CodalEntity.ensureSeed(c.env);
    return ok(c, await CodalEntity.list(c.env));
  });
  // CREATE CODAL
  app.post('/api/codals', async (c) => {
    const data = await c.req.json() as CodalProvision;
    const userId = "dev-user"; // Mock auth
    if (!isStr(data.title) || !isStr(data.content)) return bad(c, 'Title and content required');
    const id = data.id || crypto.randomUUID();
    const newCodal = await CodalEntity.create(c.env, {
      ...data,
      id,
      ownerId: userId,
      isOfficial: false
    });
    return ok(c, newCodal);
  });
  // UPDATE CODAL
  app.put('/api/codals/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json() as Partial<CodalProvision>;
    const userId = "dev-user";
    const entity = new CodalEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    const current = await entity.getState();
    if (current.isOfficial || current.ownerId !== userId) {
      return bad(c, 'Unauthorized: Cannot edit official or others provisions');
    }
    await entity.patch(data);
    return ok(c, await entity.getState());
  });
  // DELETE CODAL
  app.delete('/api/codals/:id', async (c) => {
    const id = c.req.param('id');
    const userId = "dev-user";
    const entity = new CodalEntity(c.env, id);
    if (!await entity.exists()) return notFound(c);
    const current = await entity.getState();
    if (current.isOfficial || current.ownerId !== userId) {
      return bad(c, 'Unauthorized: Cannot delete official or others provisions');
    }
    await CodalEntity.delete(c.env, id);
    return ok(c, { success: true });
  });
  // DASHBOARD
  app.get('/api/dashboard', async (c) => {
    const userId = "dev-user";
    const user = new UserEntity(c.env, userId);
    if (!await user.exists()) {
      await user.save({ id: userId, name: "Bar Aspirant", joinedAt: Date.now(), progress: {} });
    }
    return ok(c, await user.getDashboardData(c.env));
  });
  // ANALYTICS
  app.get('/api/analytics', async (c) => {
    const userId = "dev-user";
    const user = new UserEntity(c.env, userId);
    return ok(c, await user.getAnalytics(c.env));
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