import React, { useState } from 'react';
import {
  Flame,
  BookOpen,
  Award,
  Clock,
  Volume2,
  Sparkles,
  ArrowRight,
  Headphones,
  Gamepad2,
  GraduationCap,
  Star,
  CheckCircle2,
  BookmarkCheck,
} from 'lucide-react';
import { UserProfile, UserProgress, VocabularyWord } from '../types';
import { speakEnglish, playSoundEffect } from '../utils/speech';

interface HomeTabProps {
  userProfile: UserProfile;
  userProgress: UserProgress;
  vocabularyList: VocabularyWord[];
  onNavigateTab: (tab: 'lessons' | 'games' | 'progress' | 'profile', subTab?: 'vocab' | 'grammar' | 'listening') => void;
  onToggleFavorite: (wordId: string) => void;
  onToggleDifficult: (wordId: string) => void;
  onStartWordLearning: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  userProfile,
  userProgress,
  vocabularyList,
  onNavigateTab,
  onToggleFavorite,
  onToggleDifficult,
  onStartWordLearning,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const heroImg = '/src/assets/images/hatomugi_hero_study_1793198377889.jpg';
  const mascotImg = '/src/assets/images/hatomugi_mascot_logo_1793198376760.jpg';

  // Word of the day (pick based on day of month)
  const dayIndex = new Date().getDate() % vocabularyList.length;
  const wordOfDay = vocabularyList[dayIndex] || vocabularyList[0];

  const isFav = userProgress.favoriteWordIds.includes(wordOfDay.id);
  const isDiff = userProgress.difficultWordIds.includes(wordOfDay.id);

  const goalPercent = Math.min(100, Math.round((userProgress.todayWordsCount / userProfile.dailyGoal) * 100));

  const handleSpeak = (text: string) => {
    setIsPlayingAudio(true);
    speakEnglish(text, {
      rate: userProfile.speechRate,
      lang: userProfile.speechAccent,
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Hero Welcome Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-purple-50/70 to-pink-100/60 border border-pink-200/60 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-pink-600 bg-pink-100/90 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" /> Chào ngày mới, {userProfile.name}!
              </span>
              <span className="text-xs text-purple-600 bg-purple-100/80 px-2.5 py-1 rounded-full font-medium">
                Cấp độ: {userProfile.level}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-['Quicksand',sans-serif]">
              Học Tiếng Anh Thật Vui,{' '}
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Chinh Phục Mỗi Ngày!
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              &ldquo;Hạt ngọc nảy mầm từ sự kiên trì&rdquo;. Cùng thỏ con Hatomugi ôn tập từ vựng, rèn luyện phản xạ nghe nói và hoàn thành mục tiêu ngày hôm nay nhé!
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onStartWordLearning}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-sm shadow-md shadow-pink-500/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Học tiếp bài hôm nay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('games')}
                className="px-5 py-3 rounded-2xl bg-white/90 hover:bg-white text-purple-700 border border-purple-200 font-semibold text-sm shadow-xs hover:shadow-sm active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4 text-purple-500" />
                <span>Chơi minigame</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-sm border border-pink-100 group">
              <img
                src={heroImg}
                alt="Hatomugi English study desk"
                className="w-full h-52 sm:h-64 object-cover object-center group-hover:scale-102 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent flex items-end p-4">
                <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-pink-700 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Mỗi ngày 15 phút - Tự tin giao tiếp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Stats Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-100/80 shadow-xs hover:border-pink-200 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/60 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-400" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-800 tabular-nums">
              {userProgress.streak} <span className="text-xs font-semibold text-slate-400">ngày</span>
            </div>
            <div className="text-xs font-medium text-slate-500">Chuỗi học liên tiếp</div>
          </div>
        </div>

        {/* Today Words */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-purple-100/80 shadow-xs hover:border-purple-200 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-800 tabular-nums">
              {userProgress.todayWordsCount}
              <span className="text-xs font-semibold text-slate-400">/{userProfile.dailyGoal}</span>
            </div>
            <div className="text-xs font-medium text-slate-500">Từ vựng hôm nay</div>
          </div>
        </div>

        {/* Points */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-pink-100/80 shadow-xs hover:border-pink-200 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200/60 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-800 tabular-nums">
              {userProgress.totalPoints} <span className="text-xs font-semibold text-slate-400">XP</span>
            </div>
            <div className="text-xs font-medium text-slate-500">Điểm kinh nghiệm</div>
          </div>
        </div>

        {/* Minutes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100/80 shadow-xs hover:border-emerald-200 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-800 tabular-nums">
              {userProgress.todayMinutes} <span className="text-xs font-semibold text-slate-400">phút</span>
            </div>
            <div className="text-xs font-medium text-slate-500">Thời gian học tập</div>
          </div>
        </div>
      </section>

      {/* Daily Goal Progress Bar */}
      <section className="bg-white rounded-2xl border border-pink-100 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">
              🎯
            </div>
            <span className="font-bold text-slate-800 text-sm sm:text-base">Mục tiêu học hôm nay</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              · {userProgress.todayWordsCount} trên {userProfile.dailyGoal} từ vựng
            </span>
          </div>
          <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg tabular-nums">
            {goalPercent}%
          </span>
        </div>

        {/* Progress meter */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 h-full rounded-full transition-all duration-500 shadow-2xs"
            style={{ width: `${goalPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>{goalPercent >= 100 ? '🎉 Bạn đã hoàn thành xuất sắc mục tiêu hôm nay!' : `Cố lên, chỉ còn ${Math.max(0, userProfile.dailyGoal - userProgress.todayWordsCount)} từ nữa thôi!`}</span>
          <button
            onClick={onStartWordLearning}
            className="text-pink-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            Học ngay <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Word of the Day & Quick Review Alert */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Word of the Day Card */}
        <div className="lg:col-span-7 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30 rounded-3xl border border-pink-200/70 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-100/80 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Từ vựng nổi bật của ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onToggleFavorite(wordOfDay.id);
                  playSoundEffect('star');
                }}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isFav ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:text-amber-500'
                }`}
                title="Đánh dấu yêu thích"
              >
                <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
              </button>
              <button
                onClick={() => {
                  onToggleDifficult(wordOfDay.id);
                  playSoundEffect('click');
                }}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDiff ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400 hover:text-rose-500'
                }`}
                title="Đánh dấu từ khó cần ôn"
              >
                <BookmarkCheck className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{wordOfDay.word}</h3>
              <span className="text-sm font-semibold text-pink-600 font-mono">{wordOfDay.ipa}</span>
              <span className="text-xs uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                {wordOfDay.partOfSpeech}
              </span>
            </div>
            <p className="text-lg font-bold text-slate-800">{wordOfDay.meaning}</p>
          </div>

          {/* Example Box */}
          <div className="p-3.5 rounded-2xl bg-white border border-pink-100/90 space-y-1.5">
            <div className="text-sm text-slate-800 font-medium italic">&ldquo;{wordOfDay.exampleEn}&rdquo;</div>
            <div className="text-xs text-slate-500">{wordOfDay.exampleVi}</div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => handleSpeak(wordOfDay.word)}
              disabled={isPlayingAudio}
              className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe phát âm chuẩn</span>
            </button>

            <button
              onClick={() => handleSpeak(wordOfDay.exampleEn)}
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs flex items-center gap-1.5 border border-purple-200 cursor-pointer transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Nghe câu ví dụ</span>
            </button>
          </div>
        </div>

        {/* Mascot Encouragement & Spaced Repetition Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-3xl border border-purple-100 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-pink-100 shrink-0 border border-pink-200">
              <img src={mascotImg} alt="Mugi mascot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="text-xs font-bold text-pink-600">Lời nhắn từ bạn Thỏ Mugi</div>
              <h4 className="font-bold text-slate-800 text-base">Học đều đặn mỗi ngày!</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                Chỉ cần 10 từ vựng mỗi ngày, sau 1 tháng bạn sẽ tích lũy được hơn 300 từ mới!
              </p>
            </div>
          </div>

          {/* Spaced Repetition Notification */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-900">Từ vựng cần ôn lại</span>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {userProgress.difficultWordIds.length} từ
              </span>
            </div>
            <p className="text-xs text-amber-800">
              Ôn lại các từ khó giúp củng cố trí nhớ dài hạn và không bị quên lãng.
            </p>
            <button
              onClick={() => onNavigateTab('progress')}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 hover:underline pt-1 cursor-pointer"
            >
              Xem danh sách ôn tập ngay <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Đã hoàn thành {userProgress.totalWordsLearned} từ
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-500" /> Cấp độ {userProfile.level}
            </span>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards (Bố trí dạng card lớn trực quan) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-['Quicksand',sans-serif]">
            Chương Trình Học Tập Chính
          </h2>
          <span className="text-xs text-slate-500 font-medium">Chọn một nội dung để luyện tập</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Vocabulary */}
          <button
            onClick={() => onNavigateTab('lessons', 'vocab')}
            className="p-5 rounded-3xl bg-gradient-to-b from-pink-50/80 to-white border border-pink-100 hover:border-pink-300 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                Từ Vựng Theo Chủ Đề
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                6 chủ đề thiết thực: Gia đình, Trường học, Đồ ăn, Du lịch, Công việc và Cảm xúc.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-pink-600 gap-1">
              <span>Khám phá từ mới</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Grammar */}
          <button
            onClick={() => onNavigateTab('lessons', 'grammar')}
            className="p-5 rounded-3xl bg-gradient-to-b from-purple-50/80 to-white border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Ngữ Pháp Trọng Tâm
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Giải thích tiếng Việt dễ hiểu, công thức ngắn gọn, kèm bài tập tương tác tức thì.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-purple-600 gap-1">
              <span>Học ngữ pháp</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Listening & Pronunciation */}
          <button
            onClick={() => onNavigateTab('lessons', 'listening')}
            className="p-5 rounded-3xl bg-gradient-to-b from-blue-50/80 to-white border border-blue-100 hover:border-blue-300 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Luyện Nghe & Phát Âm
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hội thoại hai chiều tự nhiên, phụ đề song ngữ và ghi âm micro chấm điểm phát âm.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-blue-600 gap-1">
              <span>Luyện nghe nói</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Games & Quizzes */}
          <button
            onClick={() => onNavigateTab('games')}
            className="p-5 rounded-3xl bg-gradient-to-b from-emerald-50/80 to-white border border-emerald-100 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Trò Chơi Học Tiếng Anh
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nối từ, trắc nghiệm tốc độ, điền chữ cái còn thiếu và sắp xếp từ thành câu.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-emerald-600 gap-1">
              <span>Chơi & tích điểm</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
