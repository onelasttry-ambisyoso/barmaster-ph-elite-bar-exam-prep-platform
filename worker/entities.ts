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
    const examDate = new Date('2026-09-20').getTime();
    const daysToExam = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
    return {
      dueCount: dueItems.length,
      streak: 5,
      totalMastered: Object.values(state.progress).filter(p => p.srs.repetitions > 3).length,
      nextExamDays: daysToExam
    };
  }
  async getAnalytics(env: any) {
    const state = await this.getState();
    const allCodals = await CodalEntity.list(env);
    const codalsBySubject: Record<string, number> = {};
    const masteredBySubject: Record<string, number> = {};
    // Subjects List
    const subjects = ['Political Law', 'Labor Law', 'Civil Law', 'Taxation Law', 'Mercantile Law', 'Criminal Law', 'Remedial Law', 'Legal Ethics'];
    subjects.forEach(s => {
      codalsBySubject[s] = 0;
      masteredBySubject[s] = 0;
    });
    // Count available codals
    allCodals.items.forEach(c => {
      if (codalsBySubject[c.subject] !== undefined) codalsBySubject[c.subject]++;
    });
    // Count mastered per subject
    Object.values(state.progress).forEach(p => {
      const codal = allCodals.items.find(c => c.id === p.codalId);
      if (codal && p.srs.repetitions > 3) {
        masteredBySubject[codal.subject]++;
      }
    });
    const masteryData = subjects.map(s => ({
      subject: s,
      mastered: masteredBySubject[s],
      total: codalsBySubject[s] || 1,
      percentage: Math.round((masteredBySubject[s] / (codalsBySubject[s] || 1)) * 100)
    }));
    // Ease Factor (Retention Rate)
    const allProgress = Object.values(state.progress);
    const avgEase = allProgress.length > 0 
      ? allProgress.reduce((acc, p) => acc + p.srs.easeFactor, 0) / allProgress.length 
      : 2.5;
    // Activity Heatmap (Last 30 days)
    const heatmap: Record<string, number> = {};
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      heatmap[dateStr] = 0;
    }
    allProgress.forEach(p => {
      p.history.forEach(h => {
        const dStr = new Date(h.date).toISOString().split('T')[0];
        if (heatmap[dStr] !== undefined) heatmap[dStr]++;
      });
    });
    return {
      masteryData,
      retentionRate: Math.round((avgEase / 2.5) * 100),
      heatmap: Object.entries(heatmap).map(([date, count]) => ({ date, count })).reverse(),
      totalReviews: allProgress.reduce((acc, p) => acc + p.history.length, 0)
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
    const dueIds = Object.values(state.progress)
      .filter(p => p.srs.dueDate <= now)
      .map(p => p.codalId);
    if (dueIds.length === 0) {
      const allCodals = await CodalEntity.list(env, null, 10);
      const unstudied = allCodals.items.filter(c => !state.progress[c.id]);
      return unstudied.slice(0, 5);
    }
    const codals = await Promise.all(dueIds.map(id => new CodalEntity(env, id).getState()));
    return codals;
  }
}