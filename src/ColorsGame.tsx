import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, increment, serverTimestamp, collection, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { motion, AnimatePresence } from 'motion/react';

interface ColorsGameProps {
  sessionId: string;
  nickname: string;
  onGameOver: () => void;
}

export const ColorsGame = ({ sessionId, nickname, onGameOver }: ColorsGameProps) => {
  const [forbiddenColor, setForbiddenColor] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lastRoundId, setLastRoundId] = useState<string | null>(null);
  const [hasAnsweredThisRound, setHasAnsweredThisRound] = useState(false);

  const colors = [
    { id: 'red', hex: '#ef4444', name: 'Vermelho', angle: 0 },
    { id: 'blue', hex: '#3b82f6', name: 'Azul', angle: 60 },
    { id: 'yellow', hex: '#fbbf24', name: 'Amarelo', angle: 120 },
    { id: 'green', hex: '#22c55e', name: 'Verde', angle: 180 },
    { id: 'orange', hex: '#f97316', name: 'Laranja', angle: 240 },
    { id: 'purple', hex: '#a855f7', name: 'Roxo', angle: 300 },
  ];

  useEffect(() => {
    if (!sessionId) return;
    
    // Listen to session for the forbidden color updated by teacher
    const unsub = onSnapshot(doc(db, 'sessions', sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newForbidden = data.forbiddenColor || null;
        const roundId = data.roundId || null;

        if (roundId !== lastRoundId) {
          setForbiddenColor(newForbidden);
          setLastRoundId(roundId);
          setHasAnsweredThisRound(false);
        }
      }
    });

    return () => unsub();
  }, [sessionId, lastRoundId]);

  const handleColorClick = async (colorId: string) => {
    if (hasAnsweredThisRound || !lastRoundId) return;

    setHasAnsweredThisRound(true);
    const isCorrect = colorId !== forbiddenColor;

    if (isCorrect) {
      setScore(prev => prev + 5);
      
      // Update player score and record response time for "fastest 10" logic
      const playerId = `${nickname}-${sessionId}`; // Simplified player ID
      const playerRef = doc(db, `sessions/${sessionId}/players`, playerId);
      
      try {
        await setDoc(playerRef, {
          nickname,
          score: increment(5),
          lastResponseTime: serverTimestamp(),
          lastRoundId: lastRoundId,
          joinedAt: serverTimestamp() // Fallback if not exists
        }, { merge: true });
      } catch (err) {
        console.error("Error updating score:", err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-10 relative z-10">
      <div className="text-center">
        <h2 className="text-sm font-black text-sky-400 tracking-[0.3em] uppercase mb-1">Jogo das Cores</h2>
        <div className="bg-white/10 rounded-full px-6 py-2 border border-white/20 inline-block">
          <span className="text-2xl font-black text-white">{score} <span className="text-xs text-sky-300">PTS</span></span>
        </div>
      </div>

      {/* Circular Color Picker */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-[12px] border-gray-900 shadow-2xl" />
        
        {/* Color Segments */}
        <div className="absolute inset-4 rounded-full overflow-hidden bg-gray-900">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => handleColorClick(color.id)}
              disabled={hasAnsweredThisRound}
              className="absolute top-0 left-0 w-full h-full origin-center transition-all active:brightness-125 disabled:opacity-80"
              style={{
                backgroundColor: color.hex,
                transform: `rotate(${color.angle}deg)`,
                clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 40%)',
              }}
            />
          ))}
          {/* Central Cap */}
          <div className="absolute inset-[30%] bg-gray-900 rounded-full border-4 border-gray-800 shadow-inner flex items-center justify-center">
             <div className="w-4 h-4 rounded-full bg-white/5" />
          </div>
        </div>
      </div>

      <div className="text-center max-w-xs">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">
          {hasAnsweredThisRound 
            ? "Aguarde o comando do professor..." 
            : "Ouça o comando do professor e clique na cor correta!"}
        </p>
      </div>

      {/* Correct/Wrong Overlay */}
      <AnimatePresence>
        {hasAnsweredThisRound && (
           <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
           >
             <div className="bg-black/60 backdrop-blur-md rounded-full px-8 py-4 border-2 border-white/20 shadow-2xl">
                <span className="text-xl font-black text-white italic tracking-tighter">PREPARAR...</span>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
