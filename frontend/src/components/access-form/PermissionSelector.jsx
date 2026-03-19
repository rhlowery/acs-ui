import React from 'react';
import { Eye, Edit3, Database, Zap, Play, Cpu, Terminal, HardDrive, Lock, Check } from 'lucide-react';
import { PERMISSIONS } from '../../services/Constants';

const getPermissionIcon = (perm) => {
    const p = perm.toUpperCase();
    if (p.includes('SELECT') || p.includes('READ')) return <Eye size={16} />;
    if (p.includes('MODIFY') || p.includes('WRITE')) return <Edit3 size={16} />;
    if (p.includes('USE') || p.includes('CATALOG') || p.includes('SCHEMA')) return <Database size={16} />;
    if (p.includes('ALL')) return <Zap size={16} />;
    if (p.includes('EXECUTE')) return <Play size={16} />;
    if (p.includes('MODEL')) return <Cpu size={16} />;
    if (p.includes('COMPUTE')) return <Terminal size={16} />;
    if (p.includes('STORAGE')) return <HardDrive size={16} />;
    return <Lock size={16} />;
};

export const PermissionSelector = ({
    selectedPermissions = [],
    onTogglePermission
}) => {
    return (
        <div className="glass shadow-xl overflow-hidden rounded-2xl border border-white/5">
            <div className="p-6 bg-white/[0.01] border-b border-white/5">
                <h3 className="text-base font-bold tracking-tight">2. Select Permissions</h3>
                <p className="text-xs text-muted-foreground">Required action levels</p>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PERMISSIONS.map(perm => {
                        const isSelected = selectedPermissions.includes(perm);
                        return (
                            <div
                                key={perm}
                                data-testid={`permission-toggle-${perm}`}
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                                    isSelected
                                        ? "border-primary/40 bg-primary/10 shadow-[inner_0_0_12px_rgba(88,166,255,0.05)]"
                                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                                }`}
                                onClick={() => onTogglePermission(perm)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                                        isSelected
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                                            : "bg-white/5 text-muted-foreground/50 group-hover:text-muted-foreground/80"
                                    }`}>
                                        {getPermissionIcon(perm)}
                                    </div>
                                    <span className={`text-xs font-bold tracking-tight transition-colors truncate max-w-[120px] ${
                                        isSelected ? "text-primary" : "text-foreground/50 group-hover:text-foreground/80"
                                    }`}>
                                        {perm}
                                    </span>
                                </div>
                                <div className={`h-5 w-5 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 ${
                                    isSelected ? "bg-primary border-primary scale-110 shadow-[0_0_8px_rgba(88,166,255,0.4)]" : "bg-transparent"
                                }`}>
                                    {isSelected && <Check size={12} className="text-white" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
