import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { User, Lock, Phone, UserPlus, LogIn, Mail } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase não configurado corretamente.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // If login, we allow email or whatsapp (whatsapp becomes fake email)
      // If signup, we use the real email provided
      const authEmail = isLogin 
        ? (whatsapp.includes('@') ? whatsapp : `${whatsapp}@bolao.com`)
        : email;

      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });
        
        if (authError) throw authError;
        if (data.user) onAuthSuccess(data.user);
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              username: username,
              whatsapp: whatsapp,
            }
          }
        });
        
        if (authError) throw authError;
        if (data.user) onAuthSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h2>
          <p className="text-slate-500">
            {isLogin ? 'Entre para fazer suas apostas' : 'Junte-se ao Bolão Franz'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Nome de Usuário"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl border-none bg-slate-100 py-4 pl-12 pr-4 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  placeholder="E-mail"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border-none bg-slate-100 py-4 pl-12 pr-4 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={isLogin ? "E-mail ou WhatsApp" : "WhatsApp (ex: 85999999999)"}
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-2xl border-none bg-slate-100 py-4 pl-12 pr-4 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border-none bg-slate-100 py-4 pl-12 pr-4 font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <p className="text-center text-sm font-medium text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-bold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : isLogin ? (
              <>
                <LogIn size={20} />
                Entrar
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Cadastrar
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold text-emerald-600 hover:underline"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
