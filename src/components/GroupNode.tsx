import { NodeResizer } from '@xyflow/react';
import { useState } from 'react';

type GroupNodeProps = {
    id: string;
    label: string;
    onLabelChange: (id: string, newLabel: string) => void;
};

export const GroupNode = ({ id, label, onLabelChange }: GroupNodeProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempLabel, setTempLabel] = useState(label);

    const handleBlur = () => {
        setIsEditing(false);
        onLabelChange(id, tempLabel);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleBlur();
    };

    return (
        <div style={{ width: '100%', height: '100%', minWidth: 200, minHeight: 150 }}>
            {/* Use NodeResizer to allow resizing the node */}
            <NodeResizer minWidth={200} minHeight={150} isVisible={true} lineStyle={{ border: '1px solid #3b82f6' }} handleStyle={{ width: 8, height: 8 }} />

            <div className="absolute inset-0 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg pointer-events-none" />

            {/* Editable Label */}
            <div className="absolute top-2 left-4 pointer-events-auto">
                {isEditing ? (
                    <input
                        autoFocus
                        value={tempLabel}
                        onChange={(e) => setTempLabel(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent text-sm font-bold text-slate-200 border-b border-blue-500 outline-none uppercase tracking-wider"
                    />
                ) : (
                    <div
                        onDoubleClick={() => setIsEditing(true)}
                        className="text-xs font-bold text-slate-400 uppercase tracking-widest cursor-text"
                    >
                        {label}
                    </div>
                )}
            </div>
        </div>
    );
};
