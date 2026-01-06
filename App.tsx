import React, { useState } from 'react';
import { analyzeRepository } from './services/geminiService';
import { AnalysisState, TabView, DbType } from './types';
import MermaidDiagram from './components/MermaidDiagram';
import CodeBlock from './components/CodeBlock';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [dbType, setDbType] = useState<DbType>(DbType.POSTGRES);
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    data: null,
    error: null,
  });
  const [activeTab, setActiveTab] = useState<TabView>(TabView.OVERVIEW);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!url.includes('github.com')) {
        setState(prev => ({ ...prev, error: "Por favor, insira uma URL válida do GitHub." }));
        return;
    }

    setState({ isLoading: true, data: null, error: null });
    setActiveTab(TabView.OVERVIEW); // Reset to first tab

    try {
      const result = await analyzeRepository(url, dbType);
      setState({ isLoading: false, data: result, error: null });
    } catch (err: any) {
      setState({ 
        isLoading: false, 
        data: null, 
        error: err.message || "Algo deu errado ao analisar o repositório." 
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'Alta': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Média': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Baixa': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-700 text-gray-300';
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Crítico': return 'bg-red-600 text-white';
      case 'Moderado': return 'bg-orange-500 text-white';
      case 'Leve': return 'bg-blue-500 text-white';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-indigo-500/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
          Repo<span className="text-indigo-500">Analyzer</span> AI
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-400">
          Transforme protótipos do GitHub em produtos reais. Gere personas, estratégia de vendas, correções e arquitetura técnica.
        </p>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-4xl mb-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* DB Selection */}
          <div className="flex justify-center gap-4 mb-2">
            <button
              type="button"
              onClick={() => setDbType(DbType.POSTGRES)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
                dbType === DbType.POSTGRES 
                ? 'bg-blue-900/40 border-blue-500 text-blue-200 shadow-blue-900/20 shadow-lg' 
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
              PostgreSQL (SQL)
            </button>
            <button
              type="button"
              onClick={() => setDbType(DbType.FIREBASE)}
              className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
                dbType === DbType.FIREBASE 
                ? 'bg-orange-900/40 border-orange-500 text-orange-200 shadow-orange-900/20 shadow-lg' 
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M13.84 2.82l-1.3-1.3c-.38-.38-1.01-.38-1.39 0l-1.3 1.3c-.38.38-.38 1.01 0 1.39l1.3 1.3c.38.38 1.01.38 1.39 0l1.3-1.3c.38-.38.38-1.01 0-1.39zm-9.35 9.35l-1.3-1.3c-.38-.38-1.01-.38-1.39 0l-1.3 1.3c-.38.38-.38 1.01 0 1.39l1.3 1.3c.38.38 1.01.38 1.39 0l1.3-1.3c.38-.38.38-1.01 0-1.39zm18.7 0l-1.3-1.3c-.38-.38-1.01-.38-1.39 0l-1.3 1.3c-.38.38-.38 1.01 0 1.39l1.3 1.3c.38.38 1.01.38 1.39 0l1.3-1.3c.38-.38.38-1.01 0-1.39z"/></svg>
              Firebase (NoSQL)
            </button>
          </div>

          <div className="relative group w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-gray-900 rounded-lg p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 ml-3 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/usuario/repositorio"
                className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder-gray-500 text-lg py-2"
                disabled={state.isLoading}
              />
              <button
                type="submit"
                disabled={state.isLoading}
                className={`ml-2 px-6 py-3 rounded-md font-semibold text-white transition-all
                  ${state.isLoading 
                    ? 'bg-gray-700 cursor-not-allowed opacity-75' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg'
                  }`}
              >
                {state.isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analisando...
                  </span>
                ) : (
                  'Gerar Análise'
                )}
              </button>
            </div>
          </div>
        </form>
        {state.error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200 flex items-center animate-fade-in">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {state.error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {state.data && (
        <div className="w-full max-w-6xl animate-fade-in-up">
          
          {/* Summary Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resumo do Projeto
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">{state.data.summary}</p>
            <div className="flex flex-wrap gap-2">
              {state.data.techStack.map((tech, idx) => (
                <span key={idx} className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs font-mono text-indigo-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-800 mb-6 overflow-x-auto">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: TabView.OVERVIEW, label: 'Visão Geral & Features' },
                { id: TabView.PERSONAS, label: 'Personas Alvo' },
                { id: TabView.SALES, label: 'Estratégia & Vendas' },
                { id: TabView.CRITIQUE, label: 'Erros & Melhorias' },
                { id: TabView.TECHNICAL, label: 'Técnico & Banco de Dados' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-500'
                      : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'}
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-1 min-h-[400px]">
            
            {/* 1. VISÃO GERAL */}
            {activeTab === TabView.OVERVIEW && (
              <div className="p-6">
                 <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    Estratégia do Produto
                  </h3>
                  <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
                     <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{state.data.strategy}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4">Funcionalidades Sugeridas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {state.data.features.map((feature, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-indigo-400 text-lg">{feature.name}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${getPriorityColor(feature.priority)}`}>
                          {feature.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. PERSONAS */}
            {activeTab === TabView.PERSONAS && (
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.data.personas.map((persona, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                    <div className="bg-indigo-900/30 p-4 border-b border-gray-700">
                      <h3 className="text-xl font-bold text-white">{persona.role}</h3>
                      <p className="text-indigo-300 text-sm">{persona.age}</p>
                    </div>
                    <div className="p-5 flex-1 flex flex-col gap-4">
                      <p className="text-gray-300 italic text-sm">"{persona.description}"</p>
                      
                      <div>
                        <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-2">Dores & Problemas</p>
                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                          {persona.painPoints.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-2">Objetivos</p>
                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                          {persona.goals.map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
               </div>
            )}

            {/* 3. VENDAS */}
            {activeTab === TabView.SALES && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pitch Card */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/40 to-gray-900 border border-indigo-500/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Elevator Pitch</h3>
                    <p className="text-lg text-indigo-100 italic leading-relaxed">
                      "{state.data.sales.pitch}"
                    </p>
                  </div>

                  {/* Audience Card */}
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-2">Público Alvo</h3>
                    <p className="text-gray-400">{state.data.sales.targetAudience}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Channels */}
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                       <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                       Canais de Aquisição
                    </h3>
                    <ul className="space-y-2">
                      {state.data.sales.channels.map((channel, i) => (
                        <li key={i} className="flex items-center text-gray-300 bg-gray-900/50 p-2 rounded">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                          {channel}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Monetization */}
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Modelo de Monetização
                    </h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{state.data.sales.monetizationModel}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. CRÍTICAS & MELHORIAS */}
            {activeTab === TabView.CRITIQUE && (
              <div className="p-6">
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Erros Comuns & Pontos de Atenção
                  </h3>
                  <div className="space-y-4">
                    {state.data.critiques.map((critique, idx) => (
                      <div key={idx} className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${getSeverityColor(critique.severity)}`}>
                            {critique.severity}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-red-200">{critique.title} <span className="text-xs opacity-50 ml-2 border border-red-800 px-1 rounded">{critique.type}</span></h4>
                          <p className="text-red-300/80 text-sm mt-1">{critique.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                   <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Melhorias para Profissionalizar
                  </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.data.improvements.map((improvement, idx) => (
                      <div key={idx} className="bg-green-900/10 border border-green-900/30 p-4 rounded-lg">
                         <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-green-200">{improvement.name}</h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${getPriorityColor(improvement.priority)}`}>
                            {improvement.priority}
                          </span>
                        </div>
                        <p className="text-green-300/70 text-sm">{improvement.description}</p>
                      </div>
                    ))}
                   </div>
                </div>
              </div>
            )}

            {/* 5. TÉCNICO */}
            {activeTab === TabView.TECHNICAL && (
              <div>
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-white font-bold mb-4 ml-2">Diagrama de Entidade-Relacionamento</h3>
                  <MermaidDiagram chart={state.data.mermaidDiagram} />
                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Renderizado com Mermaid.js. {dbType === DbType.FIREBASE ? 'Visualizando Coleções e Documentos.' : 'Visualizando Tabelas e Relacionamentos.'}
                  </p>
                </div>
                
                <div className="p-4">
                  <h3 className="text-white font-bold mb-2 ml-2">
                    {dbType === DbType.POSTGRES ? 'Schema SQL (DDL)' : 'Estrutura JSON & Regras de Segurança'}
                  </h3>
                  <CodeBlock code={state.data.schemaCode} language={dbType === DbType.POSTGRES ? 'sql' : 'json'} />
                </div>

                <div className="p-6 prose prose-invert max-w-none border-t border-gray-800">
                  <h3 className="text-white font-bold mb-2">Explicação Técnica</h3>
                  <div className="whitespace-pre-wrap text-gray-300">
                    {state.data.explanation}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-600 text-sm pb-10">
        <p>Desenvolvido com Google Gemini 2.5 & 3 Pro • Não afiliado ao GitHub ou Google</p>
      </footer>
    </div>
  );
};

export default App;