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
const STORAGE_KEY = 'org-chart-data-v1';

// Data Type
type EmployeeData = {
  name: string;
  designation: string;
  department: string;
  photoUrl?: string;
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

const EmployeeCard = ({ id, name, designation, department, photoUrl, isDeletable, onAddNode, onUpdateNode, onDeleteNode }: EmployeeCardProps) => {
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

      {/* Delete Button - Top Right - Conditional Render */}
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
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { getNodes } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          // Determine if we need to update survivor to be non-deletable
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
      // Cast to any to access runtime properties if types are missing
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

    // Calculate Absolute Bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedNodes.forEach(n => {
      const absPos = getAbsolutePosition(n);
      // Use style measured dims or fallback
      const w = n.style?.width ? Number(n.style.width) : (n.measured?.width || CARD_WIDTH);
      const h = n.style?.height ? Number(n.style.height) : (n.measured?.height || CARD_HEIGHT);

      if (absPos.x < minX) minX = absPos.x;
      if (absPos.y < minY) minY = absPos.y;
      if (absPos.x + w > maxX) maxX = absPos.x + w;
      if (absPos.y + h > maxY) maxY = absPos.y + h;
    });

    // Exact 20px padding
    const padding = 20;
    const groupAbsoluteX = minX - padding;
    const groupAbsoluteY = minY - padding;
    const groupWidth = (maxX - minX) + padding * 2;
    const groupHeight = (maxY - minY) + padding * 2;

    const groupId = uuidv4();

    // Smart Parent Logic: Nest if common parent exists
    const uniqueParents = Array.from(new Set(selectedNodes.map(n => n.parentId)));
    const targetParentId = uniqueParents.length === 1 ? uniqueParents[0] : undefined;

    let groupPos = { x: groupAbsoluteX, y: groupAbsoluteY };

    if (targetParentId) {
      const parentNode = nodes.find(n => n.id === targetParentId);
      if (parentNode) {
        const parentAbs = getAbsolutePosition(parentNode);
        groupPos = {
          x: groupAbsoluteX - parentAbs.x,
          y: groupAbsoluteY - parentAbs.y
        };
      }
    }

    // New Group Node
    const groupNode: Node = {
      id: groupId,
      parentId: targetParentId,
      position: groupPos,
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

    setNodes((nds) => {
      const updatedNodes = nds.map((n) => {
        if (selectedNodes.find(sn => sn.id === n.id)) {
          const absPos = getAbsolutePosition(n);
          return {
            ...n,
            parentId: groupId,
            expandParent: true, // Resize group as needed
            // Recalculate position to be relative to the new group
            position: {
              x: absPos.x - groupAbsoluteX,
              y: absPos.y - groupAbsoluteY
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
    const selectedGroups = getNodes().filter((node) => node.selected && (node.data as CustomNodeData).isGroup);
    if (selectedGroups.length === 0) return;

    setNodes((nds) => {
      let currentNodes = [...nds];
      selectedGroups.forEach(group => {
        // Update children to group's parent (or root)
        const groupParentId = group.parentId;

        currentNodes = currentNodes.map(n => {
          if (n.parentId === group.id) {
            return {
              ...n,
              parentId: groupParentId,
              position: {
                x: n.position.x + group.position.x,
                y: n.position.y + group.position.y
              }
            };
          }
          return n;
        });
        // Remove group
        currentNodes = currentNodes.filter(n => n.id !== group.id);
      });
      return currentNodes;
    });
  }, [getNodes, setNodes]);

  // Clear All
  const onClear = useCallback(() => {
    if (window.confirm("Are you sure you want to clear the entire chart?")) {
      setNodes([]);
      setEdges([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [setNodes, setEdges]);

  // Reset to Default (User Scenario)
  const onReset = useCallback(() => {
    if (window.confirm("Reset to default scenario (Balaji > John > Developers[Raj, Kumar])? This will erase current changes.")) {
      const balajiId = '1';
      const johnId = '2';
      const rajId = '3';
      const kumarId = '4';
      const groupId = 'group_devs';

      // Balaji
      const balajiNode: Node = {
        id: balajiId,
        position: { x: 400, y: 50 },
        style: { background: 'transparent', border: 'none', padding: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
        data: {
          employee: { name: "Balaji", designation: "CEO", department: "Executive" },
          label: <EmployeeCard id={balajiId} name="Balaji" designation="CEO" department="Executive" isDeletable={false} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} />
        },
      };

      // John
      const johnNode: Node = {
        id: johnId,
        position: { x: 400, y: 300 },
        style: { background: 'transparent', border: 'none', padding: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
        data: {
          employee: { name: "John", designation: "Manager", department: "Engineering" },
          label: <EmployeeCard id={johnId} name="John" designation="Manager" department="Engineering" isDeletable={true} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} />
        },
      };

      // Group: Developers
      const groupNode: Node = {
        id: groupId,
        // Position near children
        position: { x: 200, y: 550 },
        style: {
          width: 700,
          height: 250,
          zIndex: -1,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          border: '2px dashed rgba(59, 130, 246, 0.5)',
          borderRadius: '12px',
        },
        type: 'default',
        data: { isGroup: true, groupLabel: "Developers", label: <GroupNode id={groupId} label="Developers" onLabelChange={_updateGroupLabel} /> }
      };

      // Raj & Kumar (Inside Group)
      const rajNode: Node = {
        id: rajId,
        parentId: groupId, // Nested
        expandParent: true,
        position: { x: 20, y: 60 }, // Relative to Group
        style: { background: 'transparent', border: 'none', padding: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
        data: {
          employee: { name: "Raj", designation: "Executive", department: "Engineering" },
          label: <EmployeeCard id={rajId} name="Raj" designation="Executive" department="Engineering" isDeletable={true} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} />
        },
      };

      const kumarNode: Node = {
        id: kumarId,
        parentId: groupId, // Nested
        expandParent: true,
        position: { x: 350, y: 60 }, // Relative to Group
        style: { background: 'transparent', border: 'none', padding: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
        data: {
          employee: { name: "Kumar", designation: "Executive", department: "Engineering" },
          label: <EmployeeCard id={kumarId} name="Kumar" designation="Executive" department="Engineering" isDeletable={true} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} />
        },
      };

      const initialNodes = [balajiNode, johnNode, groupNode, rajNode, kumarNode];

      const initialEdges: Edge[] = [
        { id: 'e1-2', source: balajiId, target: johnId, type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
        { id: 'e2-3', source: johnId, target: rajId, type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
        { id: 'e2-4', source: johnId, target: kumarId, type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 1.5 } },
      ];

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [setNodes, setEdges, _addNode, _updateNode, _deleteNode, _updateGroupLabel]);

  // Add Card (Standalone)
  const onAddCard = useCallback(() => {
    const newId = uuidv4();
    const newData: EmployeeData = { name: "New Employee", designation: "ROLE", department: "DEPT" };
    // Position at center of view or offset. Since we don't have viewport center easily without useReactFlow.project, 
    // we'll add it at a slight offset from 0,0 or just 100,100.
    // Better: Use getNodes() to find a good spot? For now, 100, 100.
    const position = { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 };

    const newNode: Node = {
      id: newId,
      position,
      style: { background: 'transparent', border: 'none', padding: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
      data: {
        employee: newData,
        label: <EmployeeCard
          id={newId}
          {...newData}
          isDeletable={true}
          onAddNode={_addNode}
          onUpdateNode={_updateNode}
          onDeleteNode={_deleteNode}
        />
      }
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, _addNode, _updateNode, _deleteNode]);

  // Drag to Nest Logic (Placeholder for future expansion)
  const onNodeDragStop = useCallback(
    () => {
      // Logic for drag-to-group can be added here.
      // Currently relying on "Group Selected" for stability.
    },
    []
  );

  // Initial Node Effect (Only if localStorage is empty)
  useEffect(() => {
    if (nodes.length > 0) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        const hydratedNodes = savedNodes.map((n: Node) => {
          const data = n.data as CustomNodeData;
          // Important: Check for isGroup
          if (data.isGroup) {
            return {
              ...n,
              style: { ...n.style, zIndex: -1 },
              data: {
                ...data,
                label: <GroupNode id={n.id} label={data.groupLabel || "GROUP"} onLabelChange={_updateGroupLabel} />
              }
            };
          }
          // Resume Employee Logic
          const isDeletable = savedNodes.filter((x: Node) => !(x.data as CustomNodeData).isGroup).length > 1;
          return {
            ...n,
            data: {
              ...data,
              label: <EmployeeCard id={n.id} {...data.employee!} isDeletable={isDeletable} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} />
            }
          };
        });
        setNodes(hydratedNodes);
        setEdges(savedEdges);
        return;
      } catch (e) {
        console.error("Failed to load layout", e);
      }
    }

    // Default Initial State
    const initialId = '1';
    const initialData: EmployeeData = { name: "Gokul", designation: "LEAD TEST ENGINEER", department: "QC" };
    setNodes([{
      id: initialId,
      position: { x: 0, y: 0 },
      style: { background: 'transparent', border: 'none', padding: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
      data: {
        employee: initialData,
        label: <EmployeeCard
          id={initialId}
          {...initialData}
          isDeletable={false}
          onAddNode={_addNode}
          onUpdateNode={_updateNode}
          onDeleteNode={_deleteNode}
        />
      },
    }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount.

  // Auto-Save Effect
  useEffect(() => {
    if (nodes.length === 0) return;
    const timeout = setTimeout(() => {
      const serializableNodes = nodes.map(n => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { label, ...restData } = n.data as CustomNodeData;
        return { ...n, data: restData };
      });
      const payload = JSON.stringify({ nodes: serializableNodes, edges });
      localStorage.setItem(STORAGE_KEY, payload);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [nodes, edges]);

  // Manual Export
  const handleDownload = () => {
    const serializableNodes = nodes.map(n => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { label, ...restData } = n.data as CustomNodeData;
      return { ...n, data: restData };
    });
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes: serializableNodes, edges }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "org-chart-data.json");
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
          }
          const isDeletable = loadedNodes.filter((x: Node) => !(x.data as CustomNodeData).isGroup).length > 1;
          return {
            ...n,
            data: {
              ...data,
              label: <EmployeeCard id={n.id} {...data.employee!} isDeletable={isDeletable} onAddNode={_addNode} onUpdateNode={_updateNode} onDeleteNode={_deleteNode} />
            }
          };
        });
        setNodes(hydratedNodes);
        setEdges(loadedEdges);
      } catch (err) {
        console.error("Failed to parse file", err);
        alert("Invalid File Format");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020617' }}>
      {/* Toolbar */}
      <div className="fixed top-4 right-4 z-[100] flex gap-2 bg-[#0F172A] p-2 rounded-lg border border-blue-900/50 shadow-xl text-white">

        <div className="flex gap-2 border-r border-gray-700 pr-2 mr-2">
          <button onClick={onAddCard} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-colors" title="Add New Card">
            <PlusCircle size={16} /> Add Card
          </button>
          <button onClick={onClear} className="flex items-center gap-2 px-3 py-1.5 bg-red-900/50 hover:bg-red-800 rounded text-sm font-medium transition-colors" title="Clear All">
            <Eraser size={16} /> Clear
          </button>
          <button onClick={onReset} className="flex items-center gap-2 px-3 py-1.5 bg-amber-700/50 hover:bg-amber-600 rounded text-sm font-medium transition-colors" title="Reset to Default">
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        <div className="flex gap-2 border-r border-gray-700 pr-2 mr-2">
          <button onClick={onGroupSelected} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium transition-colors" title="Group Selected">
            <Group size={16} /> Group
          </button>
          <button onClick={onUngroup} className="flex items-center gap-2 px-3 py-1.5 bg-red-900/50 hover:bg-red-800 rounded text-sm font-medium transition-colors" title="Ungroup Selected">
            <Ungroup size={16} /> Ungroup
          </button>
        </div>

        <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors" title="Download Save File">
          <Download size={16} /> Save
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors" title="Open Save File">
          <Upload size={16} /> Load
        </button>
        <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".json" />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
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
