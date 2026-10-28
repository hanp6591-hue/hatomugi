import React, { useState } from 'react';
import {
  Flame,
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookmarkCheck,
  Star,
  RotateCcw,
  BookOpen,
  Volume2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, UserProgress, VocabularyWord, Badge } from '../types';
import { INITIAL_BADGES } from '../data/mockData';
import { speakEnglish, playSoundEffect } from '../utils/speech';

interface ProgressTabProps {
  userProfile: UserProfile;
  userProgress: UserProgress;
  vocabularyList: VocabularyWord[];
  onRemoveFavorite: (wordId: string) => void;
  onRemoveDifficult: (wordId: string) => void;
  onRecordTestScore: (score: number, points: number) => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  userProfile,
  userProgress,
  vocabularyList,
  onRemoveFavorite,
  onRemoveDifficult,
  onRecordTestScore,
}) => {
  const trophyImg = '/src/assets/images/hatomugi_achievement_badge_1793198378048.jpg';
  const [activeReviewSection, setActiveReviewSection] = useState<'difficult' | 'favorites' | 'test'>('difficult');

  // Comprehensive 10-question test state
  const [testInProgress, setTestInProgress] = useState(false);
  const [testCurrentIndex, setTestCurrentIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);

  // Generate 10 test questions from vocabulary & grammar
  const testQuestions = [
    {
      question: 'Từ "cherish" có nghĩa là gì?',
      options: ['Yêu thương, trân trọng', 'Trừng phạt', 'Lãng quên', 'Nghi ngờ'],
      correct: 'Yêu thương, trân trọng',
      explanation: '"cherish" nghĩa là nâng niu, yêu thương và trân trọng sâu sắc.',
    },
    {
      question: 'Điền dạng đúng: "She usually _____ English for 30 minutes every morning."',
      options: ['studies', 'study', 'studying', 'studied'],
      correct: 'studies',
      explanation: 'Thì hiện tại đơn với chủ ngữ ngôi thứ 3 số ít "She", động từ "study" đổi thành "studies".',
    },
    {
      question: 'Từ nào có nghĩa là "hạn chót hoàn thành công việc"?',
      options: ['Schedule', 'Deadline', 'Presentation', 'Assignment'],
      correct: 'Deadline',
      explanation: '"Deadline" là hạn chót, thời hạn cuối cùng để nộp hoặc hoàn thành công việc.',
    },
    {
      question: 'Chọn câu so sánh hơn đúng:',
      options: [
        'A rabbit is faster than a turtle.',
        'A rabbit is more fast than a turtle.',
        'A rabbit is fastest than a turtle.',
        'A rabbit is more faster than a turtle.',
      ],
      correct: 'A rabbit is faster than a turtle.',
      explanation: 'Tính từ ngắn "fast" chuyển sang so sánh hơn thêm đuôi -er -> faster than.',
    },
    {
      question: 'Từ "breathtaking" mang ý nghĩa:',
      options: ['Ngoạn mục, đẹp ngỡ ngàng', 'Khó thở, ngột ngạt', 'Buồn tẻ, ảm đạm', 'Nguy hiểm'],
      correct: 'Ngoạn mục, đẹp ngỡ ngàng',
      explanation: '"Breathtaking" miêu tả vẻ đẹp lộng lẫy khiến người xem ngỡ ngàng.',
    },
    {
      question: 'Điền từ khuyết thiếu: "You look exhausted. You _____ go to bed early."',
      options: ['should', 'must to', 'ought', 'can to'],
      correct: 'should',
      explanation: '"Should" dùng để đưa ra lời khuyên hữu ích, theo sau là động từ nguyên mẫu.',
    },
    {
      question: 'Từ "colleague" có nghĩa là:',
      options: ['Đồng nghiệp', 'Trường đại học', 'Sinh viên', 'Khách hàng'],
      correct: 'Đồng nghiệp',
      explanation: '"Colleague" là đồng nghiệp, người làm cùng cơ quan hoặc công ty.',
    },
    {
      question: 'Thì quá khứ đơn của động từ "write" là:',
      options: ['wrote', 'written', 'writed', 'writes'],
      correct: 'wrote',
      explanation: '"write" là động từ bất quy tắc, ở dạng quá khứ V2 là "wrote".',
    },
    {
      question: 'Từ "ingredient" trong ẩm thực có nghĩa là:',
      options: ['Nguyên liệu nấu ăn', 'Công thức món', 'Bếp trưởng', 'Nhà hàng'],
      correct: 'Nguyên liệu nấu ăn',
      explanation: '"Ingredient" là các thành phần, nguyên liệu để chế biến món ăn.',
    },
    {
      question: 'Hatomugi có slogan là gì?',
      options: [
        'Learn English Every Day – Chinh phục tiếng Anh mỗi ngày',
        'Learn English Faster',
        'Study English Now',
        'English For Everyone',
      ],
      correct: 'Learn English Every Day – Chinh phục tiếng Anh mỗi ngày',
      explanation: 'Slogan chính thức của Hatomugi là "Learn English Every Day – Chinh phục tiếng Anh mỗi ngày".',
    },
  ];

  const favoriteWords = vocabularyList.filter((w) => userProgress.favoriteWordIds.includes(w.id));
  const difficultWords = vocabularyList.filter((w) => userProgress.difficultWordIds.includes(w.id));

  // Max minutes for chart scaling
  const maxMinutes = Math.max(...userProgress.weeklyActivity.map((a) => a.minutes), 30);

  const handleStartTest = () => {
    setTestAnswers({});
    setTestCurrentIndex(0);
    setTestSubmitted(false);
    setTestInProgress(true);
  };

  const handleSelectTestOption = (option: string) => {
    setTestAnswers({ ...testAnswers, [testCurrentIndex]: option });
    playSoundEffect('click');
  };

  const handleSubmitTest = () => {
    setTestSubmitted(true);
    let correct = 0;
    testQuestions.forEach((q, idx) => {
      if (testAnswers[idx] === q.correct) correct++;
    });

    const earnedPoints = correct * 15 + 50;
    onRecordTestScore(correct, earnedPoints);

    if (correct >= 8) {
      playSoundEffect('complete');
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } else {
      playSoundEffect('correct');
    }
  };

  const testCorrectCount = Object.keys(testAnswers).reduce((acc, key) => {
    const idx = parseInt(key, 10);
    return testAnswers[idx] === testQuestions[idx].correct ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Quicksand',sans-serif]">
          Tiến Độ Học Tập & Ôn Tập
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Theo dõi chuỗi ngày liên tiếp, biểu đồ thời gian học và ôn tập các từ khó để ghi nhớ dài hạn.
        </p>
      </div>

      {/* Overview Grid: Streak + Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50/60 to-white border border-orange-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Chuỗi ngày học</span>
            <Flame className="w-5 h-5 text-orange-500 fill-orange-400 animate-bounce" />
          </div>
          <div className="text-3xl font-black text-slate-900 tabular-nums">
            {userProgress.streak} <span className="text-sm font-semibold text-slate-500">ngày liên tiếp</span>
          </div>
          <p className="text-xs text-slate-600">
            Bạn đang duy trì thói quen học rất tuyệt vời! Tiếp tục học vào ngày mai để không ngắt chuỗi nhé.
          </p>
        </div>

        {/* Total learned words */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-50 via-purple-50/60 to-white border border-pink-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-700 uppercase tracking-wider">Vốn từ tích lũy</span>
            <BookOpen className="w-5 h-5 text-pink-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 tabular-nums">
            {userProgress.totalWordsLearned} <span className="text-sm font-semibold text-slate-500">từ vựng</span>
          </div>
          <p className="text-xs text-slate-600">
            Đã nắm vững từ cơ bản đến trung cấp thuộc 6 chủ đề giao tiếp thông dụng.
          </p>
        </div>

        {/* Experience Points */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-violet-50/60 to-white border border-purple-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Điểm kinh nghiệm</span>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 tabular-nums">
            {userProgress.totalPoints} <span className="text-sm font-semibold text-slate-500">XP</span>
          </div>
          <p className="text-xs text-slate-600">
            Cấp độ hiện tại: <span className="font-bold text-purple-700">{userProfile.level}</span>.
          </p>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="bg-white rounded-3xl border border-pink-100 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              <span>Biểu Đồ Học Tập Tuần Này (Thứ 2 - Chủ Nhật)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Thời gian học tập và số từ vựng hoàn thành theo ngày</p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl">
            Tổng: {userProgress.weeklyActivity.reduce((acc, cur) => acc + cur.minutes, 0)} phút
          </span>
        </div>

        {/* Bar chart visualization */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end pt-6 pb-2 min-h-[160px]">
          {userProgress.weeklyActivity.map((item, idx) => {
            const heightPercent = maxMinutes > 0 ? Math.round((item.minutes / maxMinutes) * 100) : 0;
            const isToday = item.day === 'T5'; // matches mock day

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                  {item.minutes > 0 ? `${item.minutes}p` : ''}
                </span>

                <div className="w-full max-w-[36px] bg-slate-100 rounded-xl h-28 flex items-end p-1">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isToday
                        ? 'bg-gradient-to-t from-pink-500 to-purple-500 shadow-xs'
                        : item.minutes > 0
                        ? 'bg-pink-300'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(8, heightPercent)}%` }}
                    title={`${item.day}: ${item.minutes} phút, ${item.words} từ`}
                  />
                </div>

                <span
                  className={`text-xs font-bold ${
                    isToday ? 'text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md' : 'text-slate-500'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Hub: Switch between Difficult, Favorites and 10-Question Test */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveReviewSection('difficult')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeReviewSection === 'difficult'
                ? 'bg-rose-100 text-rose-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 text-rose-500" />
            <span>Từ khó cần ôn lại ({difficultWords.length})</span>
          </button>

          <button
            onClick={() => setActiveReviewSection('favorites')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeReviewSection === 'favorites'
                ? 'bg-amber-100 text-amber-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>Từ vựng yêu thích ({favoriteWords.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveReviewSection('test');
              if (!testInProgress && !testSubmitted) handleStartTest();
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeReviewSection === 'test'
                ? 'bg-purple-100 text-purple-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>Bài Kiểm Tra 10 Câu</span>
          </button>
        </div>

        {/* SECTION A: Difficult words */}
        {activeReviewSection === 'difficult' && (
          <div className="space-y-3">
            {difficultWords.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-800">Không có từ khó nào cần ôn!</h3>
                <p className="text-xs text-slate-500">
                  Bạn đã ghi nhớ rất tốt các từ vựng. Khi học nếu gặp từ nào khó, hãy nhấn dấu cờ để lưu vào đây nhé.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {difficultWords.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-rose-100 hover:border-rose-200 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.word}</span>
                        <span className="text-xs font-mono text-pink-600">{item.ipa}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{item.meaning}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => speakEnglish(item.word, { rate: userProfile.speechRate })}
                        className="p-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          onRemoveDifficult(item.id);
                          playSoundEffect('correct');
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 text-xs font-bold cursor-pointer"
                        title="Đã thuộc, xóa khỏi danh sách từ khó"
                      >
                        ✓ Đã thuộc
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION B: Favorites */}
        {activeReviewSection === 'favorites' && (
          <div className="space-y-3">
            {favoriteWords.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
                <Star className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="font-bold text-slate-800">Chưa có từ vựng yêu thích</h3>
                <p className="text-xs text-slate-500">
                  Hãy nhấn biểu tượng ngôi sao ở các thẻ từ vựng để lưu các từ tâm đắc vào đây nhé!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favoriteWords.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-amber-100 hover:border-amber-200 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.word}</span>
                        <span className="text-xs font-mono text-amber-600">{item.ipa}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{item.meaning}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => speakEnglish(item.word, { rate: userProfile.speechRate })}
                        className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          onRemoveFavorite(item.id);
                          playSoundEffect('click');
                        }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 cursor-pointer"
                        title="Bỏ thích"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION C: 10-Question Test */}
        {activeReviewSection === 'test' && (
          <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-xs space-y-6">
            {!testSubmitted ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-xl">
                    Câu {testCurrentIndex + 1} / {testQuestions.length}
                  </span>
                  <span className="text-xs text-slate-400">
                    Đã trả lời {Object.keys(testAnswers).length}/{testQuestions.length}
                  </span>
                </div>

                {/* Question text */}
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {testQuestions[testCurrentIndex].question}
                  </h3>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {testQuestions[testCurrentIndex].options.map((opt, oIdx) => {
                    const isChosen = testAnswers[testCurrentIndex] === opt;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectTestOption(opt)}
                        className={`p-4 rounded-2xl border text-sm font-semibold text-left transition-all cursor-pointer ${
                          isChosen
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Stepper buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    disabled={testCurrentIndex === 0}
                    onClick={() => setTestCurrentIndex((i) => i - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    ← Câu trước
                  </button>

                  {testCurrentIndex < testQuestions.length - 1 ? (
                    <button
                      onClick={() => setTestCurrentIndex((i) => i + 1)}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Câu tiếp theo →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitTest}
                      disabled={Object.keys(testAnswers).length < testQuestions.length}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      Hoàn thành & Nộp bài
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center text-4xl">
                  {testCorrectCount >= 8 ? '🎉' : '👏'}
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 font-['Quicksand',sans-serif]">
                    Kết Quả Kiểm Tra Đạt {testCorrectCount}/{testQuestions.length} Điểm!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {testCorrectCount >= 8
                      ? 'Xuất sắc! Bạn đã nắm rất vững kiến thức từ vựng và ngữ pháp vừa học.'
                      : 'Làm tốt lắm! Hãy xem lại các câu giải thích phía dưới để hoàn thiện hơn nhé.'}
                  </p>
                </div>

                {/* Detailed answers review */}
                <div className="space-y-3 text-left max-h-[340px] overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  {testQuestions.map((q, idx) => {
                    const isRight = testAnswers[idx] === q.correct;
                    return (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            Câu {idx + 1}: {q.question}
                          </span>
                          <span className={isRight ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            {isRight ? '✓ Đúng' : '✕ Sai'}
                          </span>
                        </div>
                        <div className="text-slate-600">
                          Đáp án đúng: <span className="font-bold text-purple-700">{q.correct}</span>
                        </div>
                        <p className="text-slate-500 italic">{q.explanation}</p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleStartTest}
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Làm lại bài kiểm tra
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Badges & Achievements Showcase */}
      <div className="bg-white rounded-3xl border border-pink-100 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-pink-100 p-1 border border-pink-200 shrink-0">
              <img src={trophyImg} alt="Badge trophy" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Huy Hiệu & Cột Mốc Thành Tích
              </h2>
              <p className="text-xs text-slate-500">Mở khóa huy hiệu khi đạt các mốc học tập đều đặn</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {INITIAL_BADGES.map((b) => {
            const isUnlocked =
              b.id === 'b1' ||
              (b.id === 'b2' && userProgress.streak >= 3) ||
              (b.id === 'b3' && userProgress.totalWordsLearned >= 15) ||
              (b.id === 'b4' && userProgress.completedLessonIds.length >= 2) ||
              (b.id === 'b5' && userProgress.completedGameCount >= 5);

            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-pink-50/70 to-purple-50/70 border-pink-200 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    isUnlocked ? 'bg-white shadow-2xs text-pink-600' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isUnlocked ? '⭐' : '🔒'}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{b.description}</p>
                  <span className={`text-[10px] font-bold mt-1 inline-block ${isUnlocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isUnlocked ? '✓ Đã đạt được' : 'Chưa mở khóa'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
