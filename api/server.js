const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3031;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("connect", () => {
  console.log("Conectado ao PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Erro PostgreSQL:", err);
});

let genAI, model;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    console.log("Gemini AI inicializado");
  } catch (error) {
    console.error("Erro Gemini:", error.message);
  }
}

async function initDatabase() {
  try {
    console.log("Criando tabelas...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        telefone VARCHAR(20) UNIQUE NOT NULL,
        nome VARCHAR(100),
        email VARCHAR(100),
        origem VARCHAR(50) DEFAULT 'WhatsApp',
        status VARCHAR(20) DEFAULT 'Novo',
        score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
        observacoes TEXT,
        data_criacao TIMESTAMP DEFAULT NOW(),
        ultima_interacao TIMESTAMP,
        total_interacoes INTEGER DEFAULT 0,
        ultima_mensagem TEXT,
        convertido_cliente BOOLEAN DEFAULT FALSE,
        CONSTRAINT chk_status CHECK (status IN ('Novo', 'Qualificado', 'Em Atendimento', 'Convertido', 'Perdido'))
      );
      
      CREATE TABLE IF NOT EXISTS interacoes (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
        telefone VARCHAR(20) NOT NULL,
        tipo VARCHAR(50) DEFAULT 'WhatsApp',
        mensagem TEXT,
        resposta TEXT,
        intencao VARCHAR(50),
        sentimento VARCHAR(20),
        agendamento_realizado BOOLEAN DEFAULT FALSE,
        escalado_humano BOOLEAN DEFAULT FALSE,
        data_interacao TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS funcionarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cpf VARCHAR(14) UNIQUE,
        email VARCHAR(100),
        telefone VARCHAR(20),
        cargo VARCHAR(50),
        especialidade VARCHAR(100),
        crm VARCHAR(20),
        ativo BOOLEAN DEFAULT TRUE,
        data_cadastro TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS servicos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        duracao INTEGER,
        valor DECIMAL(10,2),
        categoria VARCHAR(50),
        ativo BOOLEAN DEFAULT TRUE,
        data_criacao TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS agendamentos (
        id SERIAL PRIMARY KEY,
        telefone_cliente VARCHAR(20) NOT NULL,
        nome_cliente VARCHAR(100),
        servico_id INTEGER REFERENCES servicos(id),
        funcionario_id INTEGER REFERENCES funcionarios(id),
        data_hora TIMESTAMP NOT NULL,
        duracao INTEGER,
        status VARCHAR(20) DEFAULT 'Agendado',
        observacoes TEXT,
        origem VARCHAR(50) DEFAULT 'WhatsApp',
        criado_por_lara BOOLEAN DEFAULT FALSE,
        data_criacao TIMESTAMP DEFAULT NOW(),
        CONSTRAINT chk_agendamento_status CHECK (status IN ('Agendado', 'Confirmado', 'Realizado', 'Cancelado', 'Falta'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_leads_telefone ON leads(telefone);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_interacoes_telefone ON interacoes(telefone);
      CREATE INDEX IF NOT EXISTS idx_interacoes_data ON interacoes(data_interacao DESC);
      CREATE INDEX IF NOT EXISTS idx_agendamentos_telefone ON agendamentos(telefone_cliente);
      CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_hora);
      
      CREATE OR REPLACE VIEW vw_cliente_completo AS
      SELECT 
        dc.session_id AS telefone,
        dc.nome_completo,
        dc.data_nascimento,
        dc.apelido,
        dc.preferencias,
        dc.historico_medico,
        dc.comunicacao_preferida,
        dc.observacoes AS obs_lara,
        dc.ultima_interacao AS ultima_interacao_lara,
        l.id AS lead_id,
        l.status AS lead_status,
        l.score AS lead_score,
        l.total_interacoes,
        l.ultima_mensagem,
        (SELECT COUNT(*) FROM agendamentos WHERE telefone_cliente = dc.session_id) AS total_agendamentos,
        (SELECT MAX(data_hora) FROM agendamentos WHERE telefone_cliente = dc.session_id AND status = 'Realizado') AS ultima_consulta,
        (SELECT MIN(data_hora) FROM agendamentos WHERE telefone_cliente = dc.session_id AND status IN ('Agendado', 'Confirmado') AND data_hora > NOW()) AS proxima_consulta
      FROM n8n_dados_clientes dc
      LEFT JOIN leads l ON l.telefone = dc.session_id;
      
      CREATE OR REPLACE VIEW vw_historico_conversas AS
      SELECT 
        ch.telefone,
        ch.mensagem::jsonb->>'type' AS tipo,
        ch.mensagem::jsonb->>'content' AS conteudo,
        ch.created_at AS data_hora
      FROM n8n_chat_histories ch
      ORDER BY ch.created_at DESC;
    `);

    console.log("Tabelas criadas com sucesso");
  } catch (error) {
    console.error("Erro ao criar tabelas:", error.message);
  }
}

initDatabase();

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      service: "ClinicFlow API",
      database: "connected",
      ai: genAI ? "Gemini 2.0 Flash" : "disabled",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error.message,
    });
  }
});

app.post("/api/webhooks/lead", async (req, res) => {
  try {
    const { telefone, nome, mensagem, origem } = req.body;

    if (!telefone) {
      return res.status(400).json({ error: "Telefone obrigatorio" });
    }

    const existente = await pool.query(
      "SELECT id FROM leads WHERE telefone = $1",
      [telefone]
    );

    if (existente.rows.length > 0) {
      await pool.query(
        `UPDATE leads SET 
          ultima_interacao = NOW(), 
          total_interacoes = total_interacoes + 1, 
          ultima_mensagem = $1
        WHERE telefone = $2`,
        [mensagem, telefone]
      );

      const lead = await pool.query("SELECT * FROM leads WHERE telefone = $1", [
        telefone,
      ]);
      return res.json({
        success: true,
        message: "Lead atualizado",
        data: lead.rows[0],
      });
    } else {
      const result = await pool.query(
        `INSERT INTO leads (telefone, nome, origem, ultima_mensagem, ultima_interacao, total_interacoes) 
        VALUES ($1, $2, $3, $4, NOW(), 1) 
        RETURNING *`,
        [telefone, nome || "Contato WhatsApp", origem || "WhatsApp", mensagem]
      );

      return res.json({
        success: true,
        message: "Lead criado",
        data: result.rows[0],
      });
    }
  } catch (error) {
    console.error("Erro lead:", error);
    res.status(500).json({ error: "Erro ao processar lead" });
  }
});

app.post("/api/webhooks/interaction", async (req, res) => {
  try {
    const { telefone, mensagem, resposta, intencao, agendamento_realizado } =
      req.body;

    let lead = await pool.query("SELECT id FROM leads WHERE telefone = $1", [
      telefone,
    ]);

    if (lead.rows.length === 0) {
      lead = await pool.query(
        "INSERT INTO leads (telefone, nome, origem) VALUES ($1, $2, $3) RETURNING id",
        [telefone, "Contato WhatsApp", "WhatsApp"]
      );
    }

    await pool.query(
      `INSERT INTO interacoes (lead_id, telefone, mensagem, resposta, intencao, agendamento_realizado) 
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        lead.rows[0].id,
        telefone,
        mensagem,
        resposta,
        intencao,
        agendamento_realizado || false,
      ]
    );

    if (agendamento_realizado) {
      await pool.query(
        "UPDATE leads SET score = LEAST(score + 20, 100), status = $1 WHERE id = $2",
        ["Qualificado", lead.rows[0].id]
      );
    }

    res.json({ success: true, message: "Interacao registrada" });
  } catch (error) {
    console.error("Erro interacao:", error);
    res.status(500).json({ error: "Erro ao registrar interacao" });
  }
});

app.post("/api/webhooks/agendamento", async (req, res) => {
  try {
    const { telefone, nome_cliente, data_hora, duracao, observacoes } =
      req.body;

    const result = await pool.query(
      `INSERT INTO agendamentos 
      (telefone_cliente, nome_cliente, data_hora, duracao, observacoes, origem, criado_por_lara) 
      VALUES ($1, $2, $3, $4, $5, 'WhatsApp', true) 
      RETURNING *`,
      [telefone, nome_cliente, data_hora, duracao || 30, observacoes]
    );

    await pool.query(
      "UPDATE leads SET score = LEAST(score + 30, 100), status = $1 WHERE telefone = $2",
      ["Qualificado", telefone]
    );

    res.json({
      success: true,
      message: "Agendamento criado",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erro agendamento:", error);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
});

app.get("/api/cliente/:telefone", async (req, res) => {
  try {
    const { telefone } = req.params;
    const result = await pool.query(
      "SELECT * FROM vw_cliente_completo WHERE telefone = $1",
      [telefone]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cliente" });
  }
});

app.get("/api/cliente/:telefone/historico", async (req, res) => {
  try {
    const { telefone } = req.params;
    const limit = req.query.limit || 50;
    const result = await pool.query(
      "SELECT * FROM vw_historico_conversas WHERE telefone = $1 LIMIT $2",
      [telefone, limit]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar historico" });
  }
});

app.get("/api/cliente/:telefone/agendamentos", async (req, res) => {
  try {
    const { telefone } = req.params;
    const result = await pool.query(
      `SELECT a.*, s.nome AS servico_nome, f.nome AS funcionario_nome
      FROM agendamentos a
      LEFT JOIN servicos s ON s.id = a.servico_id
      LEFT JOIN funcionarios f ON f.id = a.funcionario_id
      WHERE a.telefone_cliente = $1
      ORDER BY a.data_hora DESC`,
      [telefone]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

app.get("/api/leads", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM leads ORDER BY ultima_interacao DESC LIMIT 100"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar leads" });
  }
});

app.get("/api/agendamentos", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.nome AS servico_nome, f.nome AS funcionario_nome
      FROM agendamentos a
      LEFT JOIN servicos s ON s.id = a.servico_id
      LEFT JOIN funcionarios f ON f.id = a.funcionario_id
      WHERE a.data_hora >= NOW() - INTERVAL '7 days'
      ORDER BY a.data_hora ASC
      LIMIT 100`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar agendamentos" });
  }
});

app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM leads) AS total_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'Qualificado') AS leads_qualificados,
        (SELECT COUNT(*) FROM agendamentos WHERE status = 'Agendado') AS agendamentos_pendentes,
        (SELECT COUNT(*) FROM agendamentos WHERE data_hora >= NOW() AND data_hora < NOW() + INTERVAL '7 days') AS agendamentos_semana,
        (SELECT COUNT(*) FROM n8n_chat_histories WHERE created_at >= NOW() - INTERVAL '24 hours') AS mensagens_24h
    `);
    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar stats" });
  }
});

app.post("/api/ai/qualify-lead", async (req, res) => {
  try {
    if (!model) {
      return res.status(503).json({ error: "Gemini AI nao configurado" });
    }

    const { telefone, mensagem } = req.body;
    const prompt = `Analise esta mensagem e de um score de 0 a 100. Responda APENAS com o numero. Mensagem: ${mensagem}`;
    const result = await model.generateContent(prompt);
    const score = parseInt(result.response.text().trim());
    await pool.query("UPDATE leads SET score = $1 WHERE telefone = $2", [
      score,
      telefone,
    ]);
    res.json({ success: true, score });
  } catch (error) {
    res.status(500).json({ error: "Erro ao qualificar lead" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ClinicFlow API rodando na porta ${PORT}`);
  console.log(`Host: clinicflow.casadf.com.br`);
  console.log(`Database: Supabase PostgreSQL`);
  console.log(`IA: ${genAI ? "Gemini 2.0 Flash" : "Desabilitada"}`);
  console.log(`Sistema pronto!`);
});

