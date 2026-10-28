/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeTab } from './components/HomeTab';
import { VocabularyTab } from './components/VocabularyTab';
import { GrammarTab } from './components/GrammarTab';
import { ListeningTab } from './components/ListeningTab';
import { GamesTab } from './components/GamesTab';
import { ProgressTab } from './components/ProgressTab';
import { ProfileTab } from './components/ProfileTab';
import { UserProfile, UserProgress, VocabularyWord } from './types';
import {
  VOCABULARY_LIST,
  DEFAULT_USER_PROFILE,
  INITIAL_PROGRESS,
} from './data/mockData';
import { BookOpen, GraduationCap, Headphones, Sparkles } from 'lucide-react';
import { playSoundEffect } from './utils/speech';

type MainTab = 'home' | 'lessons' | 'games' | 'progress' | 'profile';
type LessonSubTab = 'vocab' | 'grammar' | 'listening';

export default function App() {
  // 1. User Profile State (persisted)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('hatomugi_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  // 2. User Progress State (persisted)
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('hatomugi_progress');
      return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  });

  // 3. Vocabulary List (including custom words)
  const [vocabularyList, setVocabularyList] = useState<VocabularyWord[]>(() => {
    try {
      const saved = localStorage.getItem('hatomugi_custom_words');
      if (saved) {
        const custom = JSON.parse(saved);
        return [...custom, ...VOCABULARY_LIST];
      }
      return VOCABULARY_LIST;
    } catch {
      return VOCABULARY_LIST;
    }
  });

  // 4. Navigation states
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [activeLessonSubTab, setActiveLessonSubTab] = useState<LessonSubTab>('vocab');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hatomugi_profile', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('hatomugi_progress', JSON.stringify(userProgress));
    } catch {}
  }, [userProgress]);

  // Streak verification logic
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (userProgress.lastStudyDate !== today) {
      // Check if last study was yesterday or older
      const lastDate = new Date(userProgress.lastStudyDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        setUserProgress((prev) => ({
          ...prev,
          lastStudyDate: today,
          todayWordsCount: 0,
        }));
      } else if (diffDays > 1) {
        // Streak broken or new cycle
        setUserProgress((prev) => ({
          ...prev,
          lastStudyDate: today,
          todayWordsCount: 0,
        }));
      }
    }
  }, []);

  // Action handlers
  const handleToggleFavorite = (wordId: string) => {
    setUserProgress((prev) => {
      const exists = prev.favoriteWordIds.includes(wordId);
      const newFavs = exists
        ? prev.favoriteWordIds.filter((id) => id !== wordId)
        : [...prev.favoriteWordIds, wordId];
      return { ...prev, favoriteWordIds: newFavs };
    });
  };

  const handleToggleDifficult = (wordId: string) => {
    setUserProgress((prev) => {
      const exists = prev.difficultWordIds.includes(wordId);
      const newDiffs = exists
        ? prev.difficultWordIds.filter((id) => id !== wordId)
        : [...prev.difficultWordIds, wordId];
      return { ...prev, difficultWordIds: newDiffs };
    });
  };

  const handleMarkWordLearned = (wordId: string) => {
    setUserProgress((prev) => {
      // If it was in difficult, remove from difficult
      const newDiffs = prev.difficultWordIds.filter((id) => id !== wordId);
      const newCount = prev.todayWordsCount + 1;
      const newTotal = prev.totalWordsLearned + 1;
      const newPoints = prev.totalPoints + 10;

      return {
        ...prev,
        difficultWordIds: newDiffs,
        todayWordsCount: newCount,
        totalWordsLearned: newTotal,
        totalPoints: newPoints,
      };
    });
  };

  const handleAddCustomWord = (word: Omit<VocabularyWord, 'id'>) => {
    const newWordItem: VocabularyWord = {
      ...word,
      id: `custom_${Date.now()}`,
    };
    const updated = [newWordItem, ...vocabularyList];
    setVocabularyList(updated);

    try {
      const existingCustom = localStorage.getItem('hatomugi_custom_words');
      const list = existingCustom ? JSON.parse(existingCustom) : [];
      localStorage.setItem('hatomugi_custom_words', JSON.stringify([newWordItem, ...list]));
    } catch {}

    setUserProgress((prev) => ({
      ...prev,
      todayWordsCount: prev.todayWordsCount + 1,
      totalWordsLearned: prev.totalWordsLearned + 1,
      totalPoints: prev.totalPoints + 20,
    }));
  };

  const handleCompleteLesson = (lessonId: string, pointsEarned: number) => {
    setUserProgress((prev) => {
      const alreadyCompleted = prev.completedLessonIds.includes(lessonId);
      const newCompleted = alreadyCompleted ? prev.completedLessonIds : [...prev.completedLessonIds, lessonId];
      return {
        ...prev,
        completedLessonIds: newCompleted,
        totalPoints: prev.totalPoints + pointsEarned,
      };
    });
  };

  const handleCompleteDialogue = (dialogueId: string, pointsEarned: number) => {
    setUserProgress((prev) => {
      const alreadyCompleted = prev.completedDialogueIds.includes(dialogueId);
      const newCompleted = alreadyCompleted
        ? prev.completedDialogueIds
        : [...prev.completedDialogueIds, dialogueId];
      return {
        ...prev,
        completedDialogueIds: newCompleted,
        totalPoints: prev.totalPoints + pointsEarned,
      };
    });
  };

  const handleRecordGameWin = (points: number) => {
    setUserProgress((prev) => ({
      ...prev,
      completedGameCount: prev.completedGameCount + 1,
      totalPoints: prev.totalPoints + points,
    }));
  };

  const handleRecordTestScore = (score: number, points: number) => {
    setUserProgress((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
    }));
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleResetAllProgress = () => {
    setUserProgress(INITIAL_PROGRESS);
    setUserProfile(DEFAULT_USER_PROFILE);
    setVocabularyList(VOCABULARY_LIST);
    try {
      localStorage.removeItem('hatomugi_progress');
      localStorage.removeItem('hatomugi_profile');
      localStorage.removeItem('hatomugi_custom_words');
    } catch {}
    playSoundEffect('complete');
  };

  const toggleSound = () => {
    const nextVal = !userProfile.soundEnabled;
    handleUpdateProfile({ soundEnabled: nextVal });
    if (nextVal) playSoundEffect('click');
  };

  const handleNavigateFromHome = (tab: MainTab, subTab?: LessonSubTab) => {
    setActiveTab(tab);
    if (tab === 'lessons' && subTab) {
      setActiveLessonSubTab(subTab);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF9FD] text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProgress={userProgress}
        userProfile={userProfile}
        toggleSound={toggleSound}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-20 md:mb-10">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <HomeTab
            userProfile={userProfile}
            userProgress={userProgress}
            vocabularyList={vocabularyList}
            onNavigateTab={handleNavigateFromHome}
            onToggleFavorite={handleToggleFavorite}
            onToggleDifficult={handleToggleDifficult}
            onStartWordLearning={() => {
              setActiveTab('lessons');
              setActiveLessonSubTab('vocab');
            }}
          />
        )}

        {/* TAB 2: LESSONS (Sub-tabs: Vocab, Grammar, Listening) */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {/* Sub-tab segmented bar */}
            <div className="flex items-center justify-center sm:justify-start">
              <div className="inline-flex p-1.5 bg-white border border-pink-100 rounded-2xl shadow-xs">
                <button
                  onClick={() => setActiveLessonSubTab('vocab')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeLessonSubTab === 'vocab'
                      ? 'bg-pink-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-pink-600'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Từ Vựng</span>
                </button>

                <button
                  onClick={() => setActiveLessonSubTab('grammar')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeLessonSubTab === 'grammar'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-purple-600'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Ngữ Pháp</span>
                </button>

                <button
                  onClick={() => setActiveLessonSubTab('listening')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeLessonSubTab === 'listening'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>Luyện Nghe & Nói</span>
                </button>
              </div>
            </div>

            {/* Sub-tab content */}
            {activeLessonSubTab === 'vocab' && (
              <VocabularyTab
                vocabularyList={vocabularyList}
                userProfile={userProfile}
                userProgress={userProgress}
                onToggleFavorite={handleToggleFavorite}
                onToggleDifficult={handleToggleDifficult}
                onAddCustomWord={handleAddCustomWord}
                onMarkWordLearned={handleMarkWordLearned}
              />
            )}

            {activeLessonSubTab === 'grammar' && (
              <GrammarTab
                userProfile={userProfile}
                userProgress={userProgress}
                onCompleteLesson={handleCompleteLesson}
              />
            )}

            {activeLessonSubTab === 'listening' && (
              <ListeningTab
                userProfile={userProfile}
                userProgress={userProgress}
                onCompleteDialogue={handleCompleteDialogue}
              />
            )}
          </div>
        )}

        {/* TAB 3: GAMES */}
        {activeTab === 'games' && (
          <GamesTab
            vocabularyList={vocabularyList}
            userProfile={userProfile}
            userProgress={userProgress}
            onRecordGameWin={handleRecordGameWin}
          />
        )}

        {/* TAB 4: PROGRESS & REVIEW */}
        {activeTab === 'progress' && (
          <ProgressTab
            userProfile={userProfile}
            userProgress={userProgress}
            vocabularyList={vocabularyList}
            onRemoveFavorite={handleToggleFavorite}
            onRemoveDifficult={handleToggleDifficult}
            onRecordTestScore={handleRecordTestScore}
          />
        )}

        {/* TAB 5: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <ProfileTab
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onResetAllProgress={handleResetAllProgress}
          />
        )}
      </main>

      {/* Aesthetic Footer */}
      <footer className="border-t border-pink-100 bg-white/70 py-6 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-pink-600 font-['Quicksand',sans-serif]">Hatomugi</span>
            <span>·</span>
            <span>Learn English Every Day – Chinh phục tiếng Anh mỗi ngày</span>
          </div>
          <div className="text-slate-400">
            Ứng dụng tự học tiếng Anh tương tác · Thiết kế dễ thương & thân thiện
          </div>
        </div>
      </footer>
    </div>
  );
}
