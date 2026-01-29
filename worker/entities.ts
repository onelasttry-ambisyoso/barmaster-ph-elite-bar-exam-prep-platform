import { IndexedEntity, Entity } from "./core-utils";
import type { User, CodalProvision, StudyProgress, Subject } from "@shared/types";
import { MOCK_CODALS, MOCK_USERS } from "@shared/mock-data";
import { calculateReview, INITIAL_SRS } from "../src/lib/sm2";
export class CodalEntity extends IndexedEntity<CodalProvision> {
  static readonly entityName = "codal";
  static readonly indexName = "codals";
  static readonly initialState: CodalProvision = { id: "", subject: "Civil Law", title: "", content: "", reference: "" };
  static seedData = MOCK_CODALS;
}
export interface UserState extends User {
  progress: Record<string, StudyProgress>;
}
export class UserEntity extends Entity<UserState> {
  static readonly entityName = "user";
  static readonly initialState: UserState = { 
    id: "", 
    name: "", 
    joinedAt: 0,
    progress: {} 
  };
  async getDashboardData(env: any) {
    const state = await this.getState();
    const now = Date.now();
    const dueItems = Object.values(state.progress).filter(p => p.srs.dueDate <= now);
    // Target: Sept 2026 (approx)
    const examDate = new Date('2026-09-20').getTime();
    const daysToExam = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
    return {
      dueCount: dueItems.length,
      streak: 5, // Mock streak for now
      totalMastered: Object.values(state.progress).filter(p => p.srs.repetitions > 3).length,
      nextExamDays: daysToExam
    };
  }
  async submitReview(codalId: string, grade: number) {
    return this.mutate(state => {
      const existing = state.progress[codalId] || {
        id: `${this.id}:${codalId}`,
        userId: this.id,
        codalId,
        srs: { ...INITIAL_SRS },
        lastGraded: 0,
        history: []
      };
      const newSrs = calculateReview(existing.srs, grade);
      state.progress[codalId] = {
        ...existing,
        srs: newSrs,
        lastGraded: Date.now(),
        history: [...existing.history, { date: Date.now(), grade }]
      };
      return state;
    });
  }
  async getDueQueue(env: any) {
    const state = await this.getState();
    const now = Date.now();
    // Find due codals
    const dueIds = Object.values(state.progress)
      .filter(p => p.srs.dueDate <= now)
      .map(p => p.codalId);
    // If queue is empty, suggest new ones from index
    if (dueIds.length === 0) {
      const allCodals = await CodalEntity.list(env, null, 10);
      const unstudied = allCodals.items.filter(c => !state.progress[c.id]);
      return unstudied.slice(0, 5);
    }
    const codals = await Promise.all(dueIds.map(id => new CodalEntity(env, id).getState()));
    return codals;
  }
}