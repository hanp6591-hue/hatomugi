import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Award,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GrammarLesson, GrammarExercise, UserProfile, UserProgress } from '../types';
import { GRAMMAR_LESSONS } from '../data/mockData';
import { playSoundEffect } from '../utils/speech';

interface GrammarTabProps {
  userProfile: UserProfile;
  userProgress: UserProgress;
  onCompleteLesson: (lessonId: string, pointsEarned: number) => void;
}

export const GrammarTab: React.FC<GrammarTabProps> = ({
  userProfile,
  userProgress,
  onCompleteLesson,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<GrammarLesson>(GRAMMAR_LESSONS[0]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [fillAnswers, setFillAnswers] = useState<Record<string, string>>({});
  const [reorderedWords, setReorderedWords] = useState<Record<string, string[]>>({});
  const [submittedExercises, setSubmittedExercises] = useState<Record<string, boolean>>({});
  const [lessonFinished, setLessonFinished] = useState(false);

  const isCompleted = userProgress.completedLessonIds.includes(selectedLesson.id);

  // Initialize or reset exercise state when lesson changes
  const handleSelectLesson = (lesson: GrammarLesson) => {
    setSelectedLesson(lesson);
    setSelectedAnswers({});
    setFillAnswers({});
    setReorderedWords({});
    setSubmittedExercises({});
    setLessonFinished(false);
  };

  // Reorder word click handler
  const handleWordChipClick = (exerciseId: string, word: string, allWords: string[]) => {
    const current = reorderedWords[exerciseId] || [];
    if (current.includes(word)) {
      // remove
      setReorderedWords({
        ...reorderedWords,
        [exerciseId]: current.filter((w) => w !== word),
      });
    } else {
      // add
      setReorderedWords({
        ...reorderedWords,
        [exerciseId]: [...current, word],
      });
    }
    playSoundEffect('click');
  };

  const checkAnswer = (ex: GrammarExercise): boolean => {
    if (ex.type === 'choice') {
      return (selectedAnswers[ex.id] || '').trim().toLowerCase() === ex.correctAnswer.toLowerCase();
    }
    if (ex.type === 'fill-blank') {
      return (fillAnswers[ex.id] || '').trim().toLowerCase() === ex.correctAnswer.toLowerCase();
    }
    if (ex.type === 'reorder') {
      const currentSentence = (reorderedWords[ex.id] || []).join(' ');
      return currentSentence.trim().toLowerCase() === ex.correctAnswer.toLowerCase();
    }
    return false;
  };

  const handleCheckSingleExercise = (exId: string) => {
    setSubmittedExercises((prev) => ({ ...prev, [exId]: true }));
    const ex = selectedLesson.exercises.find((e) => e.id === exId);
    if (!ex) return;
    const isCorrect = checkAnswer(ex);
    if (isCorrect) {
      playSoundEffect('correct');
    } else {
      playSoundEffect('wrong');
    }
  };

  const handleFinishLesson = () => {
    // mark all submitted
    const newSubmitted: Record<string, boolean> = {};
    let correctCount = 0;
    selectedLesson.exercises.forEach((ex) => {
      newSubmitted[ex.id] = true;
      if (checkAnswer(ex)) correctCount++;
    });
    setSubmittedExercises(newSubmitted);
    setLessonFinished(true);

    const points = correctCount * 25 + 50;
    onCompleteLesson(selectedLesson.id, points);

    if (correctCount >= selectedLesson.exercises.length - 1) {
      playSoundEffect('complete');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      playSoundEffect('correct');
    }
  };

  const handleResetExercises = () => {
    setSelectedAnswers({});
    setFillAnswers({});
    setReorderedWords({});
    setSubmittedExercises({});
    setLessonFinished(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Quicksand',sans-serif]">
          Học Ngữ Pháp Tiếng Anh
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Nắm vững quy tắc ngữ pháp với giải thích tiếng Việt ngắn gọn, công thức dễ nhớ và bài tập tương tác tức thì.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lesson Navigation List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Danh sách bài học ngữ pháp
          </div>

          <div className="space-y-2">
            {GRAMMAR_LESSONS.map((lesson, idx) => {
              const isSelected = selectedLesson.id === lesson.id;
              const completed = userProgress.completedLessonIds.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-purple-50/90 border-purple-300 shadow-xs ring-1 ring-purple-200'
                      : 'bg-white border-slate-200/80 hover:border-purple-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                        {lesson.level}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Bài {idx + 1}</span>
                      {completed && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Đã học
                        </span>
                      )}
                    </div>
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-purple-900' : 'text-slate-800'}`}>
                      {lesson.titleVi}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{lesson.title}</p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 mt-1 shrink-0 ${isSelected ? 'text-purple-600 translate-x-0.5' : 'text-slate-300'}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Lesson Content & Exercises */}
        <div className="lg:col-span-8 space-y-6">
          {/* Lesson Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50/80 via-pink-50/50 to-white border border-purple-200/70 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                Cấp độ {selectedLesson.level} · Ngữ pháp trọng điểm
              </span>
              {isCompleted && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bạn đã hoàn thành bài này
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Quicksand',sans-serif]">
                {selectedLesson.titleVi}
              </h2>
              <div className="text-sm font-semibold text-purple-600 mt-0.5">{selectedLesson.title}</div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{selectedLesson.summary}</p>

            {/* Formula Highlight Box */}
            <div className="p-4 rounded-2xl bg-white/95 border-2 border-purple-200/70 shadow-2xs space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Công thức ghi nhớ:
              </div>
              <div className="text-sm sm:text-base font-extrabold text-slate-800 font-mono tracking-tight">
                {selectedLesson.formula}
              </div>
            </div>
          </div>

          {/* Theory & Usage Rules */}
          <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pink-500" />
              <span>Cách Dùng & Ví Dụ Minh Họa</span>
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              {selectedLesson.explanation}
            </p>

            <div className="space-y-2.5 pt-1">
              {selectedLesson.usageRules.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-pink-700">Quy tắc {idx + 1}: {item.rule}</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-white border border-pink-100 text-xs font-semibold text-slate-800 italic shrink-0">
                    &ldquo;{item.example}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Exercises Deck */}
          <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span>Bài Tập Tương Tác ({selectedLesson.exercises.length} câu)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thực hành ngay để ghi nhớ kiến thức và nhận giải thích chi tiết cho từng câu.
                </p>
              </div>

              {lessonFinished && (
                <button
                  onClick={handleResetExercises}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Làm lại bài
                </button>
              )}
            </div>

            <div className="space-y-5">
              {selectedLesson.exercises.map((ex, exIdx) => {
                const isSubmitted = submittedExercises[ex.id] || lessonFinished;
                const isCorrect = checkAnswer(ex);

                return (
                  <div
                    key={ex.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-rose-50/60 border-rose-200'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-600">
                        Câu {exIdx + 1} · {ex.type === 'choice' ? 'Trắc nghiệm' : ex.type === 'fill-blank' ? 'Điền từ' : 'Sắp xếp câu'}
                      </span>
                      {isSubmitted && (
                        <span
                          className={`text-xs font-bold flex items-center gap-1 ${
                            isCorrect ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> Chính xác (+25 XP)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" /> Chưa đúng
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-800 mb-3">{ex.question}</p>

                    {/* Type 1: Multiple Choice */}
                    {ex.type === 'choice' && ex.options && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {ex.options.map((opt) => {
                          const isChosen = selectedAnswers[ex.id] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              disabled={isSubmitted}
                              onClick={() => {
                                setSelectedAnswers({ ...selectedAnswers, [ex.id]: opt });
                                playSoundEffect('click');
                              }}
                              className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                                isChosen
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                              } ${isSubmitted ? 'cursor-default' : ''}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Type 2: Fill in the blank */}
                    {ex.type === 'fill-blank' && (
                      <div className="flex items-center gap-2 max-w-sm">
                        <input
                          type="text"
                          disabled={isSubmitted}
                          placeholder="Nhập đáp án..."
                          value={fillAnswers[ex.id] || ''}
                          onChange={(e) => setFillAnswers({ ...fillAnswers, [ex.id]: e.target.value })}
                          className="px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-purple-400 w-full"
                        />
                      </div>
                    )}

                    {/* Type 3: Sentence Reorder */}
                    {ex.type === 'reorder' && ex.words && (
                      <div className="space-y-3">
                        {/* Selected chips bar */}
                        <div className="min-h-[44px] p-2.5 rounded-xl bg-white border border-dashed border-purple-200 flex flex-wrap gap-2 items-center">
                          {(reorderedWords[ex.id] || []).length === 0 ? (
                            <span className="text-xs text-slate-400 italic">
                              Chạm các từ phía dưới theo thứ tự để ghép thành câu...
                            </span>
                          ) : (
                            (reorderedWords[ex.id] || []).map((w, wIdx) => (
                              <button
                                key={wIdx}
                                type="button"
                                disabled={isSubmitted}
                                onClick={() => handleWordChipClick(ex.id, w, ex.words!)}
                                className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-bold hover:bg-purple-200 transition-colors cursor-pointer"
                              >
                                {w} ×
                              </button>
                            ))
                          )}
                        </div>

                        {/* Available chips */}
                        <div className="flex flex-wrap gap-2">
                          {ex.words.map((w, wIdx) => {
                            const isSelectedWord = (reorderedWords[ex.id] || []).includes(w);
                            return (
                              <button
                                key={wIdx}
                                type="button"
                                disabled={isSubmitted || isSelectedWord}
                                onClick={() => handleWordChipClick(ex.id, w, ex.words!)}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                  isSelectedWord
                                    ? 'opacity-30 bg-slate-100 border-slate-200 cursor-not-allowed'
                                    : 'bg-white border-purple-200 text-slate-700 hover:bg-purple-50 hover:border-purple-400'
                                }`}
                              >
                                {w}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Submit Single Button */}
                    {!isSubmitted && (
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleCheckSingleExercise(ex.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Kiểm tra câu này
                        </button>
                      </div>
                    )}

                    {/* Explanation box after submit */}
                    {isSubmitted && (
                      <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1">
                        <div className="font-bold text-slate-700">
                          Đáp án đúng: <span className="text-purple-700">{ex.correctAnswer}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{ex.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Finalize Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Hoàn thành tất cả các câu để ghi nhận tiến độ và mở khóa huy hiệu!
              </span>

              <button
                onClick={handleFinishLesson}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Nộp bài & Nhận điểm thưởng</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
