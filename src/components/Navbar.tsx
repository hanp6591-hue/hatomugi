import React from 'react';
import { Home, BookOpen, Gamepad2, BarChart3, User, Flame, Award, Volume2, VolumeX } from 'lucide-react';
import { UserProfile, UserProgress } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'lessons' | 'games' | 'progress' | 'profile';
  setActiveTab: (tab: 'home' | 'lessons' | 'games' | 'progress' | 'profile') => void;
  userProgress: UserProgress;
  userProfile: UserProfile;
  toggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProgress,
  userProfile,
  toggleSound,
}) => {
  const mascotImg = '/src/assets/images/hatomugi_mascot_logo_1793198376760.jpg';

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'lessons', label: 'Bài học', icon: BookOpen },
    { id: 'games', label: 'Luyện tập', icon: Gamepad2 },
    { id: 'progress', label: 'Tiến độ', icon: BarChart3 },
    { id: 'profile', label: 'Cá nhân', icon: User },
  ] as const;

  return (
    <>
      {/* Desktop & Tablet Top Bar (Adheres to 3-zone contract) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Single Brand element */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-pink-400 rounded-lg shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-200 via-purple-100 to-pink-100 p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={mascotImg}
                alt="Hatomugi mascot"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent font-['Quicksand',sans-serif]">
                Hatomugi
              </span>
              <span className="text-[11px] text-pink-500 font-medium tracking-tight -mt-0.5 hidden sm:inline">
                Learn English Every Day
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-pink-100/90 text-pink-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-pink-600 stroke-[2.5]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action / Stats Cluster */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200/60 rounded-xl text-orange-600 text-xs font-bold shadow-2xs"
              title={`Bạn đã học liên tiếp ${userProgress.streak} ngày!`}
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-400 animate-bounce" />
              <span>{userProgress.streak} ngày</span>
            </div>

            {/* Total Points */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200/60 rounded-xl text-purple-700 text-xs font-bold shadow-2xs">
              <Award className="w-4 h-4 text-purple-500" />
              <span>{userProgress.totalPoints} XP</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-600 hover:text-pink-700 transition-colors cursor-pointer"
              title={userProfile.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              aria-label="Toggle Sound"
            >
              {userProfile.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Fixed, ergonomic touch targets >= 44px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-pink-100 pb-safe shadow-lg">
        <div className="grid grid-cols-5 h-16 items-center px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
                  isActive ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-pink-100 text-pink-600 -translate-y-0.5' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
