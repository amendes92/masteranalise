import React, { useEffect, useRef, useState } from 'react';

// Declare mermaid global for TypeScript since we loaded it via CDN
declare global {
  interface Window {
    mermaid: any;
  }
}

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart || !window.mermaid) return;

      try {
        // Reset previous error
        setError(null);
        
        // Use a unique ID for each render to avoid conflicts
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // mermaid.render returns an object { svg: string } in newer versions
        // or just the string in older ones. Handling both safely.
        const { svg } = await window.mermaid.render(id, chart);
        setSvgContent(svg);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Failed to render diagram syntax. The AI might have generated invalid Mermaid code.");
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200">
        <p className="text-sm font-medium mb-2">Render Error</p>
        <p className="text-xs opacity-75">{error}</p>
        <pre className="mt-4 p-2 bg-black/50 rounded text-xs overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-x-auto bg-gray-900/50 p-4 rounded-lg flex justify-center items-center min-h-[300px] border border-gray-800"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default MermaidDiagram;