-- Tabela de Apostas
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL,
    winner_selection TEXT, -- '1', 'X', '2'
    first_scorer INTEGER, -- 1 ou 2
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, match_id)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias apostas
CREATE POLICY "Usuários podem ver suas próprias apostas" 
ON public.bets FOR SELECT 
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias apostas
CREATE POLICY "Usuários podem inserir suas próprias apostas" 
ON public.bets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias apostas
CREATE POLICY "Usuários podem atualizar suas próprias apostas" 
ON public.bets FOR UPDATE 
USING (auth.uid() = user_id);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bets_updated_at
    BEFORE UPDATE ON public.bets
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
