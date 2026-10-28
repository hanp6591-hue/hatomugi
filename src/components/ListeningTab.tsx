import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Headphones,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ListeningDialogue, UserProfile, UserProgress } from '../types';
import { LISTENING_DIALOGUES } from '../data/mockData';
import {
  speakEnglish,
  stopSpeaking,
  playSoundEffect,
  createSpeechRecognizer,
  calculatePronunciationScore,
} from '../utils/speech';

interface ListeningTabProps {
  userProfile: UserProfile;
  userProgress: UserProgress;
  onCompleteDialogue: (dialogueId: string, points: number) => void;
}

export const ListeningTab: React.FC<ListeningTabProps> = ({
  userProfile,
  userProgress,
  onCompleteDialogue,
}) => {
  const [selectedDialogue, setSelectedDialogue] = useState<ListeningDialogue>(LISTENING_DIALOGUES[0]);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [audioSpeed, setAudioSpeed] = useState<0.8 | 1.0>(1.0);

  // Quiz state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Pronunciation practice state
  const [selectedPracticeIndex, setSelectedPracticeIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedTranscript, setRecordedTranscript] = useState('');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [speechRecognizer, setSpeechRecognizer] = useState<any>(null);

  // Initialize SpeechRecognizer
  useEffect(() => {
    const recognizer = createSpeechRecognizer(
      (result) => {
        setRecordedTranscript(result.transcript);
        const target = selectedDialogue.practiceSentences[selectedPracticeIndex];
        const score = calculatePronunciationScore(target, result.transcript);
        setPronunciationScore(score);
        if (score >= 70) {
          playSoundEffect('correct');
        } else {
          playSoundEffect('wrong');
        }
      },
      (error) => {
        setMicError(`Lỗi nhận diện: ${error}. Hãy kiểm tra quyền truy cập microphone.`);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );
    setSpeechRecognizer(recognizer);

    return () => {
      stopSpeaking();
    };
  }, [selectedDialogue, selectedPracticeIndex]);

  // Clean up when selecting a new dialogue
  const handleSelectDialogue = (dialogue: ListeningDialogue) => {
    stopSpeaking();
    setIsPlayingAll(false);
    setCurrentLineIndex(null);
    setSelectedDialogue(dialogue);
    setSelectedQuizAnswers({});
    setQuizSubmitted(false);
    setSelectedPracticeIndex(0);
    setRecordedTranscript('');
    setPronunciationScore(null);
    setMicError(null);
  };

  // Play single line
  const handlePlayLine = (index: number, text: string) => {
    stopSpeaking();
    setIsPlayingAll(false);
    setCurrentLineIndex(index);
    speakEnglish(text, {
      rate: audioSpeed,
      lang: userProfile.speechAccent,
      onEnd: () => setCurrentLineIndex(null),
    });
  };

  // Play full conversation in sequence
  const handlePlayFullDialogue = () => {
    if (isPlayingAll) {
      stopSpeaking();
      setIsPlayingAll(false);
      setCurrentLineIndex(null);
      return;
    }

    setIsPlayingAll(true);
    let index = 0;

    const playNext = () => {
      if (index >= selectedDialogue.dialogue.length) {
        setIsPlayingAll(false);
        setCurrentLineIndex(null);
        return;
      }

      setCurrentLineIndex(index);
      const line = selectedDialogue.dialogue[index];
      speakEnglish(line.en, {
        rate: audioSpeed,
        pitch: line.role === 'A' ? 1.05 : 0.95,
        lang: userProfile.speechAccent,
        onEnd: () => {
          index++;
          setTimeout(playNext, 600);
        },
      });
    };

    playNext();
  };

  // Microphone recording trigger
  const handleToggleRecording = () => {
    setMicError(null);
    if (!speechRecognizer) {
      setMicError('Trình duyệt hiện tại chưa hỗ trợ Web Speech API nhận diện giọng nói trực tiếp.');
      return;
    }

    if (isRecording) {
      try {
        speechRecognizer.stop();
      } catch {}
      setIsRecording(false);
    } else {
      setRecordedTranscript('');
      setPronunciationScore(null);
      try {
        speechRecognizer.start();
        setIsRecording(true);
      } catch (err) {
        setMicError('Không thể kích hoạt microphone. Vui lòng cấp quyền micro cho trang web.');
        setIsRecording(false);
      }
    }
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    selectedDialogue.quiz.forEach((q, idx) => {
      if (selectedQuizAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const points = correctCount * 30 + 40;
    onCompleteDialogue(selectedDialogue.id, points);

    if (correctCount === selectedDialogue.quiz.length) {
      playSoundEffect('complete');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      playSoundEffect('correct');
    }
  };

  const currentPracticeSentence = selectedDialogue.practiceSentences[selectedPracticeIndex];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Quicksand',sans-serif]">
          Luyện Nghe & Phát Âm Tiếng Anh
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Hội thoại song ngữ thực tế, nghe giọng bản xứ với tốc độ tùy chỉnh và luyện phát âm có chấm điểm micro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dialogue List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Chọn đoạn hội thoại
          </div>

          <div className="space-y-2">
            {LISTENING_DIALOGUES.map((item) => {
              const isSelected = selectedDialogue.id === item.id;
              const isCompleted = userProgress.completedDialogueIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectDialogue(item)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-300 shadow-xs ring-1 ring-blue-200'
                      : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">
                        {item.level}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{item.topic}</span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Đã hoàn thành
                        </span>
                      )}
                    </div>
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                      {item.titleVi}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Audio Player & Chat Bubbles */}
        <div className="lg:col-span-8 space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{selectedDialogue.titleVi}</h2>
              <div className="text-xs text-slate-500">{selectedDialogue.description}</div>
            </div>

            <div className="flex items-center gap-2">
              {/* Play All Button */}
              <button
                onClick={handlePlayFullDialogue}
                className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                  isPlayingAll
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                }`}
              >
                {isPlayingAll ? (
                  <>
                    <Pause className="w-4 h-4" /> Tạm dừng
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Nghe toàn bộ
                  </>
                )}
              </button>

              {/* Toggle Translation */}
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showTranslation
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
                title="Bật/tắt bản dịch tiếng Việt"
              >
                {showTranslation ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">Dịch</span>
              </button>

              {/* Speed Switch */}
              <button
                onClick={() => setAudioSpeed(audioSpeed === 1.0 ? 0.8 : 1.0)}
                className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {audioSpeed === 1.0 ? '1.0x' : '0.8x Chậm'}
              </button>
            </div>
          </div>

          {/* Dialogue Conversation Chat Area */}
          <div className="p-6 rounded-3xl bg-slate-50/60 border border-slate-200/80 space-y-4 max-h-[460px] overflow-y-auto">
            {selectedDialogue.dialogue.map((turn, idx) => {
              const isSpeakerA = turn.role === 'A';
              const isCurrentlyPlaying = currentLineIndex === idx;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 transition-all ${
                    isSpeakerA ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Speaker Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-lg shrink-0">
                    {turn.avatar}
                  </div>

                  {/* Speech Bubble */}
                  <div
                    className={`max-w-[82%] sm:max-w-[75%] p-4 rounded-2xl transition-all ${
                      isCurrentlyPlaying
                        ? 'ring-2 ring-blue-400 shadow-md scale-101'
                        : 'shadow-2xs'
                    } ${
                      isSpeakerA
                        ? 'bg-white text-slate-900 border border-pink-100 rounded-tl-xs'
                        : 'bg-blue-600 text-white rounded-tr-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span
                        className={`text-[11px] font-bold ${
                          isSpeakerA ? 'text-pink-600' : 'text-blue-100'
                        }`}
                      >
                        {turn.speaker}
                      </span>

                      <button
                        onClick={() => handlePlayLine(idx, turn.en)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          isSpeakerA
                            ? 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                            : 'text-blue-200 hover:text-white hover:bg-blue-500'
                        }`}
                        title="Nghe câu này"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className={`text-sm font-semibold leading-relaxed ${isSpeakerA ? 'text-slate-800' : 'text-white'}`}>
                      {turn.en}
                    </p>

                    {showTranslation && (
                      <p
                        className={`text-xs mt-1.5 pt-1.5 border-t leading-relaxed ${
                          isSpeakerA
                            ? 'border-slate-100 text-slate-500'
                            : 'border-blue-500/50 text-blue-100'
                        }`}
                      >
                        {turn.vi}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pronunciation Practice Section (Microphone) */}
          <div className="bg-gradient-to-br from-pink-50/60 via-purple-50/50 to-white rounded-3xl border border-pink-200/70 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Luyện Phát Âm Trực Tiếp Qua Micro
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hãy lắng nghe mẫu, nhấn Micro để nói và nhận điểm chính xác tức thì!
                  </p>
                </div>
              </div>

              {/* Selector for practice sentences */}
              <div className="flex items-center gap-1">
                {selectedDialogue.practiceSentences.map((_, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      setSelectedPracticeIndex(pIdx);
                      setRecordedTranscript('');
                      setPronunciationScore(null);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedPracticeIndex === pIdx
                        ? 'bg-pink-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-pink-50'
                    }`}
                  >
                    {pIdx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Sentence Card */}
            <div className="p-4 rounded-2xl bg-white border border-pink-100 space-y-2">
              <div className="text-xs font-semibold text-slate-400">Câu cần luyện phát âm:</div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-base sm:text-lg font-bold text-slate-800">
                  &ldquo;{currentPracticeSentence}&rdquo;
                </span>
                <button
                  onClick={() => speakEnglish(currentPracticeSentence, { rate: audioSpeed, lang: userProfile.speechAccent })}
                  className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 shrink-0 cursor-pointer"
                  title="Nghe phát âm mẫu"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Recording Action Button & Feedback */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleToggleRecording}
                className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-95'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" /> Đang lắng nghe... (Nhấn để dừng)
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" /> Nhấn để ghi âm phát âm
                  </>
                )}
              </button>

              {/* Pronunciation score indicator */}
              {pronunciationScore !== null && (
                <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div
                    className={`text-lg font-black tabular-nums ${
                      pronunciationScore >= 80
                        ? 'text-emerald-600'
                        : pronunciationScore >= 60
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {pronunciationScore}%
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">
                      {pronunciationScore >= 80
                        ? '🌟 Xuất sắc, chuẩn giọng!'
                        : pronunciationScore >= 60
                        ? '👍 Tương đối tốt, cố gắng thêm nhé!'
                        : '💪 Hãy nghe lại và thử phát âm to rõ hơn!'}
                    </div>
                    {recordedTranscript && (
                      <div className="text-slate-500 italic mt-0.5">&ldquo;{recordedTranscript}&rdquo;</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {micError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {micError}
              </div>
            )}
          </div>

          {/* Listening Comprehension Quiz */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Kiểm Tra Đọc Hiểu Hội Thoại ({selectedDialogue.quiz.length} câu)</span>
            </h3>

            <div className="space-y-4">
              {selectedDialogue.quiz.map((q, qIdx) => {
                const userChoice = selectedQuizAnswers[qIdx];
                const isCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={qIdx}
                    className={`p-4 rounded-2xl border ${
                      quizSubmitted
                        ? isCorrect
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-rose-50/50 border-rose-200'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold text-slate-800 mb-2.5">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userChoice === optIdx;

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => {
                              setSelectedQuizAnswers({ ...selectedQuizAnswers, [qIdx]: optIdx });
                              playSoundEffect('click');
                            }}
                            className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-0.5">
                        <div className="font-bold text-slate-700">Giải thích:</div>
                        <p className="text-slate-600">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedQuizAnswers).length < selectedDialogue.quiz.length}
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Nộp bài kiểm tra nghe
                </button>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">
                  ✓ Đã chấm điểm và ghi nhận tiến độ nghe hiểu!
                </span>
                <button
                  onClick={() => {
                    setSelectedQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Làm lại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
