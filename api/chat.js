// api/chat.js
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { handleCommandExecutado } from './secureExecute.js'; // Integração com lógica de ações

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, confirmar } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensagens inválidas' });
  }

  try {
    const prompt = messages.map(m => m.content).join('\n');

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'Você é um assistente de obras com acesso ao banco de dados. Sempre que o usuário pedir algo, interprete o comando e descreva o que será feito, sem executar ainda. Aguarde confirmação.',
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    const interpretacao = gptResponse.choices[0]?.message?.content;
    if (!interpretacao) return res.status(500).json({ error: 'Resposta da IA está vazia.' });

    // Verifica se o frontend pediu para executar o comando
    if (confirmar === true) {
      const execucao = await handleCommandExecutado(prompt);
      return res.status(200).json({
        interpretacao,
        execucao
      });
    }

    return res.status(200).json({
      interpretacao,
      aviso: 'Confirmação pendente para executar o comando.'
    });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
