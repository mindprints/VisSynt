
import React from 'react';
import { VisualizationSource } from '../types';

interface VisualCardProps {
  viz: VisualizationSource;
  index: number;
}

const VisualCard: React.FC<VisualCardProps> = ({ viz, index }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'chart': return '📊';
      case 'photo': return '📷';
      case 'diagram': return '📐';
      case 'map': return '🗺️';
      default: return '🖼️';
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{getIcon(viz.type)}</span>
        <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
          {index + 1}. {viz.title}
        </h4>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed">
        {viz.description}
      </p>
    </div>
  );
};

export default VisualCard;
