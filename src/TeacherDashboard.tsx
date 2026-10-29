import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
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

  const loadGame = async (game: GameTemplate) => {
    try {
      if (activeSessionId) {
        // If a session is already active, update the active game type in it
        const sessionRef = doc(db, 'sessions', activeSessionId);
        await updateDoc(sessionRef, {
          activeGameType: game.type,
          status: 'playing'
        });
        alert(`Jogo "${game.title}" liberado na arena!`);
      } else {
        // Create a new session
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
        <h2 className="text-xl font-black italic tracking-widest text-sky-400">MEUS JOGOS</h2>
        <div className="w-8" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto pb-10 flex flex-col gap-4">
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
