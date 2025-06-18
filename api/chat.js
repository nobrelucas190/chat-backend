// api/chat.js

export default async function handler(req, res) {
  try {
    res.status(200).json({
      ok: true,
      message: "API detectada com sucesso! 🚀"
    });
  } catch (error) {
    console.error("Erro na função handler:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}
