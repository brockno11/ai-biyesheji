export type ConceptMasteryRecord = {
  conceptId: string
  conceptName: string
  courseId: string
  lessonId: string
  attempts: number
  correct: number
  interactionCompleted: boolean
  interactionScore: number
  checkpointScore: number
  mastery: number  // 0-100
  lastActive: number
}

export type ConceptMasterySummary = {
  overallMastery: number
  strongConcepts: ConceptMasteryRecord[]
  weakConcepts: ConceptMasteryRecord[]
  recentlyPracticed: ConceptMasteryRecord[]
}

const STORAGE_KEY = 'ml-platform-concept-mastery';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

function readAll(): ConceptMasteryRecord[] {
  try {
    if (!canUseStorage()) return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ConceptMasteryRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: ConceptMasteryRecord[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function findOrCreateRecord(params: {
  conceptId: string
  conceptName: string
  courseId: string
  lessonId: string
}): ConceptMasteryRecord {
  const records = readAll();
  const existing = records.find((r) => r.conceptId === params.conceptId);
  if (existing) return existing;
  const newRecord: ConceptMasteryRecord = {
    conceptId: params.conceptId,
    conceptName: params.conceptName,
    courseId: params.courseId,
    lessonId: params.lessonId,
    attempts: 0,
    correct: 0,
    interactionCompleted: false,
    interactionScore: 0,
    checkpointScore: 0,
    mastery: 0,
    lastActive: Date.now(),
  };
  records.push(newRecord);
  writeAll(records);
  return newRecord;
}

function computeMastery(record: ConceptMasteryRecord): number {
  const checkpointAccuracy = record.attempts > 0 ? record.correct / record.attempts : 0;
  const interactionScore = record.interactionScore;
  const completionBonus = record.interactionCompleted ? 10 : 0;
  // checkpointAccuracy is 0-1 scale, multiply by 100 to get 0-100 scale
  const mastery = checkpointAccuracy * 100 * 0.6 + interactionScore * 0.3 + completionBonus * 0.1;
  return Math.min(100, Math.max(0, Math.round(mastery)));
}

export type CheckpointResultParams = {
  conceptId: string
  conceptName: string
  courseId: string
  lessonId: string
  correct: boolean
}

export type InteractionCompletedParams = {
  conceptId: string
  conceptName: string
  courseId: string
  lessonId: string
  score: number  // 0-100
}

export const conceptMasteryService = {
  recordCheckpointResult(params: CheckpointResultParams): void {
    const records = readAll();
    let record = records.find((r) => r.conceptId === params.conceptId);
    if (record) {
      record.attempts += 1;
      record.correct += params.correct ? 1 : 0;
      record.lastActive = Date.now();
    } else {
      record = {
        conceptId: params.conceptId,
        conceptName: params.conceptName,
        courseId: params.courseId,
        lessonId: params.lessonId,
        attempts: 1,
        correct: params.correct ? 1 : 0,
        interactionCompleted: false,
        interactionScore: 0,
        checkpointScore: 0,
        mastery: 0,
        lastActive: Date.now(),
      };
      records.push(record);
    }
    record.checkpointScore = record.attempts > 0 ? Math.round((record.correct / record.attempts) * 100) : 0;
    record.mastery = computeMastery(record);
    writeAll(records);
  },

  recordInteractionCompleted(params: InteractionCompletedParams): void {
    const records = readAll();
    let record = records.find((r) => r.conceptId === params.conceptId);
    if (record) {
      record.interactionCompleted = true;
      record.interactionScore = params.score;
      record.lastActive = Date.now();
    } else {
      record = {
        conceptId: params.conceptId,
        conceptName: params.conceptName,
        courseId: params.courseId,
        lessonId: params.lessonId,
        attempts: 0,
        correct: 0,
        interactionCompleted: true,
        interactionScore: params.score,
        checkpointScore: 0,
        mastery: 0,
        lastActive: Date.now(),
      };
      records.push(record);
    }
    if (record.attempts === 0) {
      // If there's no checkpoint data, the interaction score alone determines mastery
      record.mastery = Math.round(params.score * 0.3 + 10 * 0.1);
    } else {
      record.mastery = computeMastery(record);
    }
    writeAll(records);
  },

  getConceptMasterySummary(): ConceptMasterySummary {
    const records = readAll();
    if (records.length === 0) {
      return {
        overallMastery: 0,
        strongConcepts: [],
        weakConcepts: [],
        recentlyPracticed: [],
      };
    }
    const total = records.reduce((sum, r) => sum + r.mastery, 0);
    const overallMastery = Math.round(total / records.length);

    const strongConcepts = records
      .filter((r) => r.mastery >= 80)
      .sort((a, b) => b.mastery - a.mastery);

    const weakConcepts = records
      .filter((r) => r.mastery < 60)
      .sort((a, b) => a.mastery - b.mastery);

    const recentlyPracticed = [...records]
      .sort((a, b) => b.lastActive - a.lastActive)
      .slice(0, 5);

    return { overallMastery, strongConcepts, weakConcepts, recentlyPracticed };
  },

  getWeakConcepts(limit?: number): ConceptMasteryRecord[] {
    const records = readAll();
    return records
      .filter((r) => r.mastery < 60)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, limit ?? records.length);
  },

  resetConceptMastery(): void {
    if (!canUseStorage()) return;
    localStorage.removeItem(STORAGE_KEY);
  },
};
