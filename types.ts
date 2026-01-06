export interface Feature {
  name: string;
  description: string;
  priority: 'Alta' | 'Média' | 'Baixa';
}

export interface Persona {
  role: string;
  age: string;
  painPoints: string[];
  goals: string[];
  description: string;
}

export interface SalesStrategy {
  pitch: string;
  channels: string[];
  monetizationModel: string;
  targetAudience: string;
}

export interface Critique {
  title: string;
  description: string;
  severity: 'Crítico' | 'Moderado' | 'Leve';
  type: 'Técnico' | 'Negócio' | 'UX';
}

export interface DBAnalysis {
  summary: string;
  techStack: string[];
  mermaidDiagram: string;
  schemaCode: string; // Generic name for SQL or NoSQL JSON
  explanation: string;
  strategy: string;
  features: Feature[];
  personas: Persona[];
  sales: SalesStrategy;
  critiques: Critique[];
  improvements: Feature[]; // Reusing Feature type for improvements
}

export interface AnalysisState {
  isLoading: boolean;
  data: DBAnalysis | null;
  error: string | null;
}

export enum DbType {
  POSTGRES = 'POSTGRES',
  FIREBASE = 'FIREBASE'
}

export enum TabView {
  OVERVIEW = 'OVERVIEW', // Visão Geral + Features
  PERSONAS = 'PERSONAS',
  SALES = 'SALES', // Vendas e Estratégia
  CRITIQUE = 'CRITIQUE', // Erros e Melhorias
  TECHNICAL = 'TECHNICAL' // Diagrama + Schema
}