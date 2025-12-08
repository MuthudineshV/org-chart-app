import type { Node, Edge } from '@xyflow/react';
import type { EmployeeNodeData } from './components/EmployeeNode';

export const initialNodes: Node<EmployeeNodeData>[] = [
    {
        id: '1',
        type: 'employee',
        position: { x: 0, y: 0 },
        data: {
            name: 'Jane Doe',
            designation: 'CEO',
            department: 'Executive',
        },
    },
];

export const initialEdges: Edge[] = [];
