import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DBAnalysis, DbType } from "../types";

const apiKey = process.env.API_KEY;

// Schema definition for the structured output we want from Gemini
const analysisResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "Um resumo conciso do propósito do repositório em Português.",
    },
    techStack: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de tecnologias detectadas.",
    },
    mermaidDiagram: {
      type: Type.STRING,
      description: "String de definição do diagrama Mermaid (erDiagram).",
    },
    schemaCode: {
      type: Type.STRING,
      description: "O código SQL (DDL) ou JSON/Regras (Firebase) gerado.",
    },
    explanation: {
      type: Type.STRING,
      description: "Explicação técnica detalhada em Português.",
    },
    strategy: {
      type: Type.STRING,
      description: "Estratégia técnica e de produto de alto nível em Português.",
    },
    features: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["Alta", "Média", "Baixa"] }
        },
        required: ["name", "description", "priority"]
      }
    },
    personas: {
      type: Type.ARRAY,
      description: "Lista de 2 a 3 personas alvo para este produto.",
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING, description: "Papel (ex: Gerente de Marketing)" },
          age: { type: Type.STRING, description: "Faixa etária aproximada" },
          description: { type: Type.STRING, description: "Breve biografia" },
          painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          goals: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["role", "age", "description", "painPoints", "goals"]
      }
    },
    sales: {
      type: Type.OBJECT,
      description: "Estratégia de vendas e marketing.",
      properties: {
        pitch: { type: Type.STRING, description: "Elevator pitch de venda" },
        channels: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Canais de aquisição recomendados" },
        monetizationModel: { type: Type.STRING, description: "Como ganhar dinheiro (SaaS, Ads, etc)" },
        targetAudience: { type: Type.STRING, description: "Público alvo resumido" }
      },
      required: ["pitch", "channels", "monetizationModel", "targetAudience"]
    },
    critiques: {
      type: Type.ARRAY,
      description: "Erros comuns ou pontos de falha na ideia atual.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Crítico", "Moderado", "Leve"] },
          type: { type: Type.STRING, enum: ["Técnico", "Negócio", "UX"] }
        },
        required: ["title", "description", "severity", "type"]
      }
    },
    improvements: {
      type: Type.ARRAY,
      description: "Sugestões de melhorias para transformar o protótipo em produto.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["Alta", "Média", "Baixa"] }
        },
        required: ["name", "description", "priority"]
      }
    }
  },
  required: ["summary", "techStack", "mermaidDiagram", "schemaCode", "explanation", "strategy", "features", "personas", "sales", "critiques", "improvements"],
};

export const analyzeRepository = async (repoUrl: string, dbType: DbType): Promise<DBAnalysis> => {
  if (!apiKey) {
    throw new Error("A chave de API está faltando.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-3-pro-preview";

  let dbInstructions = "";
  if (dbType === DbType.POSTGRES) {
    dbInstructions = `
      3. Projete um esquema de banco de dados normalizado (PostgreSQL).
      4. Forneça o Diagrama Entidade-Relacionamento (ERD) usando sintaxe Mermaid.js.
      5. Escreva os comandos SQL DDL para criar as tabelas e relacionamentos no campo 'schemaCode'.
    `;
  } else {
    dbInstructions = `
      3. Projete uma estrutura de banco de dados NoSQL orientada a documentos para Firebase (Firestore).
      4. Forneça um diagrama Mermaid visualizando as Coleções e Sub-coleções.
      5. No campo 'schemaCode', forneça um JSON representando a estrutura de dados E as regras básicas de segurança (firestore.rules).
    `;
  }

  const prompt = `
    Analise o repositório GitHub: ${repoUrl}
    
    Contexto: Este código provavelmente foi gerado por prototipagem rápida ou pelo Google AI Studio. 
    Seu objetivo é atuar como um CTO e CPO (Chief Product Officer) experiente para transformar isso em um produto real.

    Instruções:
    1. Use o Google Search para entender o conteúdo do repositório, README e estrutura.
    2. Infira a lógica de negócio e requisitos de dados.
    ${dbInstructions}
    6. Explique suas escolhas técnicas.
    7. Defina uma estratégia técnica e de produto.
    8. Crie Personas detalhadas para quem usaria isso.
    9. Crie uma Estratégia de Vendas (Como vender, onde anunciar, como cobrar).
    10. Aponte "Erros/Falhas" comuns em apps desse tipo (bugs lógicos, falhas de segurança, UX ruim).
    11. Sugira "Melhorias" concretas para profissionalizar o app.

    Responda TUDO estritamente em Português do Brasil.
    Garanta que o diagrama mermaid use sintaxe 'erDiagram' válida.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: analysisResponseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta do Gemini.");

    try {
      return JSON.parse(text) as DBAnalysis;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Falha ao processar a resposta da IA.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Erro ao analisar o repositório.");
  }
};