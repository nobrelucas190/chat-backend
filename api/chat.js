// api/chat.js

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // CORS headers para permitir chamadas do frontend da Hostinger
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensagens inválidas' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'Você é um assistente de obras com acesso ao banco de dados. Sempre que o usuário pedir algo, interprete o comando e gere uma resposta direta e registre as ações no Supabase.',
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    const resposta = response.choices[0]?.message?.content;

    if (!resposta) {
      return res.status(500).json({ error: 'Resposta da IA está vazia.' });
    }

    return res.status(200).json({ resposta });
  } catch (error) {
    console.error('Erro ao gerar resposta da IA:', error);
    return res.status(500).json({ error: 'Erro interno no servidor de IA.' });
  }
}
