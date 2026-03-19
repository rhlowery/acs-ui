import React from 'react';
import { Key } from 'lucide-react';

export const ConstraintSelector = ({
    timeConstraint = { type: 'PERMANENT', value: 1, start: '', end: '' },
    onTimeConstraintChange,
    justification = '',
    onJustificationChange
}) => {
    return (
        <div className="glass shadow-2xl overflow-hidden rounded-2xl border border-white/5 p-6">
            <div className="pb-4">
                <h3 className="text-base font-bold tracking-tight">3. Constraints & Justification</h3>
                <p className="text-xs text-muted-foreground">Duration and reason for access</p>
            </div>
            <div className="space-y-8 mt-4">
                <div className="space-y-5">
                    <label className="text-primary/70 uppercase text-[11px] font-bold tracking-[0.2em] mb-4 block">Time Constraint</label>
                    <div className="flex flex-wrap gap-8">
                        {['PERMANENT', 'DURATION', 'RANGE'].map(type => (
                            <div key={type} className="flex items-center space-x-3 group cursor-pointer" 
                                 onClick={() => onTimeConstraintChange({ ...timeConstraint, type })}>
                                <input 
                                    type="radio" 
                                    name="timeConstraint" 
                                    id={type.toLowerCase()} 
                                    checked={timeConstraint.type === type}
                                    readOnly
                                    className="accent-primary h-4 w-4"
                                />
                                <label htmlFor={type.toLowerCase()} className={`text-sm font-semibold transition-opacity duration-300 ${
                                    timeConstraint.type === type ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                                }`}>
                                    {type === 'PERMANENT' ? 'Permanent' : type === 'DURATION' ? 'Hours' : 'Date Range'}
                                </label>
                            </div>
                        ))}
                    </div>

                    {timeConstraint.type === 'DURATION' && (
                        <div className="pl-7 mt-4 animate-in slide-in-from-left-2 duration-500 max-w-[180px]">
                            <label className="text-[11px] uppercase tracking-widest opacity-50 mb-2 block">Hours</label>
                            <input
                                type="number"
                                data-testid="duration-input"
                                min="1"
                                className="bg-white/5 border border-white/10 focus:border-primary/50 rounded-lg p-2 text-white outline-none w-full"
                                value={timeConstraint.value || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    onTimeConstraintChange({
                                        ...timeConstraint,
                                        value: val === '' ? 0 : parseInt(val)
                                    });
                                }}
                            />
                        </div>
                    )}

                    {timeConstraint.type === 'RANGE' && (
                        <div className="pl-7 mt-4 animate-in slide-in-from-left-2 duration-500 flex gap-4 max-w-md">
                            <div className="flex-1">
                                <label htmlFor="startDate" className="text-[11px] uppercase tracking-widest opacity-50 mb-2 block text-white/50">Start Date</label>
                                <input
                                    id="startDate"
                                    type="date"
                                    className="bg-white/5 border border-white/10 focus:border-primary/50 rounded-lg p-2 text-white outline-none w-full"
                                    value={timeConstraint.start}
                                    onChange={(e) => onTimeConstraintChange({ ...timeConstraint, start: e.target.value })}
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="endDate" className="text-[11px] uppercase tracking-widest opacity-50 mb-2 block text-white/50">End Date</label>
                                <input
                                    id="endDate"
                                    type="date"
                                    className="bg-white/5 border border-white/10 focus:border-primary/50 rounded-lg p-2 text-white outline-none w-full"
                                    value={timeConstraint.end}
                                    onChange={(e) => onTimeConstraintChange({ ...timeConstraint, end: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full h-[1px] bg-white/10" />

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                            <Key size={14} />
                        </div>
                        <label htmlFor="justification" className="text-foreground/90 uppercase text-[10px] font-black tracking-[0.2em]">Justification & Rational</label>
                    </div>
                    <textarea
                        id="justification"
                        data-testid="justification-input"
                        placeholder="Provide details on the business requirement for this access..."
                        className="min-h-[160px] w-full resize-none bg-white/[0.02] border border-white/10 focus:border-primary/40 focus:bg-white/[0.04] rounded-2xl transition-all duration-500 p-6 text-sm leading-relaxed shadow-inner outline-none text-white"
                        value={justification}
                        onChange={(e) => onJustificationChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
