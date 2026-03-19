import React from 'react';
import { Search, User, Users, ShieldCheck as Lock } from 'lucide-react';

export const PrincipalSelector = ({
    identities,
    selectedPrincipals,
    onTogglePrincipal,
    searchTerm,
    onSearchChange
}) => {
    return (
        <div className="glass shadow-xl overflow-hidden rounded-2xl border border-white/5">
            <div className="p-6 bg-white/[0.01] border-b border-white/5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-bold tracking-tight">1. Select Principals</h3>
                        <p className="text-xs text-muted-foreground">Identities requiring access</p>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
                        <input
                            data-testid="principal-search-input"
                            placeholder="Filter idents..."
                            className="h-8 pl-9 text-xs bg-white/5 border border-white/10 focus:bg-white/10 transition-all rounded-lg outline-none text-white w-40 sm:w-56"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className="p-2 max-h-[380px] overflow-y-auto custom-scrollbar">
                {identities
                    .filter(p => !searchTerm ||
                        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map(principal => (
                        <div
                            key={principal.id}
                            data-testid={`principal-option-${principal.id}`}
                            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 cursor-pointer border ${
                                selectedPrincipals.includes(principal.id)
                                    ? "bg-primary/20 border-primary/30"
                                    : "hover:bg-white/[0.04] border-transparent"
                            }`}
                            onClick={() => onTogglePrincipal(principal.id)}
                        >
                            <div className={`p-2.5 rounded-xl shadow-lg transition-all duration-300 flex-shrink-0 ${
                                selectedPrincipals.includes(principal.id)
                                    ? "bg-primary text-white scale-110"
                                    : "bg-white/5 text-muted-foreground"
                            }`}>
                                {principal.type === 'USER' && <User size={16} />}
                                {principal.type === 'GROUP' && <Users size={16} />}
                                {principal.type === 'SERVICE_PRINCIPAL' && <Lock size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-bold text-foreground/90 tracking-tight truncate">{principal.name}</div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.1em] opacity-40 leading-none">
                                        {principal.type?.replace('_', ' ')}
                                    </div>
                                    {principal.email && (
                                        <div className="text-[10px] text-muted-foreground/60 truncate ml-2">
                                            {principal.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                readOnly
                                checked={selectedPrincipals.includes(principal.id)}
                                className="h-4 w-4 rounded accent-primary border-white/20"
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
};
