import React from 'react';
import { Database, FolderIcon, TableIcon, X } from 'lucide-react';

export const NodeIcon = ({ type, size = 14 }) => {
    if (type === 'catalog') return <Database size={size} />;
    if (type === 'schema') return <FolderIcon size={size} />;
    return <TableIcon size={size} />;
};

export const SelectedObjectsList = ({ selectedObjects = [], onClearSelection }) => {
    return (
        <div className="glass border border-white/5 bg-background/40 backdrop-blur-xl overflow-hidden shadow-2xl rounded-2xl">
            <div className="bg-white/[0.02] border-b border-white/5 py-4 px-6 flex justify-between items-center">
                <div>
                    <h4 className="text-lg font-bold tracking-tight text-primary/90">Selected Objects</h4>
                    <p className="text-xs uppercase tracking-widest opacity-60">
                        Requesting access to {selectedObjects.length} object{selectedObjects.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button 
                    onClick={onClearSelection} 
                    className="h-8 px-4 text-xs bg-transparent border border-white/10 rounded-lg hover:bg-destructive/10 hover:text-red-400 text-white transition-all"
                >
                    Clear Selection
                </button>
            </div>
            <div className="p-6">
                <div className="flex flex-wrap gap-2">
                    {selectedObjects.map(obj => (
                        <div key={obj.id || obj.path} className="pl-1.5 pr-2.5 py-1.5 gap-2 flex items-center bg-white/5 border border-white/5 rounded-lg text-[11px] font-medium hover:bg-white/10 transition-colors text-white">
                            <NodeIcon type={obj.type} />
                            <span className="opacity-50 font-normal uppercase tracking-tighter">{obj.type}:</span>
                            <span className="text-foreground/90">{obj.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
