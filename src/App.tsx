/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trophy, Users, User, Gamepad2, Presentation } from 'lucide-react';

// --- Shared Components ---

const BeveledButton = ({ 
  children, 
  onClick, 
  color = 'blue', 
  className = '' 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  color?: 'blue' | 'yellow' | 'light-blue',
  className?: string 
}) => {
  const colors = {
    blue: 'bg-blue-600 border-blue-400 shadow-[0_4px_0_rgb(30,58,138),0_8px_15px_rgba(0,0,0,0.4)] hover:bg-blue-500 active:shadow-none active:translate-y-1',
    yellow: 'bg-amber-400 border-amber-200 text-black shadow-[0_4px_0_rgb(180,83,9),0_8px_15px_rgba(0,0,0,0.4)] hover:bg-amber-300 active:shadow-none active:translate-y-1',
    'light-blue': 'bg-sky-400/80 border-sky-200 text-black text-xs font-bold shadow-[0_2px_0_rgb(7,89,133),0_4px_8px_rgba(0,0,0,0.3)] hover:bg-sky-300 active:shadow-none active:translate-y-0.5'
  };

  return (
    <button 
      onClick={onClick}
      className={`relative px-8 py-3 rounded-xl border-t-2 border-l-2 transition-all duration-150 font-bold tracking-wider uppercase text-white ${colors[color]} ${className}`}
    >
      {children}
    </button>
  );
};

const ClippedButton = ({ 
  children, 
  onClick, 
  color = 'yellow',
  className = '' 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  color?: 'yellow' | 'blue' | 'light-blue',
  className?: string 
}) => {
  const colors = {
    yellow: 'bg-amber-400 hover:bg-amber-300 text-black',
    blue: 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400',
    'light-blue': 'bg-sky-200/90 hover:bg-sky-100 text-blue-900 border-sky-100',
  };

  return (
    <button 
      onClick={onClick}
      className={`relative px-6 py-4 font-black text-center transition-colors duration-200 shadow-xl ${colors[color]} ${className}`}
      style={{
        clipPath: 'polygon(20% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%, 0% 20%)',
      }}
    >
      {children}
    </button>
  );
};

// --- Screen Components ---

const HomeScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <div className="flex flex-col items-center justify-start h-full pt-20 px-6 gap-12 relative z-10">
      <div className="text-right w-full absolute top-8 right-8">
        <BeveledButton color="light-blue" className="!px-3 !py-1 text-[10px]" onClick={() => console.log('Teacher Area')}>
          ÁREA DO PROFESSOR
        </BeveledButton>
      </div>

      <h1 className="text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]">
        DESAFIO EM SALA
      </h1>

      <BeveledButton 
        color="blue" 
        className="w-full max-w-xs text-3xl py-6"
        onClick={() => onNavigate('enrollment')}
      >
        INSCRIÇÃO
      </BeveledButton>

      <div className="mt-4">
        <ClippedButton 
          color="yellow" 
          className="w-48 h-24 text-xl flex items-center justify-center leading-tight uppercase"
          onClick={() => onNavigate('arena')}
        >
          Arena do <br /> Jogo
        </ClippedButton>
      </div>
    </div>
  );
};

const EnrollmentScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-start h-full pt-12 px-6 gap-10 relative z-10">
      <div className="w-full max-w-xs flex justify-center">
         <div className="bg-blue-600 border-2 border-blue-400 rounded-xl px-12 py-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_8px_15px_rgba(0,0,0,0.4)]">
            <h2 className="text-3xl font-black text-white italic tracking-widest drop-shadow-md">
              INSCRIÇÃO
            </h2>
         </div>
      </div>

      <div className="flex flex-row gap-4 w-full max-w-md justify-center items-start">
        <ClippedButton 
          color="blue" 
          className="flex-1 h-16 text-[10px] flex flex-col items-center justify-center gap-1"
          onClick={onBack}
        >
          <span className="font-black">VOLTAR</span>
          <ChevronLeft size={16} strokeWidth={4} />
        </ClippedButton>

        <ClippedButton 
          color="yellow" 
          className="flex-1 h-16 text-[10px] flex items-center justify-center font-black"
        >
          EQUIPES
        </ClippedButton>

        <ClippedButton 
          color="yellow" 
          className="flex-1 h-16 text-[10px] flex items-center justify-center font-black"
        >
          INDIVIDUAL
        </ClippedButton>
      </div>
    </div>
  );
};

const ArenaScreen = ({ onBack }: { onBack: () => void }) => {
  const games = [
    { name: 'VERDADEIRO\nOU FALSO', angle: 0 },
    { name: 'DESAFIOS', angle: 45 },
    { name: 'JOGO DAS\nCORES', angle: 90 },
    { name: 'ACERTE OU\nSAIA', angle: 135 },
    { name: '', angle: 180 },
    { name: '', angle: 225 },
    { name: '', angle: 270 },
    { name: 'QUIZ', angle: 315 },
  ];

  return (
    <div className="flex flex-col items-center justify-start h-full pt-12 px-6 overflow-hidden relative z-10">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors z-50"
      >
        <ChevronLeft size={32} />
      </button>

      <div className="relative w-80 h-80 mt-20 flex items-center justify-center">
        {/* Glow effect behind the octagon */}
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        {/* The surrounding segments */}
        {games.map((game, i) => {
          return (
            <div 
              key={i}
              className="absolute flex items-center justify-center"
              style={{ 
                transform: `rotate(${game.angle}deg) translateY(-115px)`,
              }}
            >
              <button 
                className="bg-sky-300/80 border-t-2 border-white/60 shadow-[inset_0_4px_12px_rgba(255,255,255,0.6),0_10px_20px_rgba(0,0,0,0.4)] w-32 h-20 text-[10px] font-black text-blue-900 transition-transform active:scale-95 flex items-center justify-center text-center px-4"
                style={{ 
                  clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)' 
                }}
              >
                <div className="whitespace-pre-line leading-tight">
                  {game.name}
                </div>
              </button>
            </div>
          );
        })}

        {/* Center button */}
        <div className="z-20">
          <ClippedButton 
            color="yellow" 
            className="w-44 h-24 text-lg font-black leading-tight uppercase flex items-center justify-center shadow-2xl"
          >
            Arena de <br /> Jogos
          </ClippedButton>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-black overflow-hidden selection:bg-blue-500/30">
      {/* Background Gradient Layer */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#003d7a] to-black" />
      
      <div className="max-w-md mx-auto h-screen relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full"
            >
              <HomeScreen onNavigate={setCurrentPage} />
            </motion.div>
          )}

          {currentPage === 'enrollment' && (
            <motion.div 
              key="enrollment"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <EnrollmentScreen onBack={() => setCurrentPage('home')} />
            </motion.div>
          )}

          {currentPage === 'arena' && (
            <motion.div 
              key="arena"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ArenaScreen onBack={() => setCurrentPage('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
