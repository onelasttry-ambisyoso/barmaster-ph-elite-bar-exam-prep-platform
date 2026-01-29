import { IndexedEntity, Entity } from "./core-utils";
import type { User, CodalProvision, StudyProgress, Subject } from "@shared/types";
import { MOCK_CODALS, MOCK_USERS } from "@shared/mock-data";
import { calculateReview, INITIAL_SRS } from "../src/lib/sm2";
export class CodalEntity extends IndexedEntity<CodalProvision> {
  static readonly entityName = "codal";
  static readonly indexName = "codals";
  static readonly initialState: CodalProvision = {
    id: "",
    subject: "Civil Law",
    title: "",
    content: "",
    reference: "",
    isOfficial: false,
    ownerId: "dev-user",
    tags: [],
    difficulty: "Medium"
  };
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
    // Dynamic Streak Calculation
    const reviewDates = new Set<string>();
    Object.values(state.progress).forEach(p => {
      p.history.forEach(h => {
        reviewDates.add(new Date(h.date).toISOString().split('T')[0]);
      });
    });
    let streak = 0;
    const sortedDates = Array.from(reviewDates).sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(now - 86400000).toISOString().split('T')[0];
    if (sortedDates.length > 0 && (sortedDates[0] === today || sortedDates[0] === yesterday)) {
      streak = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const d1 = new Date(sortedDates[i]);
        const d2 = new Date(sortedDates[i+1]);
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 1.1) {
          streak++;
        } else {
          break;
        }
      }
    }
    const examDate = new Date('2026-09-20').getTime();
    const daysToExam = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
    return {
      dueCount: dueItems.length,
      streak,
      totalMastered: Object.values(state.progress).filter(p => p.srs.repetitions > 3).length,
      nextExamDays: Math.max(0, daysToExam)
    };
  }
  async getAnalytics(env: any) {
    const state = await this.getState();
    const allCodals = await CodalEntity.list(env);
    const subjects = ['Political Law', 'Labor Law', 'Civil Law', 'Taxation Law', 'Mercantile Law', 'Criminal Law', 'Remedial Law', 'Legal Ethics'];
    const codalsBySubject: Record<string, number> = {};
    const masteredBySubject: Record<string, number> = {};
    subjects.forEach(s => {
      codalsBySubject[s] = 0;
      masteredBySubject[s] = 0;
    });
    allCodals.items.forEach(c => {
      if (codalsBySubject[c.subject] !== undefined) codalsBySubject[c.subject]++;
    });
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
    const allProgress = Object.values(state.progress);
    const avgEase = allProgress.length > 0
      ? allProgress.reduce((acc, p) => acc + p.srs.easeFactor, 0) / allProgress.length
      : 2.5;
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
      retentionRate: Math.round((avgEase / 3.0) * 100), // Adjusted denominator for realistic retention
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
    // Sort by due date (oldest first)
    const dueIds = Object.values(state.progress)
      .filter(p => p.srs.dueDate <= now)
      .sort((a, b) => a.srs.dueDate - b.srs.dueDate)
      .map(p => p.codalId);
    if (dueIds.length > 0) {
      const results = await Promise.all(dueIds.map(id => new CodalEntity(env, id).getState()));
      return results.filter(r => !!r.id);
    }
    // New items queue
    const allCodals = await CodalEntity.list(env);
    const unstudied = allCodals.items.filter(c => !state.progress[c.id]);
    const userOwned = unstudied.filter(c => c.ownerId === this.id);
    const systemOwned = unstudied.filter(c => c.isOfficial);
    return [...userOwned, ...systemOwned].slice(0, 5);
  }
}