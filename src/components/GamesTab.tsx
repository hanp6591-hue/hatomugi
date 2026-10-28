import React, { useState, useEffect, useMemo } from 'react';
import {
  Gamepad2,
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Heart,
  Volume2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VocabularyWord, UserProfile, UserProgress } from '../types';
import { playSoundEffect, speakEnglish } from '../utils/speech';

interface GamesTabProps {
  vocabularyList: VocabularyWord[];
  userProfile: UserProfile;
  userProgress: UserProgress;
  onRecordGameWin: (points: number) => void;
}

type GameMode = 'match' | 'speed' | 'spell' | 'sentence';

export const GamesTab: React.FC<GamesTabProps> = ({
  vocabularyList,
  userProfile,
  userProgress,
  onRecordGameWin,
}) => {
  const [activeGame, setActiveGame] = useState<GameMode>('match');

  // ---------- 1. MATCHING GAME STATE ----------
  const [matchSelectedEn, setMatchSelectedEn] = useState<string | null>(null);
  const [matchSelectedVi, setMatchSelectedVi] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState(0);
  const [matchGameOver, setMatchGameOver] = useState(false);

  // Generate 5 random words for matching
  const matchingWords = useMemo(() => {
    const shuffled = [...vocabularyList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }, [vocabularyList, activeGame, matchGameOver]);

  const shuffledEnWords = useMemo(() => {
    return [...matchingWords].sort(() => 0.5 - Math.random());
  }, [matchingWords]);

  const shuffledViWords = useMemo(() => {
    return [...matchingWords].sort(() => 0.5 - Math.random());
  }, [matchingWords]);

  const handleMatchSelect = (type: 'en' | 'vi', id: string, text: string) => {
    playSoundEffect('click');
    if (type === 'en') {
      speakEnglish(text, { rate: userProfile.speechRate, lang: userProfile.speechAccent });
      setMatchSelectedEn(id);
      if (matchSelectedVi) {
        checkMatchingPair(id, matchSelectedVi);
      }
    } else {
      setMatchSelectedVi(id);
      if (matchSelectedEn) {
        checkMatchingPair(matchSelectedEn, id);
      }
    }
  };

  const checkMatchingPair = (enId: string, viId: string) => {
    if (enId === viId) {
      // Correct match
      playSoundEffect('correct');
      const newMatched = [...matchedIds, enId];
      setMatchedIds(newMatched);
      setMatchScore((prev) => prev + 20);
      setMatchSelectedEn(null);
      setMatchSelectedVi(null);

      if (newMatched.length === matchingWords.length) {
        setMatchGameOver(true);
        onRecordGameWin(100);
        playSoundEffect('complete');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      // Wrong match
      playSoundEffect('wrong');
      setTimeout(() => {
        setMatchSelectedEn(null);
        setMatchSelectedVi(null);
      }, 500);
    }
  };

  const resetMatchGame = () => {
    setMatchedIds([]);
    setMatchScore(0);
    setMatchSelectedEn(null);
    setMatchSelectedVi(null);
    setMatchGameOver(false);
  };

  // ---------- 2. SPEED QUIZ STATE ----------
  const [speedIndex, setSpeedIndex] = useState(0);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedLives, setSpeedLives] = useState(3);
  const [speedTimer, setSpeedTimer] = useState(15);
  const [speedGameOver, setSpeedGameOver] = useState(false);
  const [speedFeedback, setSpeedFeedback] = useState<'correct' | 'wrong' | null>(null);

  const speedQuizWords = useMemo(() => {
    return [...vocabularyList].sort(() => 0.5 - Math.random()).slice(0, 8);
  }, [vocabularyList, activeGame]);

  const currentSpeedWord = speedQuizWords[speedIndex];

  // Options for current speed question
  const speedOptions = useMemo(() => {
    if (!currentSpeedWord) return [];
    const others = vocabularyList
      .filter((w) => w.id !== currentSpeedWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((w) => w.meaning);
    return [...others, currentSpeedWord.meaning].sort(() => 0.5 - Math.random());
  }, [currentSpeedWord, vocabularyList]);

  // Speed timer tick
  useEffect(() => {
    if (activeGame !== 'speed' || speedGameOver) return;
    if (speedTimer <= 0) {
      handleSpeedWrong();
      return;
    }

    const timer = setInterval(() => {
      setSpeedTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeGame, speedTimer, speedGameOver]);

  const handleSpeedAnswer = (selectedMeaning: string) => {
    if (speedGameOver || speedFeedback) return;

    if (selectedMeaning === currentSpeedWord.meaning) {
      playSoundEffect('correct');
      setSpeedFeedback('correct');
      setSpeedScore((s) => s + 20 + speedTimer);

      setTimeout(() => {
        setSpeedFeedback(null);
        if (speedIndex < speedQuizWords.length - 1) {
          setSpeedIndex((i) => i + 1);
          setSpeedTimer(15);
        } else {
          setSpeedGameOver(true);
          onRecordGameWin(120);
          playSoundEffect('complete');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      }, 700);
    } else {
      handleSpeedWrong();
    }
  };

  const handleSpeedWrong = () => {
    playSoundEffect('wrong');
    setSpeedFeedback('wrong');
    const newLives = speedLives - 1;
    setSpeedLives(newLives);

    setTimeout(() => {
      setSpeedFeedback(null);
      if (newLives <= 0 || speedIndex >= speedQuizWords.length - 1) {
        setSpeedGameOver(true);
      } else {
        setSpeedIndex((i) => i + 1);
        setSpeedTimer(15);
      }
    }, 700);
  };

  const resetSpeedGame = () => {
    setSpeedIndex(0);
    setSpeedScore(0);
    setSpeedLives(3);
    setSpeedTimer(15);
    setSpeedGameOver(false);
    setSpeedFeedback(null);
  };

  // ---------- 3. SPELLING BEE / MISSING LETTERS ----------
  const [spellIndex, setSpellIndex] = useState(0);
  const [spelledLetters, setSpelledLetters] = useState<string[]>([]);
  const [spellScore, setSpellScore] = useState(0);
  const [spellGameOver, setSpellGameOver] = useState(false);

  const spellingWords = useMemo(() => {
    return [...vocabularyList].filter((w) => w.word.length >= 4 && w.word.length <= 8).slice(0, 5);
  }, [vocabularyList, activeGame]);

  const currentSpellWord = spellingWords[spellIndex];

  // Scrambled letters + 2 dummy letters
  const availableLetterTiles = useMemo(() => {
    if (!currentSpellWord) return [];
    const letters = currentSpellWord.word.toUpperCase().split('');
    const extraAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const dummies = [
      extraAlphabet[Math.floor(Math.random() * 26)],
      extraAlphabet[Math.floor(Math.random() * 26)],
    ];
    return [...letters, ...dummies].sort(() => 0.5 - Math.random());
  }, [currentSpellWord]);

  const handleTileClick = (letter: string) => {
    const nextLetters = [...spelledLetters, letter];
    setSpelledLetters(nextLetters);
    playSoundEffect('click');

    const targetUpper = currentSpellWord.word.toUpperCase();
    const candidate = nextLetters.join('');

    if (candidate === targetUpper) {
      playSoundEffect('correct');
      setSpellScore((s) => s + 25);
      setTimeout(() => {
        setSpelledLetters([]);
        if (spellIndex < spellingWords.length - 1) {
          setSpellIndex((i) => i + 1);
        } else {
          setSpellGameOver(true);
          onRecordGameWin(125);
          playSoundEffect('complete');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
      }, 700);
    } else if (candidate.length >= targetUpper.length) {
      playSoundEffect('wrong');
      setTimeout(() => {
        setSpelledLetters([]);
      }, 500);
    }
  };

  const resetSpellGame = () => {
    setSpellIndex(0);
    setSpelledLetters([]);
    setSpellScore(0);
    setSpellGameOver(false);
  };

  // ---------- 4. SENTENCE BUILDER GAME ----------
  const sentenceQuestions = useMemo(
    () => [
      {
        id: 's1',
        correct: 'I love learning English every day',
        words: ['every', 'I', 'English', 'love', 'day', 'learning'],
        meaning: 'Tôi thích học tiếng Anh mỗi ngày',
      },
      {
        id: 's2',
        correct: 'We enjoy drinking iced peach tea',
        words: ['enjoy', 'peach', 'drinking', 'tea', 'We', 'iced'],
        meaning: 'Chúng tôi thích uống trà đào đá',
      },
      {
        id: 's3',
        correct: 'She always practices pronunciation with friends',
        words: ['with', 'practices', 'She', 'pronunciation', 'friends', 'always'],
        meaning: 'Cô ấy luôn luyện phát âm cùng bạn bè',
      },
    ],
    []
  );

  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [builtWords, setBuiltWords] = useState<string[]>([]);
  const [sentenceScore, setSentenceScore] = useState(0);
  const [sentenceGameOver, setSentenceGameOver] = useState(false);

  const currentSentence = sentenceQuestions[sentenceIndex];

  const handleSentenceWordClick = (word: string) => {
    const next = [...builtWords, word];
    setBuiltWords(next);
    playSoundEffect('click');

    if (next.join(' ') === currentSentence.correct) {
      playSoundEffect('correct');
      setSentenceScore((s) => s + 35);
      setTimeout(() => {
        setBuiltWords([]);
        if (sentenceIndex < sentenceQuestions.length - 1) {
          setSentenceIndex((i) => i + 1);
        } else {
          setSentenceGameOver(true);
          onRecordGameWin(105);
          playSoundEffect('complete');
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
      }, 700);
    } else if (next.length === currentSentence.words.length) {
      playSoundEffect('wrong');
      setTimeout(() => {
        setBuiltWords([]);
      }, 600);
    }
  };

  const resetSentenceGame = () => {
    setSentenceIndex(0);
    setBuiltWords([]);
    setSentenceScore(0);
    setSentenceGameOver(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Quicksand',sans-serif]">
          Trò Chơi Học Tiếng Anh
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Học mà chơi, chơi mà học! Củng cố phản xạ ghi nhớ từ vựng và cấu trúc câu qua 4 trò chơi sinh động.
        </p>
      </div>

      {/* Game Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => {
            setActiveGame('match');
            resetMatchGame();
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeGame === 'match'
              ? 'bg-pink-100/90 border-pink-300 text-pink-900 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:border-pink-200'
          }`}
        >
          <div className="text-base mb-1">🔗 Nối Từ Vựng</div>
          <span className="text-[11px] text-slate-500 font-medium">Ghép từ Anh - Việt</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('speed');
            resetSpeedGame();
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeGame === 'speed'
              ? 'bg-purple-100/90 border-purple-300 text-purple-900 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200'
          }`}
        >
          <div className="text-base mb-1">⚡ Đoán Nghĩa Nhanh</div>
          <span className="text-[11px] text-slate-500 font-medium">15s thử thách phản xạ</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('spell');
            resetSpellGame();
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeGame === 'spell'
              ? 'bg-amber-100/90 border-amber-300 text-amber-900 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:border-amber-200'
          }`}
        >
          <div className="text-base mb-1">🐝 Điền Chữ Cái</div>
          <span className="text-[11px] text-slate-500 font-medium">Ghi nhớ chính tả từ</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('sentence');
            resetSentenceGame();
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeGame === 'sentence'
              ? 'bg-emerald-100/90 border-emerald-300 text-emerald-900 shadow-2xs font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-200'
          }`}
        >
          <div className="text-base mb-1">🧩 Sắp Xếp Câu</div>
          <span className="text-[11px] text-slate-500 font-medium">Ghép từ thành câu chuẩn</span>
        </button>
      </div>

      {/* ==================== GAME 1: MATCHING ==================== */}
      {activeGame === 'match' && (
        <div className="bg-white rounded-3xl border border-pink-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Nối Từ Tiếng Anh Với Nghĩa Tiếng Việt</h2>
              <p className="text-xs text-slate-500">
                Chạm một thẻ tiếng Anh và một thẻ tiếng Việt tương ứng để ghép cặp hoàn chỉnh.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-xl">
                Điểm: {matchScore} XP
              </span>
              <button
                onClick={resetMatchGame}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="Chơi lại"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!matchGameOver ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {/* English column */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Tiếng Anh
                </div>
                {shuffledEnWords.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isSelected = matchSelectedEn === item.id;

                  return (
                    <button
                      key={`en-${item.id}`}
                      disabled={isMatched}
                      onClick={() => handleMatchSelect('en', item.id, item.word)}
                      className={`w-full min-h-[58px] p-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isMatched
                          ? 'opacity-30 bg-emerald-50 border-emerald-200 text-emerald-800 line-through cursor-default'
                          : isSelected
                          ? 'bg-pink-500 text-white border-pink-500 shadow-md scale-102 ring-2 ring-pink-200'
                          : 'bg-white border-slate-200 hover:border-pink-300 text-slate-800'
                      }`}
                    >
                      <span>{item.word}</span>
                      <Volume2 className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  );
                })}
              </div>

              {/* Vietnamese column */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                  Nghĩa Tiếng Việt
                </div>
                {shuffledViWords.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isSelected = matchSelectedVi === item.id;

                  return (
                    <button
                      key={`vi-${item.id}`}
                      disabled={isMatched}
                      onClick={() => handleMatchSelect('vi', item.id, item.meaning)}
                      className={`w-full min-h-[58px] p-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center text-center ${
                        isMatched
                          ? 'opacity-30 bg-emerald-50 border-emerald-200 text-emerald-800 line-through cursor-default'
                          : isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-102 ring-2 ring-purple-200'
                          : 'bg-white border-slate-200 hover:border-purple-300 text-slate-800'
                      }`}
                    >
                      <span>{item.meaning}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-pink-100 text-pink-600 mx-auto flex items-center justify-center text-3xl">
                🎉
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-['Quicksand',sans-serif]">
                Tuyệt Vời! Bạn Đã Ghép Đúng Tất Cả!
              </h3>
              <p className="text-sm text-slate-600">
                Bạn đã nhận được <span className="font-bold text-pink-600">+100 XP</span> vào điểm tích lũy.
              </p>
              <button
                onClick={resetMatchGame}
                className="px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md cursor-pointer transition-all"
              >
                Chơi tiếp ván mới
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME 2: SPEED QUIZ ==================== */}
      {activeGame === 'speed' && currentSpeedWord && (
        <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 ${
                      i < speedLives ? 'text-rose-500 fill-rose-500' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">· Câu {speedIndex + 1}/{speedQuizWords.length}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span className="tabular-nums">{speedTimer}s</span>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-xl">
                {speedScore} XP
              </span>
            </div>
          </div>

          {!speedGameOver ? (
            <div className="space-y-6">
              {/* Question Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/80 text-center space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Từ này có nghĩa tiếng Việt là gì?
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {currentSpeedWord.word}
                </h3>
                <div className="text-xs font-mono text-slate-500">{currentSpeedWord.ipa}</div>
              </div>

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {speedOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={!!speedFeedback}
                    onClick={() => handleSpeedAnswer(opt)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-sm font-bold text-slate-800 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center text-3xl">
                🏆
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-['Quicksand',sans-serif]">
                Hoàn Thành Đoán Nghĩa Nhanh!
              </h3>
              <p className="text-sm text-slate-600">
                Tổng điểm đạt được: <span className="font-bold text-purple-600">{speedScore} XP</span>
              </p>
              <button
                onClick={resetSpeedGame}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md cursor-pointer transition-all"
              >
                Thử thách lại
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME 3: SPELLING BEE ==================== */}
      {activeGame === 'spell' && currentSpellWord && (
        <div className="bg-white rounded-3xl border border-amber-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Điền Chữ Cái & Chính Tả Tiếng Anh</h2>
              <p className="text-xs text-slate-500">
                Chạm vào các ô chữ cái phía dưới để ghép thành từ tiếng Anh đúng chính tả.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl">
              Điểm: {spellScore} XP
            </span>
          </div>

          {!spellGameOver ? (
            <div className="space-y-6">
              {/* Target Clue */}
              <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200/80 text-center space-y-2">
                <span className="text-xs font-bold uppercase text-amber-700">Nghĩa tiếng Việt:</span>
                <h3 className="text-2xl font-black text-slate-900">{currentSpellWord.meaning}</h3>
                <p className="text-xs text-slate-500 italic">&ldquo;{currentSpellWord.exampleEn}&rdquo;</p>
              </div>

              {/* Word slots */}
              <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                {currentSpellWord.word.split('').map((_, i) => {
                  const filledLetter = spelledLetters[i];
                  return (
                    <div
                      key={i}
                      className={`w-11 h-13 sm:w-13 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-xl font-black uppercase transition-all ${
                        filledLetter
                          ? 'border-amber-400 bg-amber-100/90 text-amber-900 shadow-xs'
                          : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {filledLetter || ''}
                    </div>
                  );
                })}
              </div>

              {/* Available letter tiles */}
              <div className="flex justify-center gap-2.5 flex-wrap pt-2">
                {availableLetterTiles.map((char, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => handleTileClick(char)}
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white border border-slate-300 hover:border-amber-400 hover:bg-amber-50 text-slate-800 font-bold text-lg shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {char}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setSpelledLetters([])}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Xóa làm lại từ này
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-3xl">
                🐝
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-['Quicksand',sans-serif]">
                Hoàn Thành Chính Tả Từ Vựng!
              </h3>
              <p className="text-sm text-slate-600">
                Chúc mừng bạn đã ghép đúng các từ và tích lũy <span className="font-bold text-amber-700">{spellScore} XP</span>!
              </p>
              <button
                onClick={resetSpellGame}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md cursor-pointer transition-all"
              >
                Chơi tiếp
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME 4: SENTENCE BUILDER ==================== */}
      {activeGame === 'sentence' && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sắp Xếp Từ Thành Câu Hoàn Chỉnh</h2>
              <p className="text-xs text-slate-500">
                Chạm các từ bên dưới theo đúng trật tự ngữ pháp để tạo thành câu hoàn chỉnh.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
              Điểm: {sentenceScore} XP
            </span>
          </div>

          {!sentenceGameOver ? (
            <div className="space-y-6">
              {/* Clue */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                <span className="text-xs font-bold text-emerald-800 block mb-1">Nghĩa tiếng Việt cần diễn đạt:</span>
                <p className="text-base font-bold text-slate-800">{currentSentence.meaning}</p>
              </div>

              {/* Built Sentence Preview */}
              <div className="min-h-[58px] p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-emerald-300 flex flex-wrap gap-2 items-center">
                {builtWords.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Chạm các từ phía dưới để bắt đầu ghép câu...
                  </span>
                ) : (
                  builtWords.map((w, wIdx) => (
                    <span
                      key={wIdx}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xs"
                    >
                      {w}
                    </span>
                  ))
                )}
              </div>

              {/* Scrambled word chips */}
              <div className="flex flex-wrap gap-2.5 justify-center">
                {currentSentence.words.map((w, wIdx) => {
                  const isUsed = builtWords.includes(w);
                  return (
                    <button
                      key={wIdx}
                      disabled={isUsed}
                      onClick={() => handleSentenceWordClick(w)}
                      className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                        isUsed
                          ? 'opacity-25 bg-slate-100 border-slate-200 cursor-not-allowed'
                          : 'bg-white border-slate-300 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50 active:scale-95'
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setBuiltWords([])}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Xếp lại câu này
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl">
                🎉
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-['Quicksand',sans-serif]">
                Hoàn Thành Xếp Câu Xuất Sắc!
              </h3>
              <p className="text-sm text-slate-600">
                Bạn đã nhận được <span className="font-bold text-emerald-700">{sentenceScore} XP</span>!
              </p>
              <button
                onClick={resetSentenceGame}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer transition-all"
              >
                Chơi lại từ đầu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
