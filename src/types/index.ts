export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface VocabularyWord {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';
  exampleEn: string;
  exampleVi: string;
  topicId: string;
  level: EnglishLevel;
  icon?: string;
}

export interface Topic {
  id: string;
  name: string;
  nameVi: string;
  icon: string;
  description: string;
  color: string;
}

export interface GrammarExercise {
  id: string;
  type: 'choice' | 'fill-blank' | 'reorder';
  question: string;
  options?: string[];
  words?: string[]; // for reorder
  correctAnswer: string;
  explanation: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  titleVi: string;
  level: EnglishLevel;
  summary: string;
  formula: string;
  explanation: string;
  usageRules: { rule: string; example: string }[];
  exercises: GrammarExercise[];
}

export interface DialogueTurn {
  speaker: string;
  role: 'A' | 'B';
  avatar: string;
  en: string;
  vi: string;
}

export interface ListeningDialogue {
  id: string;
  title: string;
  titleVi: string;
  topic: string;
  level: EnglishLevel;
  description: string;
  dialogue: DialogueTurn[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  practiceSentences: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'words' | 'grammar' | 'game';
  requiredCount: number;
  unlocked: boolean;
}

export interface UserProgress {
  streak: number;
  lastStudyDate: string;
  todayWordsCount: number;
  totalWordsLearned: number;
  totalPoints: number;
  todayMinutes: number;
  favoriteWordIds: string[];
  difficultWordIds: string[];
  completedLessonIds: string[];
  completedDialogueIds: string[];
  completedGameCount: number;
  weeklyActivity: { day: string; words: number; minutes: number }[];
}

export interface UserProfile {
  name: string;
  level: EnglishLevel;
  avatar: string;
  dailyGoal: number; // words per day
  soundEnabled: boolean;
  speechRate: number; // 0.8 to 1.1
  speechAccent: 'en-US' | 'en-GB';
}
