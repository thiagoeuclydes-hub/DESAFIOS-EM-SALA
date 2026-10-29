import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';

export const seedGameTemplates = async (teacherId: string) => {
  const templatesRef = collection(db, 'gameTemplates');
  const q = query(templatesRef, where('teacherId', '==', teacherId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    const defaultGames = [
      { title: 'Quiz de História', type: 'quiz', content: { questions: [] } },
      { title: 'Verdadeiro ou Falso: Ciência', type: 'true_false', content: { questions: [] } },
      { title: 'Desafio Matemático', type: 'challenge', content: { questions: [] } },
      { title: 'Corrida das Cores', type: 'colors', content: { rules: {} } },
      { title: 'Acerte ou Saia!', type: 'stay_or_leave', content: { rules: {} } },
    ];

    for (const game of defaultGames) {
      await addDoc(templatesRef, {
        ...game,
        teacherId,
        createdAt: serverTimestamp(),
      });
    }
  }
};
