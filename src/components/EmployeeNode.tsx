import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export type EmployeeNodeData = {
    name: string;
    designation: string;
    department: string;
    photoUrl?: string;
    onAddNode?: (sourceId: string, direction: 'top' | 'bottom' | 'left' | 'right') => void;
};
export type EmployeeNode = Node<EmployeeNodeData>;

const EmployeeNodeComponent = ({ data }: NodeProps<EmployeeNode>) => {
    // This component is currently unused in App.tsx (workaround active), 
    // but kept valid to satisfy linter/build.
    return (
        <div style={{ padding: 10, background: 'white', border: '1px solid #ddd', borderRadius: 4 }}>
            <Handle type="target" position={Position.Top} />
            <div>{data.name}</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default memo(EmployeeNodeComponent);
