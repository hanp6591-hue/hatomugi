import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Star,
  BookmarkCheck,
  Search,
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Plus,
  X,
  Check,
  Sparkles,
  Smile,
  BookOpen,
} from 'lucide-react';
import { Topic, VocabularyWord, UserProfile, UserProgress } from '../types';
import { TOPICS } from '../data/mockData';
import { speakEnglish, playSoundEffect } from '../utils/speech';

interface VocabularyTabProps {
  vocabularyList: VocabularyWord[];
  userProfile: UserProfile;
  userProgress: UserProgress;
  onToggleFavorite: (wordId: string) => void;
  onToggleDifficult: (wordId: string) => void;
  onAddCustomWord: (word: Omit<VocabularyWord, 'id'>) => void;
  onMarkWordLearned: (wordId: string) => void;
}

export const VocabularyTab: React.FC<VocabularyTabProps> = ({
  vocabularyList,
  userProfile,
  userProgress,
  onToggleFavorite,
  onToggleDifficult,
  onAddCustomWord,
  onMarkWordLearned,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'difficult'>('all');
  const [isSlowAudio, setIsSlowAudio] = useState(false);
  const [studyModalOpen, setStudyModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Flashcard study mode state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New word form state
  const [newWord, setNewWord] = useState({
    word: '',
    ipa: '',
    meaning: '',
    partOfSpeech: 'noun' as VocabularyWord['partOfSpeech'],
    exampleEn: '',
    exampleVi: '',
    topicId: 'family',
    level: 'A1' as VocabularyWord['level'],
  });

  // Filtered vocabulary list
  const filteredWords = useMemo(() => {
    return vocabularyList.filter((item) => {
      // Topic filter
      if (selectedTopicId !== 'all' && item.topicId !== selectedTopicId) {
        return false;
      }
      // Mode filter
      if (filterMode === 'favorites' && !userProgress.favoriteWordIds.includes(item.id)) {
        return false;
      }
      if (filterMode === 'difficult' && !userProgress.difficultWordIds.includes(item.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.word.toLowerCase().includes(q) ||
          item.meaning.toLowerCase().includes(q) ||
          item.exampleEn.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vocabularyList, selectedTopicId, filterMode, searchQuery, userProgress]);

  const handleSpeak = (text: string, slow = false) => {
    speakEnglish(text, {
      rate: slow ? 0.75 : userProfile.speechRate,
      lang: userProfile.speechAccent,
    });
  };

  const handleOpenStudyModal = () => {
    if (filteredWords.length === 0) return;
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyModalOpen(true);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < filteredWords.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    }
  };

  const handleCardMastered = (wordId: string) => {
    onMarkWordLearned(wordId);
    playSoundEffect('correct');
    handleNextCard();
  };

  const handleCardReviewAgain = (wordId: string) => {
    onToggleDifficult(wordId);
    playSoundEffect('wrong');
    handleNextCard();
  };

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word.trim() || !newWord.meaning.trim()) return;

    onAddCustomWord({
      word: newWord.word.trim(),
      ipa: newWord.ipa.trim() || `/${newWord.word.toLowerCase()}/`,
      meaning: newWord.meaning.trim(),
      partOfSpeech: newWord.partOfSpeech,
      exampleEn: newWord.exampleEn.trim() || `I practice "${newWord.word}" every day.`,
      exampleVi: newWord.exampleVi.trim() || `Tôi luyện tập từ "${newWord.word}" mỗi ngày.`,
      topicId: newWord.topicId,
      level: newWord.level,
    });

    setNewWord({
      word: '',
      ipa: '',
      meaning: '',
      partOfSpeech: 'noun',
      exampleEn: '',
      exampleVi: '',
      topicId: 'family',
      level: 'A1',
    });
    setAddModalOpen(false);
    playSoundEffect('complete');
  };

  const currentStudyWord = filteredWords[currentCardIndex];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Quicksand',sans-serif]">
            Học Từ Vựng Tiếng Anh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ghi nhớ từ vựng qua phiên âm IPA, câu ví dụ thực tế và chế độ lật thẻ Flashcard thông minh.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenStudyModal}
            disabled={filteredWords.length === 0}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md active:scale-98 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Layers className="w-4 h-4" />
            <span>Luyện Flashcard ({filteredWords.length})</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 font-semibold text-xs sm:text-sm shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm từ</span>
          </button>
        </div>
      </div>

      {/* Topics Carousel / Horizontal Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedTopicId('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
            selectedTopicId === 'all'
              ? 'bg-pink-500 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-pink-300'
          }`}
        >
          🌟 Tất cả chủ đề ({vocabularyList.length})
        </button>
        {TOPICS.map((topic) => {
          const isSelected = selectedTopicId === topic.id;
          const count = vocabularyList.filter((w) => w.topicId === topic.id).length;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
              }`}
            >
              <span>{topic.nameVi}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-purple-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-pink-100 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm từ tiếng Anh, nghĩa tiếng Việt hoặc câu ví dụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterMode('favorites')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              filterMode === 'favorites' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>Yêu thích ({userProgress.favoriteWordIds.length})</span>
          </button>
          <button
            onClick={() => setFilterMode('difficult')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              filterMode === 'difficult' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            <BookmarkCheck className="w-3 h-3 text-rose-500" />
            <span>Cần ôn lại ({userProgress.difficultWordIds.length})</span>
          </button>
        </div>

        {/* Slow Audio Toggle */}
        <button
          onClick={() => setIsSlowAudio(!isSlowAudio)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
            isSlowAudio
              ? 'bg-amber-100 border-amber-300 text-amber-800'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          title="Bật/tắt chế độ phát âm chậm cho người mới bắt đầu"
        >
          <span>Tốc độ: {isSlowAudio ? '🐢 0.75x' : '🐇 Chuẩn'}</span>
        </button>
      </div>

      {/* Vocabulary Cards Grid */}
      {filteredWords.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 mx-auto flex items-center justify-center text-2xl">
            🐰
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy từ vựng nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy thử tìm bằng từ khóa khác hoặc chuyển sang chủ đề khác để tiếp tục học nhé!
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTopicId('all');
              setFilterMode('all');
            }}
            className="px-4 py-2 rounded-xl bg-pink-100 text-pink-700 text-xs font-bold hover:bg-pink-200 transition-colors cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((item) => {
            const isFav = userProgress.favoriteWordIds.includes(item.id);
            const isDiff = userProgress.difficultWordIds.includes(item.id);
            const topicInfo = TOPICS.find((t) => t.id === item.topicId);

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-pink-100 hover:border-pink-300 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3 group"
              >
                {/* Card Top: Topic tag, level & actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-pink-600">{topicInfo?.nameVi || 'Chung'}</span>
                    <span>·</span>
                    <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700">
                      {item.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onToggleFavorite(item.id);
                        playSoundEffect('star');
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFav ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                      title="Yêu thích"
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        onToggleDifficult(item.id);
                        playSoundEffect('click');
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDiff ? 'bg-rose-100 text-rose-600' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'
                      }`}
                      title="Cần ôn lại"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Word & IPA */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-pink-600 transition-colors">
                      {item.word}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeak(item.word, isSlowAudio)}
                        className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 transition-colors cursor-pointer shadow-2xs"
                        title="Nghe phát âm chuẩn"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-pink-600">{item.ipa}</span>
                    <span className="text-[10px] font-semibold text-slate-400 italic">({item.partOfSpeech})</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 pt-0.5">{item.meaning}</p>
                </div>

                {/* Example sentence */}
                <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1 text-xs">
                  <p className="text-slate-700 italic font-medium leading-relaxed">&ldquo;{item.exampleEn}&rdquo;</p>
                  <p className="text-slate-500 text-[11px]">{item.exampleVi}</p>
                </div>

                {/* Footer action */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => handleSpeak(item.exampleEn, isSlowAudio)}
                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" /> Nghe ví dụ
                  </button>

                  <button
                    onClick={() => {
                      onMarkWordLearned(item.id);
                      playSoundEffect('correct');
                    }}
                    className="text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Đã nhớ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Flashcard Study Modal */}
      {studyModalOpen && currentStudyWord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 space-y-6 relative animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2.5 py-1 rounded-lg">
                  Thẻ {currentCardIndex + 1} / {filteredWords.length}
                </span>
                <span className="text-xs text-slate-400">Chạm thẻ để lật mặt sau</span>
              </div>
              <button
                onClick={() => setStudyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[260px] sm:min-h-[280px] rounded-3xl p-6 sm:p-8 border-2 border-pink-200/80 bg-gradient-to-br from-pink-50/70 via-purple-50/50 to-white flex flex-col justify-between cursor-pointer select-none shadow-sm hover:border-pink-300 transition-all text-center"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="uppercase tracking-wider font-bold">
                  {isFlipped ? 'Mặt sau: Nghĩa tiếng Việt' : 'Mặt trước: Từ vựng'}
                </span>
                <RotateCw className="w-4 h-4 text-pink-500" />
              </div>

              {!isFlipped ? (
                <div className="my-auto space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {currentStudyWord.word}
                  </h2>
                  <div className="text-sm font-mono text-pink-600 font-semibold">{currentStudyWord.ipa}</div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                    {currentStudyWord.partOfSpeech} · {currentStudyWord.level}
                  </span>
                </div>
              ) : (
                <div className="my-auto space-y-4">
                  <div className="text-2xl font-black text-pink-600">{currentStudyWord.meaning}</div>
                  <div className="p-4 rounded-2xl bg-white/90 border border-pink-100 space-y-1 text-left">
                    <p className="text-sm text-slate-800 italic">&ldquo;{currentStudyWord.exampleEn}&rdquo;</p>
                    <p className="text-xs text-slate-500">{currentStudyWord.exampleVi}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentStudyWord.word, isSlowAudio);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Nghe phát âm
                </button>
              </div>
            </div>

            {/* Flip Decision Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCardReviewAgain(currentStudyWord.id)}
                className="py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Cần ôn lại</span>
              </button>

              <button
                onClick={() => handleCardMastered(currentStudyWord.id)}
                className="py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Đã nhớ rõ</span>
              </button>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <button
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
                className="flex items-center gap-1 font-semibold hover:text-slate-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Từ trước
              </button>

              <span className="tabular-nums font-bold text-slate-700">
                {currentCardIndex + 1} / {filteredWords.length}
              </span>

              <button
                onClick={handleNextCard}
                disabled={currentCardIndex === filteredWords.length - 1}
                className="flex items-center gap-1 font-semibold hover:text-slate-800 disabled:opacity-30 cursor-pointer"
              >
                Từ tiếp <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Word Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-pink-100 space-y-4 relative animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Thêm từ mới vào sổ tay</h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWord} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Từ tiếng Anh *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: blossom, cheerful..."
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phiên âm IPA</label>
                  <input
                    type="text"
                    placeholder="/ˈblɒs.əm/"
                    value={newWord.ipa}
                    onChange={(e) => setNewWord({ ...newWord, ipa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Từ loại</label>
                  <select
                    value={newWord.partOfSpeech}
                    onChange={(e) => setNewWord({ ...newWord, partOfSpeech: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400"
                  >
                    <option value="noun">Danh từ (n)</option>
                    <option value="verb">Động từ (v)</option>
                    <option value="adjective">Tính từ (adj)</option>
                    <option value="adverb">Trạng từ (adv)</option>
                    <option value="phrase">Cụm từ (phr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nghĩa tiếng Việt *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: hoa nở rộ, tươi vui..."
                  value={newWord.meaning}
                  onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Câu ví dụ tiếng Anh</label>
                <input
                  type="text"
                  placeholder="Cherry trees blossom in spring."
                  value={newWord.exampleEn}
                  onChange={(e) => setNewWord({ ...newWord, exampleEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dịch nghĩa câu ví dụ</label>
                <input
                  type="text"
                  placeholder="Hoa anh đào nở rộ vào mùa xuân."
                  value={newWord.exampleVi}
                  onChange={(e) => setNewWord({ ...newWord, exampleVi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chủ đề</label>
                  <select
                    value={newWord.topicId}
                    onChange={(e) => setNewWord({ ...newWord, topicId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400"
                  >
                    {TOPICS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameVi}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cấp độ</label>
                  <select
                    value={newWord.level}
                    onChange={(e) => setNewWord({ ...newWord, level: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400"
                  >
                    <option value="A1">A1 - Khởi đầu</option>
                    <option value="A2">A2 - Cơ bản</option>
                    <option value="B1">B1 - Trung cấp</option>
                    <option value="B2">B2 - Nâng cao</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-xs cursor-pointer"
                >
                  Lưu từ vựng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
