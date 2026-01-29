import { SRSParams } from "@shared/types";
/**
 * SM-2 Algorithm Implementation
 * grade: 0-5 (0: total blackout, 5: perfect recall)
 */
export function calculateReview(previous: SRSParams, grade: number): SRSParams {
  let { interval, easeFactor, repetitions, dueDate } = previous;
  if (grade >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
    easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  } else {
    repetitions = 0;
    interval = 1;
  }
  if (easeFactor < 1.3) easeFactor = 1.3;
  const newDueDate = Date.now() + interval * 24 * 60 * 60 * 1000;
  return {
    interval,
    easeFactor,
    repetitions,
    dueDate: newDueDate,
  };
}
export const INITIAL_SRS: SRSParams = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
  dueDate: Date.now(),
};