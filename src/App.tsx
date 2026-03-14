/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Send, Calendar, Users, Info, ChevronRight, CheckCircle2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';

// Mock data for the 2026 World Cup (48 teams, 12 groups of 4)
// For brevity, we'll show a few key groups and matches
const GROUPS = [
  { name: 'Grupo A', teams: ['México', 'Equador', 'Angola', 'Cazaquistão'] },
  { name: 'Grupo B', teams: ['Canadá', 'Suíça', 'Gana', 'Iraque'] },
  { name: 'Grupo C', teams: ['Estados Unidos', 'Uruguai', 'Marrocos', 'Uzbequistão'] },
  { name: 'Grupo D', teams: ['Brasil', 'Croácia', 'Camarões', 'Tailândia'] },
  { name: 'Grupo E', teams: ['Argentina', 'Polônia', 'Egito', 'Panamá'] },
  { name: 'Grupo F', teams: ['França', 'Japão', 'Nigéria', 'Jamaica'] },
  { name: 'Grupo G', teams: ['Espanha', 'Turquia', 'Mali', 'Nova Zelândia'] },
  { name: 'Grupo H', teams: ['Inglaterra', 'Peru', 'África do Sul', 'Emirados Árabes'] },
  { name: 'Grupo I', teams: ['Portugal', 'Colômbia', 'Tunísia', 'Omã'] },
  { name: 'Grupo J', teams: ['Holanda', 'Chile', 'Argélia', 'Coreia do Norte'] },
  { name: 'Grupo K', teams: ['Itália', 'Coreia do Sul', 'Senegal', 'Costa Rica'] },
  { name: 'Grupo L', teams: ['Alemanha', 'Austrália', 'Costa do Marfim', 'Honduras'] },
];

const INITIAL_MATCHES = [
  // Grupo A
  { id: 1, group: 'A', team1: 'México', team2: 'Equador', date: '11/06/2026', time: '16:00' },
  { id: 2, group: 'A', team1: 'Angola', team2: 'Cazaquistão', date: '11/06/2026', time: '20:00' },
  // Grupo B
  { id: 3, group: 'B', team1: 'Canadá', team2: 'Suíça', date: '12/06/2026', time: '13:00' },
  { id: 4, group: 'B', team1: 'Gana', team2: 'Iraque', date: '12/06/2026', time: '16:00' },
  // Grupo C
  { id: 5, group: 'C', team1: 'Estados Unidos', team2: 'Uruguai', date: '12/06/2026', time: '19:00' },
  { id: 6, group: 'C', team1: 'Marrocos', team2: 'Uzbequistão', date: '12/06/2026', time: '22:00' },
  // Grupo D
  { id: 7, group: 'D', team1: 'Brasil', team2: 'Croácia', date: '13/06/2026', time: '16:00' },
  { id: 8, group: 'D', team1: 'Camarões', team2: 'Tailândia', date: '13/06/2026', time: '19:00' },
  // Grupo E
  { id: 9, group: 'E', team1: 'Argentina', team2: 'Polônia', date: '14/06/2026', time: '13:00' },
  { id: 10, group: 'E', team1: 'Egito', team2: 'Panamá', date: '14/06/2026', time: '16:00' },
  // Grupo F
  { id: 11, group: 'F', team1: 'França', team2: 'Japão', date: '15/06/2026', time: '16:00' },
  { id: 12, group: 'F', team1: 'Nigéria', team2: 'Jamaica', date: '15/06/2026', time: '19:00' },
  // Grupo G
  { id: 13, group: 'G', team1: 'Espanha', team2: 'Turquia', date: '16/06/2026', time: '13:00' },
  { id: 14, group: 'G', team1: 'Mali', team2: 'Nova Zelândia', date: '16/06/2026', time: '16:00' },
  // Grupo H
  { id: 15, group: 'H', team1: 'Inglaterra', team2: 'Peru', date: '16/06/2026', time: '19:00' },
  { id: 16, group: 'H', team1: 'África do Sul', team2: 'Emirados Árabes', date: '16/06/2026', time: '22:00' },
  // Grupo I
  { id: 17, group: 'I', team1: 'Portugal', team2: 'Colômbia', date: '17/06/2026', time: '13:00' },
  { id: 18, group: 'I', team1: 'Tunísia', team2: 'Omã', date: '17/06/2026', time: '16:00' },
  // Grupo J
  { id: 19, group: 'J', team1: 'Holanda', team2: 'Chile', date: '17/06/2026', time: '19:00' },
  { id: 20, group: 'J', team1: 'Argélia', team2: 'Coreia do Norte', date: '17/06/2026', time: '22:00' },
  // Grupo K
  { id: 21, group: 'K', team1: 'Itália', team2: 'Coreia do Sul', date: '18/06/2026', time: '13:00' },
  { id: 22, group: 'K', team1: 'Senegal', team2: 'Costa Rica', date: '18/06/2026', time: '16:00' },
  // Grupo L
  { id: 23, group: 'L', team1: 'Alemanha', team2: 'Austrália', date: '18/06/2026', time: '19:00' },
  { id: 24, group: 'L', team1: 'Costa do Marfim', team2: 'Honduras', date: '18/06/2026', time: '22:00' },
];

interface Bet {
  winnerSelection?: 1 | 'X' | 2;
  firstScorer?: 1 | 2;
}

const TEAM_FLAGS: Record<string, string> = {
  'México': '🇲🇽',
  'Equador': '🇪🇨',
  'Angola': '🇦🇴',
  'Cazaquistão': '🇰🇿',
  'Canadá': '🇨🇦',
  'Suíça': '🇨🇭',
  'Gana': '🇬🇭',
  'Iraque': '🇮🇶',
  'Estados Unidos': '🇺🇸',
  'Uruguai': '🇺🇾',
  'Marrocos': '🇲🇦',
  'Uzbequistão': '🇺🇿',
  'Brasil': '🇧🇷',
  'Croácia': '🇭🇷',
  'Camarões': '🇨🇲',
  'Tailândia': '🇹🇭',
  'Argentina': '🇦🇷',
  'Polônia': '🇵🇱',
  'Egito': '🇪🇬',
  'Panamá': '🇵🇦',
  'França': '🇫🇷',
  'Japão': '🇯🇵',
  'Nigéria': '🇳🇬',
  'Jamaica': '🇯🇲',
  'Espanha': '🇪🇸',
  'Turquia': '🇹🇷',
  'Mali': '🇲🇱',
  'Nova Zelândia': '🇳🇿',
  'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Peru': '🇵🇪',
  'África do Sul': '🇿🇦',
  'Emirados Árabes': '🇦🇪',
  'Portugal': '🇵🇹',
  'Colômbia': '🇨🇴',
  'Tunísia': '🇹🇳',
  'Omã': '🇴🇲',
  'Holanda': '🇳🇱',
  'Chile': '🇨🇱',
  'Argélia': '🇩🇿',
  'Coreia do Norte': '🇰🇵',
  'Itália': '🇮🇹',
  'Coreia do Sul': '🇰🇷',
  'Senegal': '🇸🇳',
  'Costa Rica': '🇨🇷',
  'Alemanha': '🇩🇪',
  'Austrália': '🇦🇺',
  'Costa do Marfim': '🇨🇮',
  'Honduras': '🇭🇳',
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [bets, setBets] = useState<Record<number, Bet>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  const [filterDate, setFilterDate] = useState('all');
  const [filterTeam, setFilterTeam] = useState('');
  const WHATSAPP_NUMBER = '5585992121215';

  useEffect(() => {
    if (!supabase) {
      setAuthChecking(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecking(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load bets from Supabase when user is logged in
  useEffect(() => {
    const loadBets = async () => {
      if (!user || !supabase) return;
      
      setIsLoadingBets(true);
      try {
        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          const loadedBets: Record<number, Bet> = {};
          data.forEach((bet: any) => {
            loadedBets[bet.match_id] = {
              winnerSelection: bet.winner_selection as 1 | 'X' | 2,
              firstScorer: bet.first_scorer as 1 | 2
            };
          });
          setBets(loadedBets);
        }
      } catch (err) {
        console.error('Erro ao carregar apostas:', err);
      } finally {
        setIsLoadingBets(false);
      }
    };

    loadBets();
  }, [user]);

  const userName = user?.user_metadata?.username || user?.email?.split('@')[0] || '';
  const userWhatsapp = user?.user_metadata?.whatsapp || '';

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const uniqueDates = useMemo(() => {
    return Array.from(new Set(INITIAL_MATCHES.map(m => m.date))).sort();
  }, []);

  const filteredMatches = useMemo(() => {
    return INITIAL_MATCHES.filter(match => {
      const matchesDate = filterDate === 'all' || match.date === filterDate;
      const matchesTeam = filterTeam === '' || 
        match.team1.toLowerCase().includes(filterTeam.toLowerCase()) || 
        match.team2.toLowerCase().includes(filterTeam.toLowerCase());
      return matchesDate && matchesTeam;
    });
  }, [filterDate, filterTeam]);

  const completedBetsCount = useMemo(() => {
    return Object.values(bets).filter((b: Bet) => b.winnerSelection || b.firstScorer).length;
  }, [bets]);

  const totalAmount = useMemo(() => {
    let total = 0;
    Object.values(bets).forEach((b: Bet) => {
      if (b.winnerSelection) {
        total += 10;
      }
      if (b.firstScorer) {
        total += 5;
      }
    });
    return total;
  }, [bets]);

  const handleWinnerChange = (matchId: number, selection: 1 | 'X' | 2) => {
    setBets(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        winnerSelection: prev[matchId]?.winnerSelection === selection ? undefined : selection
      }
    }));
  };

  const handleFirstScorerChange = (matchId: number, team: 1 | 2) => {
    setBets(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        firstScorer: prev[matchId]?.firstScorer === team ? undefined : team
      }
    }));
  };

  const generateWhatsAppLink = async () => {
    setIsSending(true);

    // Save bets to Supabase before sending to WhatsApp
    if (supabase && user) {
      try {
        const betsToSave = Object.entries(bets).map(([matchId, bet]) => {
          const b = bet as Bet;
          return {
            user_id: user.id,
            match_id: parseInt(matchId),
            winner_selection: b.winnerSelection,
            first_scorer: b.firstScorer
          };
        });

        if (betsToSave.length > 0) {
          // Use upsert to update existing bets or insert new ones
          const { error } = await supabase
            .from('bets')
            .upsert(betsToSave, { onConflict: 'user_id,match_id' });
          
          if (error) throw error;
        }
      } catch (err) {
        console.error('Erro ao salvar apostas no banco:', err);
        // We continue anyway to send the WhatsApp message
      }
    }

    // Simulate a "gratifying" sending process of 5 seconds as requested
    setTimeout(() => {
      let message = `⚽ *BOLÃO FRANZ* ⚽\n\n`;
      message += `👤 *Apostador:* ${userName}\n`;
      message += `📱 *WhatsApp:* ${userWhatsapp}\n`;
      message += `--------------------------\n`;

      INITIAL_MATCHES.forEach(match => {
        const bet = bets[match.id];
        const hasWinner = bet && bet.winnerSelection;
        const hasFirstScorer = bet && bet.firstScorer;
        
        if (hasWinner || hasFirstScorer) {
          message += `🏟️ ${match.team1} vs ${match.team2}\n`;
          if (hasWinner) {
            let result = '';
            if (bet.winnerSelection === 1) result = match.team1;
            else if (bet.winnerSelection === 2) result = match.team2;
            else result = 'Empate';
            message += `   Vencedor: ${result} (R$ 10,00)\n`;
          }
          if (hasFirstScorer) {
            const teamName = bet.firstScorer === 1 ? match.team1 : match.team2;
            message += `   1º Gol: ${teamName} (R$ 5,00)\n`;
          }
          message += `\n`;
        }
      });

      message += `--------------------------\n`;
      message += `💰 *Total Apostado:* R$ ${totalAmount.toFixed(2).replace('.', ',')}\n`;
      message += `🚀 Aguardando instruções para pagamento!`;

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
      
      setIsSending(false);
      setIsSubmitted(true);
    }, 5000);
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="mb-6 rounded-full bg-yellow-100 p-6">
          <Info className="h-12 w-12 text-yellow-600" />
        </div>
        <h1 className="mb-2 text-2xl font-black text-slate-900">Configuração Necessária</h1>
        <p className="max-w-md text-slate-600">
          As variáveis de ambiente do Supabase não foram configuradas ou são inválidas. 
          Por favor, adicione <code className="rounded bg-slate-200 px-1">VITE_SUPABASE_URL</code> e 
          <code className="rounded bg-slate-200 px-1">VITE_SUPABASE_ANON_KEY</code> no painel do AI Studio.
        </p>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Success Modal */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-2xl overflow-hidden"
            >
              {/* Celebration background animation - 5s duration per trophy */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-emerald-500"
                    initial={{ 
                      x: Math.random() * 400 - 200, 
                      y: 400, 
                      opacity: 0,
                      scale: 0.5,
                      rotate: 0 
                    }}
                    animate={{ 
                      y: -100, 
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1.2, 1.2, 0.8],
                      rotate: 360 
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      delay: i * 0.5,
                      ease: "easeOut"
                    }}
                    style={{ 
                      left: `${Math.random() * 100}%`,
                    }}
                  >
                    <Trophy size={24} />
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                </div>
                <h2 className="mb-2 text-3xl font-black text-slate-900">Aposta Enviada!</h2>
                <p className="mb-8 text-slate-600">
                  Obrigado por participar do Bolão Franz, <span className="font-bold text-emerald-600">{userName}</span>! 
                  Suas apostas foram encaminhadas para o WhatsApp. 
                  As instruções de pagamento serão enviadas em breve pelo nosso atendente.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white transition-all hover:bg-emerald-500 active:scale-95"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header / Hero */}
      <header className="relative overflow-hidden bg-emerald-600 py-20 text-white lg:py-32">
        {/* Abstract shapes for a "sporty" feel */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-yellow-400 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="mb-8 rounded-2xl bg-yellow-400 p-5 text-emerald-800 shadow-2xl rotate-3"
            >
              <Trophy size={56} />
            </motion.div>
            <h1 className="mb-6 text-6xl font-black tracking-tighter uppercase sm:text-8xl">
              Bolão <span className="text-yellow-400">Franz</span>
            </h1>
            <p className="max-w-2xl text-xl font-medium text-emerald-50 opacity-90 leading-relaxed">
              Olá, <span className="font-bold text-yellow-400">{userName}</span>! Seu Bolão da Copa 2026. 
              <br />Dê seus palpites e concorra a prêmios incríveis!
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-bold backdrop-blur-md border border-white/20 transition-all hover:bg-white/20 active:scale-95"
              >
                <LogOut size={18} />
                Sair da Conta
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* Left Column: Groups and Info */}
          <div className="space-y-8 lg:col-span-1">
            <section className="sticky top-8 space-y-8">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                    <Users size={20} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">Seleções</h2>
                </div>
                <div className="space-y-4">
                  {GROUPS.map((group) => (
                    <div key={group.name} className="space-y-2">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {group.teams.map((team) => (
                          <span key={team} className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600 border border-slate-100">
                            <span>{TEAM_FLAGS[team]}</span>
                            {team}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-blue-500 opacity-20 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-white/10 p-2 text-yellow-400">
                      <Info size={20} />
                    </div>
                    <h2 className="text-xl font-black">Regras</h2>
                  </div>
                  <ul className="space-y-4">
                    {[
                      'Palpite no vencedor (1 X 2): R$ 10,00',
                      'Palpite no 1º marcador: R$ 5,00',
                      'Envie via WhatsApp para validar',
                      'Pagamento via PIX no atendimento'
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm font-medium text-slate-300">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Match Table and Betting */}
          <div className="lg:col-span-2">
            <div className="mb-8 space-y-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                    <Calendar size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">Jogos</h2>
                  {isLoadingBets && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {/* Date Filter */}
                  <select 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    <option value="all">Todas as Datas</option>
                    {uniqueDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>

                  {/* Team Filter */}
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Buscar seleção..."
                      value={filterTeam}
                      onChange={(e) => setFilterTeam(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 pl-10 text-sm font-bold text-slate-600 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all sm:w-64"
                    />
                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Progresso do Bolão</span>
                  <span>{completedBetsCount} / {INITIAL_MATCHES.length} Jogos</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedBetsCount / INITIAL_MATCHES.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredMatches.length > 0 ? (
                  filteredMatches.map((match) => {
                    const matchBet = bets[match.id];
                    const matchCost = (matchBet?.winnerSelection ? 10 : 0) + (matchBet?.firstScorer ? 5 : 0);
                    
                    return (
                      <motion.div 
                        key={match.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-xl"
                      >
                        <div className="mb-6 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <Calendar size={12} />
                            <span>{match.date} • {match.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Grupo {match.group}</span>
                            {matchCost > 0 && (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black text-emerald-900 uppercase tracking-wider shadow-sm"
                              >
                                R$ {matchCost.toFixed(2).replace('.', ',')}
                              </motion.span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-8">
                          <div className="flex items-center justify-between gap-4">
                            {/* Team 1 */}
                            <div className="flex flex-1 flex-col items-center gap-3 sm:flex-row sm:justify-end">
                              <span className="text-center font-black text-slate-800 sm:text-right sm:text-xl">{match.team1}</span>
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl shadow-inner border border-slate-100 group-hover:bg-white transition-colors">
                                {TEAM_FLAGS[match.team1] || '🏳️'}
                              </div>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-400">
                                VS
                              </div>
                            </div>

                            {/* Team 2 */}
                            <div className="flex flex-1 flex-col-reverse items-center gap-3 sm:flex-row sm:justify-start">
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl shadow-inner border border-slate-100 group-hover:bg-white transition-colors">
                                {TEAM_FLAGS[match.team2] || '🏳️'}
                              </div>
                              <span className="text-center font-black text-slate-800 sm:text-left sm:text-xl">{match.team2}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Winner Selection */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultado Final</span>
                                <span className="text-[10px] font-bold text-emerald-600">R$ 10,00</span>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleWinnerChange(match.id, 1)}
                                  className={`flex-1 rounded-2xl py-3 text-xs font-black transition-all ${
                                    matchBet?.winnerSelection === 1 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-[1.02]' 
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  1
                                </button>
                                <button 
                                  onClick={() => handleWinnerChange(match.id, 'X')}
                                  className={`w-14 rounded-2xl py-3 text-xs font-black transition-all ${
                                    matchBet?.winnerSelection === 'X' 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  X
                                </button>
                                <button 
                                  onClick={() => handleWinnerChange(match.id, 2)}
                                  className={`flex-1 rounded-2xl py-3 text-xs font-black transition-all ${
                                    matchBet?.winnerSelection === 2 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-[1.02]' 
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  2
                                </button>
                              </div>
                            </div>

                            {/* First Scorer Selection */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primeiro Gol</span>
                                <span className="text-[10px] font-bold text-blue-600">R$ 5,00</span>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleFirstScorerChange(match.id, 1)}
                                  className={`flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-tighter transition-all ${
                                    matchBet?.firstScorer === 1 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {match.team1}
                                </button>
                                <button 
                                  onClick={() => handleFirstScorerChange(match.id, 2)}
                                  className={`flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-tighter transition-all ${
                                    matchBet?.firstScorer === 2 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {match.team2}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-12 text-center"
                  >
                    <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
                      <Users size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Nenhum jogo encontrado</h3>
                    <p className="text-sm text-slate-500">Tente ajustar seus filtros para encontrar o que procura.</p>
                    <button 
                      onClick={() => { setFilterDate('all'); setFilterTeam(''); }}
                      className="mt-6 text-sm font-bold text-emerald-600 hover:underline"
                    >
                      Limpar Filtros
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky/Bottom Action Bar */}
            <div className="mt-12 sticky bottom-8 z-40">
              <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-2xl border border-white/10 backdrop-blur-xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Apostador</p>
                      <p className="font-black text-white">{userName} <span className="text-xs font-medium text-slate-400">({userWhatsapp})</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jogos</p>
                      <p className="text-xl font-black text-white">{completedBetsCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</p>
                      <p className="text-2xl font-black text-yellow-400">R$ {totalAmount.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={generateWhatsAppLink}
                  disabled={completedBetsCount === 0 || isSending}
                  className={`relative overflow-hidden flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-sm font-black uppercase tracking-[0.2em] transition-all ${
                    completedBetsCount > 0 && !isSending
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-[0.98]' 
                    : isSending 
                      ? 'bg-emerald-600 text-white cursor-wait'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {isSending ? (
                    <>
                      <motion.div 
                        className="absolute inset-0 bg-white/20"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, ease: "linear" }}
                      />
                      <span className="relative z-10 flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Send size={20} />
                        </motion.div>
                        Processando...
                      </span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Finalizar e Enviar Apostas
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center gap-4">
            <div className="h-2 w-8 rounded-full bg-emerald-600"></div>
            <div className="h-2 w-8 rounded-full bg-yellow-400"></div>
            <div className="h-2 w-8 rounded-full bg-blue-600"></div>
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Bolão Franz • Todos os direitos reservados
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Esta é uma plataforma de entretenimento. Aposte com responsabilidade.
          </p>
        </div>
      </footer>
    </div>
  );
}
