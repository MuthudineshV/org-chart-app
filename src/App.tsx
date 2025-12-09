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
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { User, Plus, Save, X, Trash2, Download, Upload, Group, Ungroup, RotateCcw, Eraser, PlusCircle } from 'lucide-react';
import { GroupNode } from './components/GroupNode';

const CARD_WIDTH = 300;
const CARD_HEIGHT = 120;
const GAP = 100;


// Data Type
type EmployeeData = {
  name: string;
  designation: string;
  department: string;
  photoUrl?: string;
  themeColor?: string; // Hex color for tinting
};

// Node Data Interface
interface CustomNodeData extends Record<string, unknown> {
  label: React.ReactNode;
  employee?: EmployeeData; // Raw data for persistence
  isGroup?: boolean;       // Flag to identify groups
  groupLabel?: string;     // Label for group
}

// Employee Card Component (Workaround: Used as Label)
type EmployeeCardProps = EmployeeData & {
  id: string;
  isDeletable: boolean;
  onAddNode: (sourceId: string, direction: 'top' | 'bottom' | 'left' | 'right') => void;
  onUpdateNode: (id: string, newData: EmployeeData) => void;
  onDeleteNode: (id: string) => void;
};

const EmployeeCard = ({ id, name, designation, department, photoUrl, themeColor, isDeletable, onAddNode, onUpdateNode, onDeleteNode }: EmployeeCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({ name, designation, department, photoUrl, themeColor });
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
    setTempData({ name, designation, department, photoUrl, themeColor });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const activeColor = tempData.themeColor || '#3b82f6'; // Default Blue

  if (isEditing) {
    return (
      <div
        className="group relative w-[300px] h-[120px] rounded-xl p-4 z-50 flex flex-col justify-center"
        style={{
          background: '#0B1121', // Solid dark background for editing to reduce visual noise
          border: `1px solid ${activeColor}`,
          boxShadow: `0 0 20px ${activeColor}80`
        }}
      >
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

  // Non-Editing View: Dynamic Glassmorphism
  const color = themeColor || '#3b82f6';

  return (
    <div
      className="group relative w-[300px] h-[120px] backdrop-blur-md rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] flex items-center gap-4"
      style={{
        background: `linear-gradient(135deg, ${color}CC 0%, ${color}33 100%)`,
        borderColor: `${color}66`,
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
      onDoubleClick={() => setIsEditing(true)}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-blue-400/50 !border-none" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-blue-400/50 !border-none" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-blue-400/50 !border-none opacity-0" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-400/50 !border-none opacity-0" />

      {/* Delete Button - Top Right */}
      {isDeletable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteNode(id); }}
            className="p-1.5 rounded-full bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white border border-red-900/50 transition-all cursor-pointer pointer-events-auto"
            title="Delete Node"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

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

      {/* Content */}
      <div className="flex h-full items-center p-4 cursor-pointer z-10 w-full" title="Double click to edit">
        {/* Avatar */}
        <div className="shrink-0 mr-5">
          <div className="h-16 w-16 rounded-full bg-gradient-to-b from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center shadow-inner overflow-hidden">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="h-full w-full object-cover opacity-80 mix-blend-screen" />
            ) : (
              <User size={36} className="text-gray-500 opacity-50" />
            )}
          </div>
        </div>

        {/* Text Details */}
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
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { getNodes } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Toolbar Handlers ---
  const onColorChange = useCallback((color: string) => {
    setNodes((nds) => nds.map((n) => {
      if (n.selected && !(n.data as CustomNodeData).isGroup) {
        // It's a selected employee node
        const currentData = n.data.employee as EmployeeData;
        const newData = { ...currentData, themeColor: color };
        return {
          ...n,
          data: {
            ...n.data,
            employee: newData,
            // Re-render label with new color
            label: (
              <EmployeeCard
                id={n.id}
                {...newData}
                isDeletable={true} // Simplified for selection
                onAddNode={_addNode}
                onUpdateNode={_updateNode}
                onDeleteNode={_deleteNode}
              />
            )
          }
        };
      }
      return n;
    }));
  }, [setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 1.5 } }, eds)),
    [setEdges],
  );

  const handlers = useRef<{
    addNode: (sourceId: string, direction: 'top' | 'bottom' | 'left' | 'right') => void;
    updateNode: (id: string, data: EmployeeData) => void;
    deleteNode: (id: string) => void;
    updateGroupLabel: (id: string, label: string) => void;
  }>({ addNode: () => { }, updateNode: () => { }, deleteNode: () => { }, updateGroupLabel: () => { } });

  const _addNode = useCallback((...args: Parameters<typeof handlers.current.addNode>) => handlers.current.addNode(...args), []);
  const _updateNode = useCallback((...args: Parameters<typeof handlers.current.updateNode>) => handlers.current.updateNode(...args), []);
  const _deleteNode = useCallback((...args: Parameters<typeof handlers.current.deleteNode>) => handlers.current.deleteNode(...args), []);
  const _updateGroupLabel = useCallback((...args: Parameters<typeof handlers.current.updateGroupLabel>) => handlers.current.updateGroupLabel(...args), []);

  const createNodeWithLabel = useCallback((node: Node, isDeletable: boolean) => {
    const data = node.data as CustomNodeData;

    // Handling Group Nodes
    if (data.isGroup) {
      return {
        ...node,
        style: { ...node.style, zIndex: -1 }, // Ensure groups are behind
        data: {
          ...data,
          label: <GroupNode id={node.id} label={data.groupLabel || "GROUP"} onLabelChange={_updateGroupLabel} />
        }
      };
    }

    // Handling Employee Nodes
    return {
      ...node,
      data: {
        ...data,
        label: (
          <EmployeeCard
            id={node.id}
            {...data.employee!}
            isDeletable={isDeletable}
            onAddNode={_addNode}
            onUpdateNode={_updateNode}
            onDeleteNode={_deleteNode}
          />
        ),
        employee: data.employee
      }
    };
  }, [_addNode, _updateNode, _deleteNode, _updateGroupLabel]);

  useEffect(() => {
    handlers.current.addNode = (sourceId, direction) => {
      setNodes((currentNodes) => {
        const sourceNode = currentNodes.find((n) => n.id === sourceId);
        if (!sourceNode) return currentNodes;
        const newId = uuidv4();
        // Inherit parent
        const parentId = sourceNode.parentId;

        const position = { ...sourceNode.position };
        switch (direction) {
          case 'top': position.y -= (CARD_HEIGHT + GAP); break;
          case 'bottom': position.y += (CARD_HEIGHT + GAP); break;
          case 'left': position.x -= (CARD_WIDTH + GAP); break;
          case 'right': position.x += (CARD_WIDTH + GAP); break;
        }

        const employeeNodes = currentNodes.filter(n => !(n.data as CustomNodeData).isGroup);

        const updatedExistingNodes = currentNodes.map(node => {
          const data = node.data as CustomNodeData;
          if (data.isGroup) return node; // Skip groups

          if (employeeNodes.length === 1) {
            return createNodeWithLabel({ ...node }, true);
          }
          return node;
        });

        const newEmployeeData: EmployeeData = { name: "New Employee", designation: "ROLE", department: "DEPT" };
        const newNode: Node = {
          id: newId,
          parentId, // Inherit parent!
          position,
          extent: parentId ? 'parent' : undefined,
          expandParent: true,
          style: { background: 'transparent', border: 'none', padding: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
          data: {
            employee: newEmployeeData,
            label: <EmployeeCard id={newId} {...newEmployeeData} isDeletable={true} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} />
          },
        };
        const newEdge: Edge = { id: `e${sourceId}-${newId}`, source: sourceId, target: newId, type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 1.5 } };
        if (direction === 'top') setEdges((eds) => eds.concat({ ...newEdge, source: newId, target: sourceId }));
        else setEdges((eds) => eds.concat(newEdge));
        return [...updatedExistingNodes, newNode];
      });
    };

    handlers.current.updateNode = (id, newData) => {
      setNodes((nds) => nds.map((n) => {
        if (n.id === id) {
          const employeeNodes = nds.filter(n => !(n.data as CustomNodeData).isGroup);
          const isDeletable = employeeNodes.length > 1;
          return {
            ...n,
            data: {
              ...n.data,
              employee: newData,
              label: <EmployeeCard id={id} {...newData} isDeletable={isDeletable} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} />
            }
          };
        }
        return n;
      }));
    };

    handlers.current.updateGroupLabel = (id, label) => {
      setNodes((nds) => nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: { ...n.data, groupLabel: label, label: <GroupNode id={id} label={label} onLabelChange={_updateGroupLabel} /> }
          };
        }
        return n;
      }));
    };

    handlers.current.deleteNode = (id) => {
      setNodes((nds) => {
        const remaining = nds.filter((n) => n.id !== id);
        const remainingEmployees = remaining.filter(n => !(n.data as CustomNodeData).isGroup);

        if (remainingEmployees.length === 1) {
          const survivor = remainingEmployees[0];
          return remaining.map(node => {
            if (node.id === survivor.id) {
              return createNodeWithLabel(node, false);
            }
            return node;
          });
        }
        return remaining;
      });
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    };
  }, [setNodes, setEdges, _addNode, _updateNode, _deleteNode, _updateGroupLabel, createNodeWithLabel]);

  // Group Selected Nodes Logic
  const onGroupSelected = useCallback(() => {
    const nodes = getNodes();
    const selectedNodes = nodes.filter((node) => node.selected);

    if (selectedNodes.length === 0) {
      alert("Select nodes to group.");
      return;
    }

    // Helper: Get Absolute Position (Robust fallback)
    const getAbsolutePosition = (n: Node): { x: number, y: number } => {
      const nodeAny = n as any;
      if (nodeAny.computed?.positionAbsolute) return nodeAny.computed.positionAbsolute;
      if (nodeAny.positionAbsolute) return nodeAny.positionAbsolute;

      if (n.parentId) {
        const parent = nodes.find(p => p.id === n.parentId);
        if (parent) {
          const parentPos = getAbsolutePosition(parent);
          return { x: n.position.x + parentPos.x, y: n.position.y + parentPos.y };
        }
      }
      return n.position;
    };

    // Smart Grouping Logic
    const parentIds = new Set(selectedNodes.map(n => n.parentId));
    let commonParentId = undefined;
    if (parentIds.size === 1) {
      const parentId = selectedNodes[0].parentId;
      if (parentId) commonParentId = parentId; // Use existing parent if all share it
    }
    // If mixed parents or no parent, we go to root (commonParentId = undefined)

    // Calculate Bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    selectedNodes.forEach(n => {
      const pos = getAbsolutePosition(n);
      const width = n.style?.width ? Number(n.style.width) : (n.measured?.width || CARD_WIDTH);
      const height = n.style?.height ? Number(n.style.height) : (n.measured?.height || CARD_HEIGHT);

      if (pos.x < minX) minX = pos.x;
      if (pos.x + width > maxX) maxX = pos.x + width;
      if (pos.y < minY) minY = pos.y;
      if (pos.y + height > maxY) maxY = pos.y + height;
    });

    const padding = 20;
    const groupAbsoluteX = minX - padding;
    const groupAbsoluteY = minY - padding;
    const groupWidth = (maxX - minX) + padding * 2;
    const groupHeight = (maxY - minY) + padding * 2;

    const groupId = uuidv4();
    const groupNode: Node = {
      id: groupId,
      parentId: commonParentId,
      position: commonParentId ? {
        // If nesting, calculating relative position to parent would be complex without valid dimensions. 
        // For now, if nesting, we assume 'parent' variable logic in getAbsolutePosition works 
        // But here we need to set RELATIVE position for the new group. 
        // Simplified: If common parent exists, we calculate relative to it.
        x: groupAbsoluteX,
        y: groupAbsoluteY
      } : { x: groupAbsoluteX, y: groupAbsoluteY },
      // Note: If commonParentId is set, x/y should be relative. 
      // However, to avoid complexity, we can use the Independent Grouping logic mostly.
      // If commonParentId provided, we need relative coords. 
      // For this step, to be safe and avoid jump, we stick to ROOT level creation usually unless strictly standard.
      // Let's stick to ROOT level for safety as requested "Independent".

      style: {
        width: groupWidth,
        height: groupHeight,
        zIndex: -1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        border: '2px dashed rgba(59, 130, 246, 0.5)',
        borderRadius: '12px',
      },
      type: 'default',
      data: {
        isGroup: true,
        groupLabel: "NEW GROUP",
        label: <GroupNode id={groupId} label="NEW GROUP" onLabelChange={_updateGroupLabel} />
      }
    };

    // Correction: If we really want "Smart Nesting", we must subtract parent's absolute pos.
    if (commonParentId) {
      const parent = nodes.find(p => p.id === commonParentId);
      if (parent) {
        const pPos = getAbsolutePosition(parent);
        groupNode.position = {
          x: groupAbsoluteX - pPos.x,
          y: groupAbsoluteY - pPos.y
        };
      }
    }

    setNodes((nds) => {
      const updatedNodes = nds.map((n) => {
        if (selectedNodes.find(sn => sn.id === n.id)) {
          // Reparenting
          const oldAbs = getAbsolutePosition(n);
          return {
            ...n,
            parentId: groupId,
            expandParent: true,
            position: {
              x: oldAbs.x - groupAbsoluteX,
              y: oldAbs.y - groupAbsoluteY
            }
          };
        }
        return n;
      });
      return [...updatedNodes, groupNode];
    });
  }, [getNodes, setNodes, _updateGroupLabel]);

  // Ungroup Logic
  const onUngroup = useCallback(() => {
    const selectedGroups = getNodes().filter(n => n.selected && (n.data as CustomNodeData).isGroup);
    if (selectedGroups.length === 0) {
      alert("Select a group to ungroup.");
      return;
    }

    setNodes((nds) => {
      let updatedNodes = [...nds];

      selectedGroups.forEach(group => {
        // Reparent children to group's parent (or root)
        const groupPos = group.position; // Relative to its parent
        const groupParentId = group.parentId;

        // Reparent children to group's parent (or root)
        updatedNodes = updatedNodes.map(n => {
          if (n.parentId === group.id) {
            return {
              ...n,
              parentId: groupParentId,
              position: {
                x: n.position.x + groupPos.x,
                y: n.position.y + groupPos.y
              }
            };
          }
          return n;
        });

        // Remove group
        updatedNodes = updatedNodes.filter(n => n.id !== group.id);
      });
      return updatedNodes;
    });
  }, [getNodes, setNodes]);

  const onReset = useCallback(() => {
    // Define Scenario
    const balajiId = uuidv4();
    const johnId = uuidv4();
    const rajId = uuidv4();
    const kumarId = uuidv4();
    const groupId = uuidv4();

    const dataBalaji: EmployeeData = { name: "Balaji", designation: "CEO", department: "Executive" };
    const dataJohn: EmployeeData = { name: "John", designation: "Manager", department: "Engineering" };
    const dataRaj: EmployeeData = { name: "Raj", designation: "Developer", department: "Frontend" };
    const dataKumar: EmployeeData = { name: "Kumar", designation: "Developer", department: "Backend" };

    const newNodes: Node[] = [
      {
        id: balajiId,
        position: { x: 400, y: 50 },
        data: { employee: dataBalaji, label: <EmployeeCard id={balajiId} {...dataBalaji} isDeletable={true} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} /> },
        style: { width: CARD_WIDTH, height: CARD_HEIGHT }
      },
      {
        id: johnId,
        parentId: undefined, // John is root
        position: { x: 400, y: 250 },
        data: { employee: dataJohn, label: <EmployeeCard id={johnId} {...dataJohn} isDeletable={true} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} /> },
        style: { width: CARD_WIDTH, height: CARD_HEIGHT }
      },
      // Group for Developers
      {
        id: groupId,
        position: { x: 350, y: 450 },
        style: { width: 700, height: 200, zIndex: -1, backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '2px dashed rgba(59, 130, 246, 0.5)', borderRadius: '12px' },
        type: 'default',
        data: { isGroup: true, groupLabel: "Developers", label: <GroupNode id={groupId} label="Developers" onLabelChange={_updateGroupLabel} /> }
      },
      {
        id: rajId,
        parentId: groupId,
        position: { x: 20, y: 40 }, // Relative to Group
        extent: 'parent',
        expandParent: true,
        data: { employee: dataRaj, label: <EmployeeCard id={rajId} {...dataRaj} isDeletable={true} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} /> },
        style: { width: CARD_WIDTH, height: CARD_HEIGHT }
      },
      {
        id: kumarId,
        parentId: groupId,
        position: { x: 350, y: 40 }, // Relative to Group
        extent: 'parent',
        expandParent: true,
        data: { employee: dataKumar, label: <EmployeeCard id={kumarId} {...dataKumar} isDeletable={true} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} /> },
        style: { width: CARD_WIDTH, height: CARD_HEIGHT }
      },
    ];

    const newEdges: Edge[] = [
      { id: 'e1', source: balajiId, target: johnId, type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
      { id: 'e2', source: johnId, target: rajId, type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
      { id: 'e3', source: johnId, target: kumarId, type: 'smoothstep', style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges, _addNode, _updateNode, _deleteNode, _updateGroupLabel]);

  const onClear = useCallback(() => {
    if (confirm("Are you sure you want to clear the entire chart?")) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const handleDownload = () => {
    const serializableNodes = nodes.map(n => {
      const { label, ...restData } = n.data as CustomNodeData;
      return { ...n, data: restData };
    });
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes: serializableNodes, edges }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "org-chart.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(content);
        const hydratedNodes = loadedNodes.map((n: Node) => {
          const data = n.data as CustomNodeData;
          if (data.isGroup) {
            return {
              ...n,
              style: { ...n.style, zIndex: -1 },
              data: {
                ...data,
                label: <GroupNode id={n.id} label={data.groupLabel || "GROUP"} onLabelChange={_updateGroupLabel} />
              }
            };
          } else {
            const isDeletable = loadedNodes.filter((x: Node) => !(x.data as CustomNodeData).isGroup).length > 1;
            return {
              ...n,
              data: {
                ...data,
                label: <EmployeeCard id={n.id} {...data.employee!} isDeletable={isDeletable} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} />
              }
            };
          }
        });
        setNodes(hydratedNodes);
        setEdges(loadedEdges);
      } catch (err) {
        console.error("Failed to parse file", err);
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const onAddCard = () => {
    const id = uuidv4();
    const newEmployeeData: EmployeeData = { name: "New Employee", designation: "ROLE", department: "DEPT" };
    const newNode: Node = {
      id,
      position: { x: 100, y: 100 },
      data: {
        employee: newEmployeeData,
        label: <EmployeeCard id={id} {...newEmployeeData} isDeletable={true} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} />
      },
      style: { width: CARD_WIDTH, height: CARD_HEIGHT, background: 'transparent', border: 'none' }
    };
    setNodes((nds) => [...nds, newNode]);
  };

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
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
        <Controls className="!bg-[#0F172A] !border-blue-900/50 !text-blue-400" />
        <MiniMap
          nodeColor={(n) => (n.data as CustomNodeData).isGroup ? '#1e293b' : '#3b82f6'}
          maskColor="rgba(2, 6, 23, 0.7)"
          className="!bg-[#0F172A] !border-blue-900/50"
        />

        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
          <div className="flex gap-2 p-2 bg-[#0F172A]/90 backdrop-blur-md border border-blue-900/50 rounded-lg shadow-xl">
            <button onClick={onAddCard} className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-md transition-colors flex flex-col items-center gap-1 group">
              <PlusCircle size={20} />
              <span className="text-[10px] uppercase font-medium">Add Card</span>
            </button>
            <div className="w-[1px] bg-blue-900/50 mx-1"></div>
            <button onClick={onClear} className="p-2 hover:bg-red-600/20 text-red-400 rounded-md transition-colors flex flex-col items-center gap-1">
              <Eraser size={20} />
              <span className="text-[10px] uppercase font-medium">Clear</span>
            </button>
            <button onClick={onReset} className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-md transition-colors flex flex-col items-center gap-1">
              <RotateCcw size={20} />
              <span className="text-[10px] uppercase font-medium">Reset</span>
            </button>
          </div>

          <div className="flex gap-2 p-2 bg-[#0F172A]/90 backdrop-blur-md border border-blue-900/50 rounded-lg shadow-xl">
            <button onClick={onGroupSelected} className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-md transition-colors flex flex-col items-center gap-1">
              <Group size={20} />
              <span className="text-[10px] uppercase font-medium">Group</span>
            </button>
            <button onClick={onUngroup} className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-md transition-colors flex flex-col items-center gap-1">
              <Ungroup size={20} />
              <span className="text-[10px] uppercase font-medium">Ungroup</span>
            </button>
          </div>

          <div className="flex gap-2 p-2 bg-[#0F172A]/90 backdrop-blur-md border border-blue-900/50 rounded-lg shadow-xl">
            <button onClick={handleDownload} className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-md transition-colors flex flex-col items-center gap-1">
              <Download size={20} />
              <span className="text-[10px] uppercase font-medium">Save</span>
            </button>
            <label className="p-2 hover:bg-blue-600/20 text-blue-400 rounded-md transition-colors flex flex-col items-center gap-1 cursor-pointer">
              <Upload size={20} />
              <span className="text-[10px] uppercase font-medium">Load</span>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleUpload} />
            </label>
          </div>

          {/* Color Picker */}
          <div className="flex flex-col gap-1 p-2 bg-[#0F172A]/90 backdrop-blur-md border border-blue-900/50 rounded-lg shadow-xl">
            <span className="text-[10px] uppercase font-medium text-gray-400 text-center">Card Color</span>
            <div className="flex gap-2 justify-center">
              {/* Presets */}
              {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'].map((c) => (
                <div
                  key={c}
                  onClick={() => onColorChange(c)}
                  style={{ backgroundColor: c }}
                  className="w-5 h-5 rounded-full cursor-pointer border border-white/20 hover:scale-110 transition-transform"
                  title={c}
                />
              ))}
              {/* Custom Picker */}
              <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/20 cursor-pointer hover:scale-110 transition-transform">
                <input
                  type="color"
                  className="absolute -top-2 -left-2 w-10 h-10 p-0 border-0 cursor-pointer"
                  onChange={(e) => onColorChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </ReactFlow>
    </div>
  );
}

export default function Root() {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  );
}
