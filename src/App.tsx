/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trophy, Users, User, Gamepad2, Presentation } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  serverTimestamp, 
  onSnapshot, 
  updateDoc,
  addDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { TeacherDashboard } from './TeacherDashboard';
import { seedGameTemplates } from './dbUtils';
import { ColorsGame } from './ColorsGame';

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
        <BeveledButton color="light-blue" className="!px-3 !py-1 text-[10px]" onClick={() => onNavigate('teacher-login')}>
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

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo.error;
}

const EnrollmentScreen = ({ 
  onBack, 
  onJoinSuccess 
}: { 
  onBack: () => void, 
  onJoinSuccess: (sessionId: string, nickname: string) => void 
}) => {
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!nickname || !pin) {
      setError('Preencha seu nome e o PIN da sala');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const sessionsRef = collection(db, 'sessions');
      const q = query(sessionsRef, where('pin', '==', pin), where('status', '==', 'waiting'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const sessionId = snapshot.docs[0].id;
        onJoinSuccess(sessionId, nickname);
      } else {
        setError('Sala não encontrada ou já iniciada');
      }
    } catch (err) {
      const msg = handleFirestoreError(err, OperationType.GET, 'sessions');
      setError(`Erro: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-full pt-12 px-6 gap-8 relative z-10">
      <div className="w-full max-w-xs flex justify-center">
         <div className="bg-blue-600 border-2 border-blue-400 rounded-xl px-12 py-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_8px_15px_rgba(0,0,0,0.4)]">
            <h2 className="text-3xl font-black text-white italic tracking-widest drop-shadow-md">
              INSCRIÇÃO
            </h2>
         </div>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-5">
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-xl text-[10px] font-bold text-center uppercase tracking-widest">{error}</div>}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-blue-300 uppercase tracking-widest ml-2">Seu Nome / Apelido</label>
          <input 
            type="text" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ex: Player1"
            className="bg-blue-900/50 border-2 border-blue-400/30 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-blue-400 outline-none transition-all shadow-inner"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-blue-300 uppercase tracking-widest ml-2">PIN da Sala</label>
          <input 
            type="text" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="bg-blue-900/50 border-2 border-blue-400/30 rounded-xl px-4 py-3 text-white text-center text-2xl font-black tracking-[1em] placeholder:text-white/10 focus:border-blue-400 outline-none transition-all shadow-inner"
          />
        </div>

        <div className="flex flex-row gap-4 mt-2">
          <ClippedButton 
            color="blue" 
            className="flex-1 h-16 text-[10px] flex flex-col items-center justify-center gap-1"
            onClick={onBack}
          >
            <span className="font-black">VOLTAR</span>
            <ChevronLeft size={16} strokeWidth={4} />
          </ClippedButton>

          <BeveledButton 
            color="yellow" 
            className="flex-[2] py-4 text-xl"
            onClick={handleJoin}
          >
            {loading ? '...' : 'ENTRAR'}
          </BeveledButton>
        </div>
      </div>

      <div className="flex flex-row gap-4 w-full max-w-md justify-center items-start opacity-50 pointer-events-none">
        <ClippedButton 
          color="yellow" 
          className="flex-1 h-12 text-[9px] flex items-center justify-center font-black"
        >
          EQUIPES
        </ClippedButton>
        <ClippedButton 
          color="yellow" 
          className="flex-1 h-12 text-[9px] flex items-center justify-center font-black"
        >
          INDIVIDUAL
        </ClippedButton>
      </div>
    </div>
  );
};

const ArenaScreen = ({ 
  sessionId, 
  nickname,
  onBack,
  onStartGame 
}: { 
  sessionId: string, 
  nickname: string,
  onBack: () => void,
  onStartGame: (type: string) => void
}) => {
  const [activeGameType, setActiveGameType] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    
    const unsub = onSnapshot(doc(db, 'sessions', sessionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const type = data.activeGameType || null;
        setActiveGameType(type);
        
        // If the teacher has started the game (status changes to 'playing')
        if (data.status === 'playing' && type) {
          onStartGame(type);
        }
      }
    });

    return () => unsub();
  }, [sessionId, onStartGame]);

  const games = [
    { name: 'VERDADEIRO\nOU FALSO', type: 'true_false', angle: 0 },
    { name: 'DESAFIOS', type: 'challenge', angle: 45 },
    { name: 'JOGO DAS\nCORES', type: 'colors', angle: 90 },
    { name: 'ACERTE OU\nSAIA', type: 'stay_or_leave', angle: 135 },
    { name: '', type: '', angle: 180 },
    { name: '', type: '', angle: 225 },
    { name: '', type: '', angle: 270 },
    { name: 'QUIZ', type: 'quiz', angle: 315 },
  ];

  return (
    <div className="flex flex-col items-center justify-start h-full pt-12 px-6 overflow-hidden relative z-10">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <button onClick={onBack} className="text-white/50 hover:text-white transition-colors">
          <ChevronLeft size={32} />
        </button>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest">Jogador</span>
          <span className="text-xs font-bold uppercase">{nickname}</span>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-[450px] h-[450px] bg-blue-500/20 rounded-full blur-[80px]" />

        {games.map((game, i) => {
          const isActive = game.type === activeGameType;
          return (
            <div 
              key={i}
              className="absolute flex items-center justify-center transition-all duration-500"
              style={{ 
                transform: `rotate(${game.angle}deg) translateY(-165px)`,
                opacity: isActive || !activeGameType ? 1 : 0.2,
                scale: isActive ? 1.1 : 1
              }}
            >
              <button 
                disabled={activeGameType && !isActive ? true : false}
                className={`${
                  isActive ? 'bg-sky-400 border-white ring-4 ring-sky-500/50' : 'bg-sky-300/80 border-white/60'
                } border-t-2 shadow-[inset_0_4px_12px_rgba(255,255,255,0.6),0_15px_30px_rgba(0,0,0,0.5)] w-28 h-20 text-[10px] font-black text-blue-900 transition-all active:scale-95 flex items-center justify-center text-center px-2`}
                style={{ 
                  clipPath: 'polygon(5% 0%, 95% 0%, 80% 100%, 20% 100%)' 
                }}
              >
                <div className="whitespace-pre-line leading-tight tracking-tighter uppercase">
                  {game.name}
                  {isActive && <div className="text-[7px] mt-1 text-blue-700 animate-pulse">LIBERADO!</div>}
                </div>
              </button>
            </div>
          );
        })}

        <div className="z-20">
          <ClippedButton 
            color="yellow" 
            className="w-48 h-28 text-xl font-black leading-tight uppercase flex items-center justify-center shadow-2xl scale-110"
          >
            Arena de <br /> Jogos
          </ClippedButton>
        </div>
      </div>
    </div>
  );
};

const TeacherLoginScreen = ({ 
  onBack, 
  onLoginSuccess 
}: { 
  onBack: () => void, 
  onLoginSuccess: (teacherId: string) => void 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const teachersRef = collection(db, 'teachers');
      const q = query(teachersRef, where('username', '==', username), where('password', '==', password));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const teacherId = snapshot.docs[0].id;
        await seedGameTemplates(teacherId);
        onLoginSuccess(teacherId);
      } else {
        if (username === 'admin' && password === '12345') {
          const newTeacherRef = doc(db, 'teachers', 'default-teacher');
          await setDoc(newTeacherRef, { username, password });
          await seedGameTemplates('default-teacher');
          onLoginSuccess('default-teacher');
        } else {
          setError('Usuário ou senha incorretos');
        }
      }
    } catch (err) {
      const msg = handleFirestoreError(err, OperationType.GET, 'teachers');
      setError(`Erro de conexão: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start h-full pt-12 px-6 gap-8 relative z-10">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors z-50"
      >
        <ChevronLeft size={32} />
      </button>

      <div className="w-full max-w-xs flex justify-center mt-8">
         <div className="bg-sky-500 border-2 border-sky-300 rounded-xl px-8 py-3 shadow-[0_8px_15px_rgba(0,0,0,0.4)]">
            <h2 className="text-2xl font-black text-white italic tracking-widest text-center">
              ÁREA DO PROFESSOR
            </h2>
         </div>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-6 mt-4">
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-xl text-xs font-bold text-center uppercase tracking-widest">{error}</div>}
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-sky-300 uppercase tracking-widest ml-2">Usuário</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="bg-blue-900/50 border-2 border-blue-400/30 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-sky-400 outline-none transition-all shadow-inner"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-sky-300 uppercase tracking-widest ml-2">Senha</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="12345"
            className="bg-blue-900/50 border-2 border-blue-400/30 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-sky-400 outline-none transition-all shadow-inner"
          />
        </div>

        <BeveledButton 
          color="blue" 
          className="w-full mt-4 py-4 text-xl"
          onClick={handleLogin}
        >
          {loading ? 'CARREGANDO...' : 'ENTRAR'}
        </BeveledButton>
      </div>

      <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter mt-4 text-center px-10">
        Acesso restrito para criação de salas e gerenciamento de quizzes.
      </p>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);

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
              <EnrollmentScreen 
                onBack={() => setCurrentPage('home')} 
                onJoinSuccess={(sid, nick) => {
                  setSessionId(sid);
                  setNickname(nick);
                  setCurrentPage('arena');
                }}
              />
            </motion.div>
          )}

          {currentPage === 'arena' && sessionId && nickname && (
            <motion.div 
              key="arena"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ArenaScreen 
                sessionId={sessionId}
                nickname={nickname}
                onBack={() => setCurrentPage('home')} 
                onStartGame={(type) => {
                  if (type === 'colors') setCurrentPage('game-colors');
                }}
              />
            </motion.div>
          )}

          {currentPage === 'game-colors' && sessionId && nickname && (
            <motion.div 
              key="game-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="h-full"
            >
              <ColorsGame 
                sessionId={sessionId} 
                nickname={nickname} 
                onGameOver={() => setCurrentPage('arena')} 
              />
            </motion.div>
          )}

          {currentPage === 'teacher-login' && (
            <motion.div 
              key="teacher-login"
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <TeacherLoginScreen 
                onBack={() => setCurrentPage('home')} 
                onLoginSuccess={(id) => {
                  setTeacherId(id);
                  setCurrentPage('teacher-dashboard');
                }}
              />
            </motion.div>
          )}

          {currentPage === 'teacher-dashboard' && teacherId && (
            <motion.div 
              key="teacher-dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <TeacherDashboard 
                teacherId={teacherId} 
                onBack={() => setCurrentPage('home')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
