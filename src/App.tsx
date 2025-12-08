import { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  ReactFlowProvider,
  Handle,
  Position,
  getConnectedEdges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { User, Plus, Save, X, Trash2 } from 'lucide-react';

const CARD_WIDTH = 300;
const CARD_HEIGHT = 120;
const GAP = 100;

// Data Type
type EmployeeData = {
  name: string;
  designation: string;
  department: string;
  photoUrl?: string;
};

// Employee Card Component (Workaround: Used as Label)
type EmployeeCardProps = EmployeeData & {
  id: string;
  onAddNode: (sourceId: string, direction: 'top' | 'bottom' | 'left' | 'right') => void;
  onUpdateNode: (id: string, newData: EmployeeData) => void;
  onDeleteNode: (id: string) => void;
};

const EmployeeCard = ({ id, name, designation, department, photoUrl, onAddNode, onUpdateNode, onDeleteNode }: EmployeeCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({ name, designation, department, photoUrl });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdateNode(id, tempData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData({ name, designation, department, photoUrl });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  if (isEditing) {
    return (
      <div className="group relative w-[300px] h-[120px] bg-[#0B1121] border border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-xl p-4 z-50 flex flex-col justify-center">
        {/* Handles */}
        <Handle type="target" position={Position.Top} className="!bg-transparent" />
        <Handle type="source" position={Position.Bottom} className="!bg-transparent" />
        <Handle type="target" position={Position.Left} className="!bg-transparent" />
        <Handle type="source" position={Position.Right} className="!bg-transparent" />

        <div className="flex flex-col gap-2 h-full">
          <input
            ref={inputRef}
            className="nodrag bg-transparent text-xl font-semibold text-white border-b border-gray-600 focus:outline-none focus:border-blue-500 w-full placeholder-gray-500"
            value={tempData.name}
            onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
            placeholder="Name"
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-2">
            <input
              className="nodrag bg-transparent text-xs uppercase tracking-wider text-gray-400 border-b border-gray-600 focus:outline-none focus:border-blue-500 w-1/2 placeholder-gray-600"
              value={tempData.designation}
              onChange={(e) => setTempData({ ...tempData, designation: e.target.value })}
              placeholder="ROLE"
              onKeyDown={handleKeyDown}
            />
            <input
              className="nodrag bg-transparent text-xs text-gray-400 border-b border-gray-600 focus:outline-none focus:border-blue-500 w-1/2 placeholder-gray-600"
              value={tempData.department}
              onChange={(e) => setTempData({ ...tempData, department: e.target.value })}
              placeholder="DEPT"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="flex justify-end gap-2 mt-auto">
            <button onClick={handleCancel} className="p-1 hover:bg-white/10 rounded text-red-400 transition-colors">
              <X size={14} />
            </button>
            <button onClick={handleSave} className="p-1 hover:bg-white/10 rounded text-blue-400 transition-colors">
              <Save size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative w-[300px] h-[120px]"
      onDoubleClick={() => setIsEditing(true)}
    >
      {/* Glow Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] to-[#0B1121] rounded-xl border border-blue-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(30,58,138,0.6)] group-hover:border-blue-500/50"></div>

      {/* Top Border Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

      {/* Delete Button - Top Right */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteNode(id); }}
          className="p-1.5 rounded-full bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white border border-red-900/50 transition-all cursor-pointer pointer-events-auto"
          title="Delete Node"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Plus Buttons - Visible on Hover */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-top-10 z-50">
        <button
          onClick={(e) => { e.stopPropagation(); onAddNode(id, 'top'); }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e293b] text-blue-400 border border-blue-900 shadow-lg hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all cursor-pointer pointer-events-auto"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-bottom-10 z-50">
        <button
          onClick={(e) => { e.stopPropagation(); onAddNode(id, 'bottom'); }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e293b] text-blue-400 border border-blue-900 shadow-lg hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all cursor-pointer pointer-events-auto"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-left-10 z-50">
        <button
          onClick={(e) => { e.stopPropagation(); onAddNode(id, 'left'); }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e293b] text-blue-400 border border-blue-900 shadow-lg hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all cursor-pointer pointer-events-auto"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-right-10 z-50">
        <button
          onClick={(e) => { e.stopPropagation(); onAddNode(id, 'right'); }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e293b] text-blue-400 border border-blue-900 shadow-lg hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all cursor-pointer pointer-events-auto"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-none" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-none" />

      {/* Card UI */}
      <div className="relative flex h-full items-center p-4 cursor-pointer z-10" title="Double click to edit">
        {/* Avatar */}
        <div className="shrink-0 mr-5">
          <div className="h-16 w-16 rounded-full bg-gradient-to-b from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center shadow-inner overflow-hidden">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="h-full w-full object-cover opacity-80 mix-blend-screen" /> // Simplified mix-blend for effect
            ) : (
              <User size={36} className="text-gray-500 opacity-50" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-start min-w-0 flex-1">
          <h3 className="text-2xl font-semibold text-white tracking-tight truncate w-full text-left drop-shadow-md font-['Barlow']">
            {name}
          </h3>
          <p className="text-[10px] uppercase tracking-[0.15em] text-blue-200/70 font-medium mt-1 mb-2 font-['Barlow']">
            {designation}
          </p>

          <span className="inline-flex items-center rounded-full bg-gray-700/50 px-2 py-0.5 text-[10px] font-medium text-gray-300 border border-gray-600/50">
            {department}
          </span>
        </div>
      </div>
    </div>
  );
};


function App() {
  // Initial Nodes State
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 1.5 } }, eds)),
    [setEdges],
  );

  const handlers = useRef<{
    addNode: (sourceId: string, direction: 'top' | 'bottom' | 'left' | 'right') => void;
    updateNode: (id: string, data: EmployeeData) => void;
    deleteNode: (id: string) => void;
  }>({ addNode: () => { }, updateNode: () => { }, deleteNode: () => { } });

  const _addNode = useCallback((...args: Parameters<typeof handlers.current.addNode>) => handlers.current.addNode(...args), []);
  const _updateNode = useCallback((...args: Parameters<typeof handlers.current.updateNode>) => handlers.current.updateNode(...args), []);
  const _deleteNode = useCallback((...args: Parameters<typeof handlers.current.deleteNode>) => handlers.current.deleteNode(...args), []);

  useEffect(() => {
    handlers.current.addNode = (sourceId, direction) => {
      setNodes((currentNodes) => {
        const sourceNode = currentNodes.find((n) => n.id === sourceId);
        if (!sourceNode) return currentNodes;
        const newId = uuidv4();
        const position = { ...sourceNode.position };
        switch (direction) {
          case 'top': position.y -= (CARD_HEIGHT + GAP); break;
          case 'bottom': position.y += (CARD_HEIGHT + GAP); break;
          case 'left': position.x -= (CARD_WIDTH + GAP); break;
          case 'right': position.x += (CARD_WIDTH + GAP); break;
        }
        const newNode: Node = {
          id: newId, position,
          style: { background: 'transparent', border: 'none', padding: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
          data: { label: <EmployeeCard id={newId} name="New Employee" designation="ROLE" department="DEPT" onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} /> },
        };
        const newEdge: Edge = { id: `e${sourceId}-${newId}`, source: sourceId, target: newId, type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 1.5 } };
        if (direction === 'top') setEdges((eds) => eds.concat({ ...newEdge, source: newId, target: sourceId }));
        else setEdges((eds) => eds.concat(newEdge));
        return [...currentNodes, newNode];
      });
    };

    handlers.current.updateNode = (id, newData) => {
      setNodes((nds) => nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, label: <EmployeeCard id={id} {...newData} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} /> } };
        }
        return n;
      }));
    };

    handlers.current.deleteNode = (id) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      // Edges connected to this node will be automatically removed by React Flow if using default `onNodesChange` properly?
      // Actually, onNodesChange handles selection/drag/etc.
      // For explicit deletion, we usually need to filter edges too.
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    };
  }, [setNodes, setEdges, _addNode, _updateNode, _deleteNode]);

  // Initial Node Effect
  useEffect(() => {
    // Check if EMPTY.
    // We need to check inside setNodes to be atomic or just check prop?
    // Since this effect runs on mount, `nodes` is empty.
    // But we need to use `setNodes` carefully.
    if (nodes.length === 0) {
      const initialId = '1';
      setNodes([{
        id: initialId,
        position: { x: 0, y: 0 },
        style: { background: 'transparent', border: 'none', padding: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
        data: {
          label: <EmployeeCard
            id={initialId}
            name="Gokul"
            designation="LEAD TEST ENGINEER"
            department="QC"
            onAddNode={_addNode}
            onUpdateNode={_updateNode}
            onDeleteNode={_deleteNode}
          />
        },
      }]);
    }
  }, []); // Run once on mount.

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020617' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap style={{ backgroundColor: '#0f172a' }} nodeColor="#3b82f6" maskColor="rgba(0, 0, 0, 0.6)" />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
      </ReactFlow>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  );
}
