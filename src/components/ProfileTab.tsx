import React, { useState } from 'react';
import {
  User,
  Sliders,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  Check,
  RotateCcw,
  Shield,
  Smile,
  Heart,
  Save,
} from 'lucide-react';
import { UserProfile, EnglishLevel } from '../types';
import { playSoundEffect } from '../utils/speech';

interface ProfileTabProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetAllProgress: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userProfile,
  onUpdateProfile,
  onResetAllProgress,
}) => {
  const mascotImg = '/src/assets/images/hatomugi_mascot_logo_1793198376760.jpg';

  const [name, setName] = useState(userProfile.name);
  const [level, setLevel] = useState<EnglishLevel>(userProfile.level);
  const [dailyGoal, setDailyGoal] = useState<number>(userProfile.dailyGoal);
  const [soundEnabled, setSoundEnabled] = useState(userProfile.soundEnabled);
  const [speechRate, setSpeechRate] = useState(userProfile.speechRate);
  const [speechAccent, setSpeechAccent] = useState<'en-US' | 'en-GB'>(userProfile.speechAccent);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);
  const [isSaved, setIsSaved] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const avatars = [
    { id: 'bunny', label: 'Thỏ Mugi', emoji: '🐰' },
    { id: 'cat', label: 'Mèo Con', emoji: '🐱' },
    { id: 'bear', label: 'Gấu Nhỏ', emoji: '🐻' },
    { id: 'sprout', label: 'Mầm Xanh', emoji: '🌱' },
    { id: 'star', label: 'Ngôi Sao', emoji: '⭐' },
    { id: 'sparkle', label: 'Ánh Sáng', emoji: '✨' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || 'Bạn Nhỏ Hatomugi',
      level,
      dailyGoal,
      soundEnabled,
      speechRate,
      speechAccent,
      avatar: selectedAvatar,
    });
    playSoundEffect('correct');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Quicksand',sans-serif]">
          Hồ Sơ Cá Nhân & Cài Đặt
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Tùy chỉnh thông tin người học, mục tiêu hằng ngày và tốc độ phát âm phù hợp với trình độ của bạn.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 rounded-3xl overflow-hidden bg-gradient-to-tr from-pink-200 to-purple-200 p-0.5 border-2 border-pink-200 shadow-sm shrink-0">
              {selectedAvatar === 'bunny' ? (
                <img
                  src={mascotImg}
                  alt="Avatar mascot"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-white flex items-center justify-center text-4xl">
                  {avatars.find((a) => a.id === selectedAvatar)?.emoji || '🐰'}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-bold text-pink-600 uppercase tracking-wider">Học viên Hatomugi</div>
              <h2 className="text-xl font-bold text-slate-900">{name || 'Bạn nhỏ'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-full">
                  Cấp độ {level}
                </span>
                <span className="text-xs text-slate-500">· Mục tiêu: {dailyGoal} từ/ngày</span>
              </div>
            </div>
          </div>

          {/* Avatar Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Chọn hình đại diện yêu thích:</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {avatars.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    selectedAvatar === av.id
                      ? 'bg-pink-100/80 border-pink-400 shadow-xs ring-2 ring-pink-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-pink-50'
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-700">{av.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields: Name & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên hiển thị của bạn</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Trình độ tiếng Anh hiện tại</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as EnglishLevel)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-pink-400 focus:bg-white"
              >
                <option value="A1">A1 - Khởi đầu (Mới làm quen từ vựng)</option>
                <option value="A2">A2 - Sơ cấp (Giao tiếp câu đơn giản)</option>
                <option value="B1">B1 - Trung cấp (Tự tin diễn đạt ý kiến)</option>
                <option value="B2">B2 - Nâng cao (Lưu loát đa dạng đề tài)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daily Goal Settings */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-base">Thiết Lập Mục Tiêu Học Tập Hằng Ngày</h3>
          </div>
          <p className="text-xs text-slate-500">
            Đặt ra số từ vựng cần hoàn thành mỗi ngày để duy trì động lực và chuỗi học tập đều đặn.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[5, 10, 15, 20].map((count) => {
              const isSelected = dailyGoal === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setDailyGoal(count)}
                  className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300'
                  }`}
                >
                  <div className="text-xl font-black tabular-nums">{count}</div>
                  <div className={`text-xs ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                    từ mỗi ngày
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio & Speech Customization */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-pink-100 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-slate-900 text-base">Cài Đặt Âm Thanh & Giọng Đọc</h3>
          </div>

          <div className="space-y-4">
            {/* Sound toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-sm font-bold text-slate-800">Hiệu ứng âm thanh</div>
                <div className="text-xs text-slate-500">Âm thanh vui nhộn khi trả lời đúng và hoàn thành bài</div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                  soundEnabled ? 'bg-pink-500 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Speech Accent */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 gap-3">
              <div>
                <div className="text-sm font-bold text-slate-800">Chất giọng phát âm tiếng Anh</div>
                <div className="text-xs text-slate-500">Lựa chọn ngữ điệu phát âm mẫu phù hợp sở thích</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSpeechAccent('en-US')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    speechAccent === 'en-US'
                      ? 'bg-pink-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  🇺🇸 Tiếng Anh - Mỹ (US)
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechAccent('en-GB')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    speechAccent === 'en-GB'
                      ? 'bg-pink-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  🇬🇧 Tiếng Anh - Anh (UK)
                </button>
              </div>
            </div>

            {/* Speech Rate Slider */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">Tốc độ đọc giọng nói mẫu</div>
                  <div className="text-xs text-slate-500">Giảm tốc độ giúp người mới dễ nghe từng âm tiết</div>
                </div>
                <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2.5 py-1 rounded-lg tabular-nums">
                  {speechRate}x
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.2"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0.7x (Chậm & Rõ)</span>
                <span>1.0x (Tự nhiên)</span>
                <span>1.2x (Nhanh)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> Đã lưu các thay đổi thành công!
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Tiến độ học tập được tự động lưu trữ trên trình duyệt của bạn.
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-pink-500/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thiết lập</span>
          </button>
        </div>

        {/* Danger zone / Reset progress */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-700">Đặt lại toàn bộ tiến độ</div>
            <div className="text-[11px] text-slate-400">Khởi động lại chuỗi ngày, điểm thưởng và bài học từ đầu</div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
          >
            Đặt lại dữ liệu
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-rose-200 text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-xl">
              ⚠️
            </div>
            <h3 className="font-bold text-slate-900 text-base">Bạn có chắc muốn đặt lại dữ liệu?</h3>
            <p className="text-xs text-slate-500">
              Toàn bộ chuỗi ngày học, điểm kinh nghiệm XP và bài học đã hoàn thành sẽ được khôi phục về trạng thái ban đầu.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetAllProgress();
                  setConfirmResetOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
              >
                Đồng ý đặt lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
