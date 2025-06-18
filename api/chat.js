import { openai } from '../openai.js';
import { supabase } from '../supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { messages } = req.body;
  if (!messages) {
    return res.status(400).json({ error: 'Mensagens não enviadas' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente de obra com acesso ao banco Supabase. Interprete comandos do usuário e execute ações quando apropriado.`
        },
        ...messages
      ],
      temperature: 0.4
    });

    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar resposta' });
  }
}