/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Decimal from 'decimal.js';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  RotateCcw, 
  Info, 
  Target, 
  Settings as SettingsIcon,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  Hash,
  Activity,
  Calculator
} from 'lucide-react';
import { getClubs, getNumberInfo, formatDecimal } from './utils/number-logic';

export default function App() {
  const [number, setNumber] = useState(new Decimal(0));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'controls' | 'clubs' | 'info'>('controls');
  const [page, setPage] = useState(0);
  const [showClubs, setShowClubs] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isAutoCounting, setIsAutoCounting] = useState(false);
  const [autoCountAmount, setAutoCountAmount] = useState(new Decimal(1));
  const [isExponentialMode, setIsExponentialMode] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useCallback((node: HTMLAudioElement) => {
    if (node) {
      node.volume = 0.2;
      if (isMusicPlaying) node.play().catch(() => setIsMusicPlaying(false));
      else node.pause();
    }
  }, [isMusicPlaying]);

  // Auto-counting logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoCounting) {
      interval = setInterval(() => {
        setNumber(prev => {
          const next = prev.add(autoCountAmount);
          const limit = isExponentialMode ? new Decimal('1e3003') : new Decimal('1e12');
          if (next.abs().gt(limit)) {
            setIsAutoCounting(false);
            return prev;
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isAutoCounting, autoCountAmount]);

  // Voice synthesis
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Prefer a playful or clear voice
      const preferred = availableVoices.find(v => v.name.includes("Google") || v.name.includes("Natural") || v.lang.startsWith("en-GB"));
      setVoice(preferred || availableVoices[0]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speakNumber = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = number.isZero() ? "Zero" : formatDecimal(number);
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, [number, voice]);

  const changeNumber = (delta: number | Decimal | string) => {
    setNumber(prev => {
      const next = prev.add(delta);
      const limit = isExponentialMode ? new Decimal('1e3003') : new Decimal('1e12');
      if (next.abs().gt(limit)) {
        if (!isExponentialMode) alert("Please enable EXP mode to reach higher powers!");
        return prev;
      }
      return next;
    });
  };

  const setManualNumber = () => {
    const limitStr = isExponentialMode ? "1e3003" : "1,000,000,000,000";
    const val = prompt(`Enter a number (up to ${limitStr}):`);
    if (val !== null) {
      try {
        const n = new Decimal(val.replace(/,/g, ''));
        const limit = isExponentialMode ? new Decimal('1e3003') : new Decimal('1e12');
        if (n.abs().lte(limit)) {
          setNumber(n);
        } else {
          alert(`Value exceeds the ${isExponentialMode ? 'Laboratory' : 'Standard'} limit! ${!isExponentialMode ? 'Enable EXP mode for more power.' : ''}`);
        }
      } catch (e) {
        alert("Invalid laboratory input!");
      }
    }
  };

  const customIncrement = () => {
    const val = prompt("Enter value to add/subtract (scientific notation ok):");
    if (val !== null) {
      try {
        const n = new Decimal(val.replace(/,/g, ''));
        changeNumber(n);
      } catch (e) {
        alert("Invalid laboratory input!");
      }
    }
  };

  const toggleAuto = () => {
    if (isAutoCounting) {
      setIsAutoCounting(false);
    } else {
      const val = prompt("Enter amount to count by every second:");
      if (val !== null) {
        try {
          const n = new Decimal(val.replace(/,/g, ''));
          setAutoCountAmount(n);
          setIsAutoCounting(true);
        } catch (e) {
          alert("Invalid laboratory input!");
        }
      }
    }
  };

  const clubs = useMemo(() => getClubs(number), [number]);
  const info = useMemo(() => getNumberInfo(number), [number]);

  // Pagination for buttons
  const buttonPages = [
    // Page 1: Primary Controls
    [
      { label: "+1", val: 1 }, { label: "+10", val: 10 }, { label: "+1K", val: 1000 }, { label: "AUTO", action: toggleAuto, icon: <Zap className="w-4 h-4" />, status: isAutoCounting },
      { label: "-1", val: -1 }, { label: "-10", val: -10 }, { label: "-1K", val: -1000 }, { label: "EXP", action: () => setIsExponentialMode(!isExponentialMode), icon: <Activity className="w-4 h-4" />, status: isExponentialMode },
      { label: "x10", action: () => setNumber(prev => prev.mul(10)), icon: <TrendingUp className="w-4 h-4 text-orange-400" /> },
      { label: "RESET", action: () => { setNumber(new Decimal(0)); setIsAutoCounting(false); }, icon: <RotateCcw className="w-4 h-4" /> },
      { label: "^2", action: () => setNumber(prev => prev.pow(2)), icon: <Zap className="w-4 h-4 text-yellow-400" /> },
      { label: "MUSIC", action: () => setIsMusicPlaying(!isMusicPlaying), icon: <Volume2 className={`w-4 h-4 ${isMusicPlaying ? 'text-green-400 animate-pulse' : 'text-slate-400'}`} />, status: isMusicPlaying },
    ],
    // Page 2: Astronomical Scales
    [
      { label: "+1M", val: 1000000 }, { label: "+1B", val: 1000000000 }, { label: "+1G", val: '1e100' }, { label: "+1E", val: '1e3003' },
      { label: "-1M", val: -1000000 }, { label: "/10", action: () => setNumber(prev => prev.div(10)), icon: <TrendingDown className="w-4 h-4 text-blue-400" /> },
      { label: "SQRT", action: () => setNumber(prev => prev.sqrt()), icon: <Calculator className="w-4 h-4 text-cyan-400" /> },
      { label: "/1G", action: () => setNumber(prev => prev.div('1e100')), icon: <Activity className="w-4 h-4 text-blue-500" /> },
      { label: "x10^10", action: () => setNumber(prev => prev.mul('1e10')), icon: <Activity className="w-4 h-4 text-orange-500" /> },
      { label: "+1GP", val: '1e308' }, { label: "+1INF", val: '1e1000' }, { label: "SAY", action: speakNumber, icon: <Volume2 className="w-4 h-4" /> },
    ],
    // Page 3: Special Tools
    [
      { label: "SET", action: setManualNumber, icon: <Target className="w-4 h-4" /> },
      { label: "+X", action: customIncrement, icon: <PlusXIcon /> },
      { label: "CLUBS", action: () => setShowClubs(!showClubs), icon: <GroupsIcon />, status: showClubs },
      { label: "INFO", action: () => setShowInfo(!showInfo), icon: <Info className="w-4 h-4" />, status: showInfo },
    ]
  ];

  const nextPage = () => setPage((p) => (p + 1) % buttonPages.length);
  const prevPage = () => setPage((p) => (p - 1 + buttonPages.length) % buttonPages.length);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-hidden flex flex-col selection:bg-green-500/30">
      {/* Background Ambience */}
      <audio 
        ref={audioRef}
        src="https://assets.mixkit.co/music/preview/mixkit-ethereal-fairy-dust-645.mp3" 
        loop 
      />
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Hash className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">Number Generator</h1>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Version 1.5.0a: Popping Powers</p>
          </div>
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="group relative flex items-center justify-center w-12 h-12 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all active:scale-95 z-50 border border-slate-700/50"
        >
          <div className="space-y-1.5">
            <div className={`w-6 h-1 bg-green-400 rounded-full transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
            <div className={`w-6 h-1 bg-green-400 rounded-full transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-6 h-1 bg-green-400 rounded-full transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
          </div>
        </button>
      </header>

      {/* Main Display */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-8">
        {/* Watermark */}
        <div className="absolute bottom-6 right-6 opacity-10 pointer-events-none select-none z-0">
          <span className="text-6xl font-black italic tracking-tighter uppercase">Number Lab</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={number}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <span className={`font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-500 drop-shadow-2xl transition-all ${isExponentialMode || number.abs().gte(1e9) ? 'text-[8vw]' : 'text-[12vw]'}`}>
                {isExponentialMode ? number.toExponential(4) : formatDecimal(number)}
              </span>
              
              {/* Number decorations based on clubs */}
              {clubs.includes("Square Club") && (
                <div className="absolute -inset-4 border-2 border-green-500/30 rounded-lg animate-pulse" />
              )}
              {clubs.includes("Prime Club") && (
                <Sparkles className="absolute -top-12 -right-12 w-12 h-12 text-yellow-400 animate-bounce" />
              )}
            </div>

            {/* Club Badges */}
            <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl">
              {clubs.map((club, idx) => (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={club} 
                  className="px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-xs font-medium text-slate-300 backdrop-blur-md flex items-center gap-2"
                >
                  <div className={`w-2 h-2 rounded-full ${getClubColor(club)}`} />
                  {club}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Controls (Outside Menu for quick access) */}
        <div className="absolute bottom-12 w-full max-w-md px-8 flex items-center gap-4">
          <TrendingDown className="text-slate-500 w-5 h-5 flex-shrink-0" />
          <input 
            type="range"
            min="-9"
            max="1000000"
            step="1"
            value={number.clamp(-9, 1000000).toNumber()}
            onChange={(e) => setNumber(new Decimal(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <TrendingUp className="text-slate-500 w-5 h-5 flex-shrink-0" />
        </div>
      </main>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-4 right-4 bottom-4 w-[400px] max-w-[90vw] bg-[#1E293B] z-[101] rounded-[2.5rem] border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-8 pb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Number Lab</h2>
                <div className="text-xs font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                  PAGE {page + 1}/{buttonPages.length}
                </div>
              </div>

              {/* Menu Navigation Tabs */}
              <div className="px-8 flex gap-4 border-b border-slate-700/30">
                {['controls', 'clubs', 'info'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === tab ? 'text-green-400' : 'text-slate-500'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-green-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Dynamic Content */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {activeTab === 'controls' && (
                    <motion.div 
                      key="controls"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-4 gap-3">
                        {buttonPages[page].map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => btn.action ? btn.action() : changeNumber(btn.val!)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all active:scale-90 aspect-square ${
                              btn.status ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {btn.icon ? btn.icon : <span className="text-sm font-bold">{btn.label}</span>}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-700/30 text-xs font-bold">
                        <button onClick={prevPage} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl flex-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                          <ChevronLeft className="w-4 h-4" /> Prev
                        </button>
                        <button onClick={nextPage} className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl flex-1 flex items-center justify-center gap-2 uppercase tracking-widest">
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'clubs' && (
                    <motion.div 
                      key="clubs"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {clubs.length > 0 ? (
                        clubs.map((club) => (
                          <div key={club} className="p-5 bg-slate-800 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getClubBgColor(club)}`}>
                              {getClubIcon(club)}
                            </div>
                            <div>
                              <div className="text-sm font-bold">{club}</div>
                              <div className="text-xs text-slate-400 mt-1">{getClubDescription(club)}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-slate-500">
                          <div className="mb-4">No clubs joined yet!</div>
                          <button onClick={() => setNumber(4)} className="text-green-400 underline decoration-2 underline-offset-4 font-bold text-sm">TRY NUMBER 4</button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'info' && (
                    <motion.div 
                      key="info"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] border border-slate-700/50">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 capitalize">
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                          {info.title}
                        </h3>
                        <p className="text-slate-300 leading-relaxed text-sm antialiased italic">
                          "{info.description}"
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between p-4 bg-slate-800/50 rounded-xl text-xs uppercase tracking-wider font-bold text-slate-400">
                          <span>Value</span>
                          <span>{number.toSignificantDigits(10).toString()}</span>
                        </div>
                        <div className="flex justify-between p-4 bg-slate-800/50 rounded-xl text-xs uppercase tracking-wider font-bold text-slate-400">
                          <span>Sign</span>
                          <span>{number.isPositive() ? "Positive" : number.isNegative() ? "Negative" : "Neutral"}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-8 pt-0 border-t border-slate-700/30">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-5 bg-green-500 hover:bg-green-400 text-slate-950 font-black rounded-3xl transition-transform active:scale-95 shadow-xl shadow-green-500/20"
                >
                  RESUME LAB
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Icons and Helpers
function PlusXIcon() {
  return (
    <div className="flex items-center text-sm font-bold">
      +<span className="italic font-serif">X</span>
    </div>
  );
}

function GroupsIcon() {
  return (
    <div className="grid grid-cols-2 gap-0.5">
      <div className="w-1.5 h-1.5 bg-current rounded-full" />
      <div className="w-1.5 h-1.5 bg-current rounded-full" />
      <div className="w-1.5 h-1.5 bg-current rounded-full" />
      <div className="w-1.5 h-1.5 bg-current rounded-full" />
    </div>
  );
}

function getClubColor(club: string) {
  if (club.includes("Even")) return "bg-blue-400";
  if (club.includes("Odd")) return "bg-yellow-400";
  if (club.includes("Square")) return "bg-purple-400";
  if (club.includes("Cube")) return "bg-pink-400";
  if (club.includes("Prime")) return "bg-green-400";
  if (club.includes("Step")) return "bg-orange-400";
  if (club.includes("Lucky")) return "bg-indigo-400";
  if (club.includes("Nice")) return "bg-green-500 animate-pulse";
  if (club.includes("Infinity")) return "bg-red-500";
  if (club.includes("Googol")) return "bg-cyan-400";
  return "bg-slate-400";
}

function getClubBgColor(club: string) {
  if (club.includes("Even")) return "bg-blue-400/20 text-blue-400";
  if (club.includes("Odd")) return "bg-yellow-400/20 text-yellow-400";
  if (club.includes("Square")) return "bg-purple-400/20 text-purple-400";
  if (club.includes("Cube")) return "bg-pink-400/20 text-pink-400";
  if (club.includes("Prime")) return "bg-green-400/20 text-green-400";
  if (club.includes("Step")) return "bg-orange-400/20 text-orange-400";
  if (club.includes("Lucky")) return "bg-indigo-400/20 text-indigo-400";
  if (club.includes("Nice")) return "bg-green-500/20 text-green-400 border border-green-500/50";
  if (club.includes("Infinity")) return "bg-red-400/20 text-red-400";
  if (club.includes("Googol")) return "bg-cyan-400/20 text-cyan-400";
  return "bg-slate-400/20 text-slate-400";
}

function getClubIcon(club: string) {
  if (club.includes("Square")) return <div className="w-6 h-6 border-2 border-current rounded-sm" />;
  if (club.includes("Cube")) return <div className="w-6 h-6 border-2 border-current rounded-sm relative after:absolute after:top-[-4px] after:right-[-4px] after:w-full after:h-full after:border-2 after:border-current after:rounded-sm after:-z-10" />;
  if (club.includes("Prime")) return <Zap className="w-6 h-6" />;
  if (club.includes("Nice")) return <div className="text-xl font-black italic">69</div>;
  if (club.includes("Step")) return <div className="flex flex-col gap-0.5 items-end"><div className="w-1 h-1 bg-current" /><div className="w-2 h-1 bg-current" /><div className="w-3 h-1 bg-current" /></div>;
  return <Sparkles className="w-6 h-6" />;
}

function getClubDescription(club: string) {
  switch (club) {
    case "Even Club": return "Numbers divisible by 2. Always ready in pairs!";
    case "Odd Club": return "Always has one left out. Unique and sharp.";
    case "Square Club": return "Can be arranged into a perfect square layout.";
    case "Cube Club": return "Becomes a solid 3D cube when multiplied by itself twice.";
    case "Prime Club": return "The VIPs of math. Only 1 and the number itself are factors.";
    case "Step Squad": return "Can form a staircase-like triangle shape.";
    case "Rectangle Club": return "Composite numbers that can form many types of rectangles.";
    case "Fibonacci Club": return "Part of the nature's secret code of growth.";
    case "Lucky Club": return "Contains the lucky digit 7. You're feeling lucky!";
    case "Giant Club": return "Numbers that have reached massive proportions.";
    case "Titan Club": return "Numbers so large they challenge the imagination!";
    case "Universal Club": return "Truly astronomical. Reaching towards infinity!";
    case "Googol Club": return "The famous Googol. 1 with 100 zeros!";
    case "Googolplexian Club": return "Surpassing logical limits. Beyond 10^308.";
    case "Multiversal Club": return "Large enough to describe the states of multiple universes.";
    case "Infinity Bound": return "The Laboratory Limit. Reaching the peak of power!";
    case "Nice Club": return "Sixty-nine. A number of cultural significance and harmony.";
    case "Negative Club": return "Living below zero. Cool and collected.";
    case "Zero Club": return "Where everything starts. The identity element.";
    default: return "A special group for special numbers.";
  }
}
