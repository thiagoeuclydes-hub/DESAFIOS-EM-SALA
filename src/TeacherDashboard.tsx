import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { motion } from 'motion/react';
import { ChevronLeft, Play, Plus, BookOpen } from 'lucide-react';

interface GameTemplate {
  id: string;
  title: string;
  type: string;
}

export const TeacherDashboard = ({ 
  teacherId, 
  onBack 
}: { 
  teacherId: string, 
  onBack: () => void 
}) => {
  const [games, setGames] = useState<GameTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const q = query(collection(db, 'gameTemplates'), where('teacherId', '==', teacherId));
        const snapshot = await getDocs(q);
        const gamesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GameTemplate[];
        setGames(gamesList);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [teacherId]);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);

  useEffect(() => {
    if (!activeSessionId) return;
    const unsub = onSnapshot(doc(db, 'sessions', activeSessionId), (snap) => {
      if (snap.exists()) setActiveSession(snap.data());
    });
    return () => unsub();
  }, [activeSessionId]);

  const colors = [
    { id: 'red', hex: '#ef4444', name: 'Vermelho' },
    { id: 'blue', hex: '#3b82f6', name: 'Azul' },
    { id: 'yellow', hex: '#fbbf24', name: 'Amarelo' },
    { id: 'green', hex: '#22c55e', name: 'Verde' },
    { id: 'orange', hex: '#f97316', name: 'Laranja' },
    { id: 'purple', hex: '#a855f7', name: 'Roxo' },
  ];

  const setForbiddenColor = async (colorId: string) => {
    if (!activeSessionId) return;
    const sessionRef = doc(db, 'sessions', activeSessionId);
    await updateDoc(sessionRef, {
      forbiddenColor: colorId,
      roundId: Math.random().toString(36).substring(7) // Trigger a new round for students
    });
  };

  const loadGame = async (game: GameTemplate) => {
    try {
      if (activeSessionId) {
        const sessionRef = doc(db, 'sessions', activeSessionId);
        await updateDoc(sessionRef, {
          activeGameType: game.type,
          status: 'playing',
          forbiddenColor: null,
          roundId: Math.random().toString(36).substring(7)
        });
        alert(`Jogo "${game.title}" liberado na arena!`);
      } else {
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const docRef = await addDoc(collection(db, 'sessions'), {
          gameTemplateId: game.id,
          activeGameType: game.type,
          teacherId,
          pin,
          status: 'waiting',
          createdAt: serverTimestamp(),
        });
        setActiveSessionId(docRef.id);
        alert(`Sessão criada! PIN: ${pin}. O jogo "${game.title}" está pronto.`);
      }
    } catch (error) {
      console.error("Error loading game:", error);
    }
  };

  return (
    <div className="flex flex-col h-full pt-12 px-6 gap-6 relative z-10">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-white/50 hover:text-white">
          <ChevronLeft size={32} />
        </button>
        <h2 className="text-xl font-black italic tracking-widest text-sky-400 uppercase">
          {activeSession?.pin ? `SALA: ${activeSession.pin}` : 'MEUS JOGOS'}
        </h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto pb-10 flex flex-col gap-4">
        {activeSession?.activeGameType === 'colors' && (
          <div className="bg-sky-500/10 border-2 border-sky-400/30 rounded-3xl p-6 flex flex-col gap-6 mb-4">
            <div className="text-center">
              <h3 className="text-lg font-black italic">CONTROLE: JOGO DAS CORES</h3>
              <p className="text-[10px] opacity-60 font-bold uppercase mt-1">Clique em uma cor e diga o comando "NÃO PODE A COR..."</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setForbiddenColor(color.id)}
                  className={`h-16 rounded-xl border-b-4 transition-all flex items-center justify-center ${
                    activeSession.forbiddenColor === color.id 
                      ? 'border-white brightness-125 scale-95 ring-2 ring-white/50' 
                      : 'border-black/30'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {activeSession.forbiddenColor === color.id && (
                     <div className="bg-black/40 px-2 py-1 rounded text-[8px] font-black text-white">PROIBIDA</div>
                  )}
                </button>
              ))}
            </div>

            <button 
              onClick={() => updateDoc(doc(db, 'sessions', activeSessionId!), { status: 'waiting', activeGameType: null })}
              className="bg-red-500/20 border border-red-500/50 text-red-400 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              Encerrar Jogo
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-white/20 font-bold uppercase tracking-widest">Carregando...</div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <BookOpen size={48} className="text-white/10" />
            <p className="text-white/30 font-bold uppercase text-xs tracking-widest">Nenhum jogo encontrado</p>
          </div>
        ) : (
          games.map((game) => (
            <motion.div 
              key={game.id}
              whileHover={{ scale: 1.02 }}
              className="bg-blue-900/40 border-2 border-blue-400/20 rounded-2xl p-4 flex items-center justify-between shadow-lg"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-sky-400 font-black uppercase tracking-widest">{game.type}</span>
                <h3 className="font-bold text-lg">{game.title}</h3>
              </div>
              <button 
                onClick={() => loadGame(game)}
                className="bg-sky-500 hover:bg-sky-400 text-white p-3 rounded-xl shadow-[0_4px_0_rgb(7,89,133)] active:shadow-none active:translate-y-1 transition-all"
              >
                <Play size={20} fill="currentColor" />
              </button>
            </motion.div>
          ))
        )}

        <button className="mt-4 border-2 border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white hover:border-white/50 transition-all">
          <Plus size={32} />
          <span className="text-xs font-black uppercase tracking-widest">Criar Novo Jogo</span>
        </button>
      </div>
    </div>
  );
};
