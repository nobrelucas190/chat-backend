// api/chat.js

import { supabase } from '../supabase.js';
import { openai } from '../openai.js';

export default async function handler(req, res) {
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

    const resposta = response.choices[0].message.content;

    res.status(200).json({ resposta });
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
