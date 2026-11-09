import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Maximize2, RotateCcw, Filter, User, Lightbulb, Tag } from 'lucide-react';
import { Idea } from '../../types';

interface Node {
  id: string;
  type: 'IDEA' | 'USER' | 'SKILL' | 'CATEGORY';
  label: string;
  sublabel?: string;
  category?: string;
  color: string;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  entityId: string;
  url?: string;
}

interface Edge {
  source: string;
  target: string;
  strength: number;
}

interface IdeaNetworkCanvasProps {
  ideas: Idea[];
  className?: string;
}

export const IdeaNetworkCanvas: React.FC<IdeaNetworkCanvasProps> = ({ ideas, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const [filter, setFilter] = useState<'ALL' | 'IDEAS' | 'USERS' | 'SKILLS'>('ALL');
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Graph state stored in ref for 60fps animation loop
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animFrameRef = useRef<number>(0);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingNodeRef = useRef<Node | null>(null);

  // Initialize or re-derive graph nodes from real ideas
  useEffect(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<string, Node>();

    // Color definitions aligned with dark theme branding
    const IDEA_COLOR = '#38BDF8';    // cyan
    const USER_COLOR = '#8B5CF6';    // purple
    const SKILL_COLOR = '#FBBF24';   // yellow
    const CAT_COLOR = '#10B981';     // emerald

    const width = 800;
    const height = 520;
    const centerX = width / 2;
    const centerY = height / 2;

    // Add unique categories
    const categories = Array.from(new Set(ideas.map(i => i.category))).slice(0, 4);
    categories.forEach((cat, idx) => {
      const angle = (idx / categories.length) * Math.PI * 2;
      const catNode: Node = {
        id: `cat-${cat}`,
        type: 'CATEGORY',
        label: cat,
        sublabel: 'Domain Hub',
        color: CAT_COLOR,
        size: 18,
        x: centerX + Math.cos(angle) * 160,
        y: centerY + Math.sin(angle) * 120,
        vx: 0,
        vy: 0,
        entityId: cat
      };
      nodes.push(catNode);
      nodeMap.set(catNode.id, catNode);
    });

    // Add Ideas
    ideas.slice(0, 8).forEach((idea, idx) => {
      const angle = (idx / Math.min(ideas.length, 8)) * Math.PI * 2 + 0.3;
      const dist = 110 + (idx % 2) * 80;
      const ideaNode: Node = {
        id: `idea-${idea.id}`,
        type: 'IDEA',
        label: idea.title.length > 22 ? idea.title.slice(0, 20) + '...' : idea.title,
        sublabel: idea.category,
        category: idea.category,
        color: IDEA_COLOR,
        size: 16,
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        entityId: idea.id,
        url: `/ideas/${idea.id}`
      };
      nodes.push(ideaNode);
      nodeMap.set(ideaNode.id, ideaNode);

      // Connect to category
      if (nodeMap.has(`cat-${idea.category}`)) {
        edges.push({ source: ideaNode.id, target: `cat-${idea.category}`, strength: 0.6 });
      }

      // Add Creator node
      if (idea.creator?.id) {
        const userNodeId = `user-${idea.creator.id}`;
        if (!nodeMap.has(userNodeId)) {
          const uNode: Node = {
            id: userNodeId,
            type: 'USER',
            label: idea.creator.name || 'Creator',
            sublabel: idea.creator.username ? `@${idea.creator.username}` : undefined,
            color: USER_COLOR,
            size: 13,
            x: ideaNode.x + (Math.random() - 0.5) * 80,
            y: ideaNode.y + (Math.random() - 0.5) * 80,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            entityId: idea.creator.id,
            url: idea.creator.username ? `/profile/${idea.creator.username}` : undefined
          };
          nodes.push(uNode);
          nodeMap.set(userNodeId, uNode);
        }
        edges.push({ source: ideaNode.id, target: userNodeId, strength: 0.8 });
      }

      // Add 1-2 skills
      (idea.skills || []).slice(0, 2).forEach((skillName, sIdx) => {
        const skillNodeId = `skill-${skillName.toLowerCase()}`;
        if (!nodeMap.has(skillNodeId)) {
          const sNode: Node = {
            id: skillNodeId,
            type: 'SKILL',
            label: skillName,
            sublabel: 'Required Skill',
            color: SKILL_COLOR,
            size: 11,
            x: ideaNode.x + Math.sin(sIdx + 1) * 60,
            y: ideaNode.y + Math.cos(sIdx + 1) * 60,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            entityId: skillName
          };
          nodes.push(sNode);
          nodeMap.set(skillNodeId, sNode);
        }
        edges.push({ source: ideaNode.id, target: skillNodeId, strength: 0.4 });
      });
    });

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [ideas]);

  // Canvas render & simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 460);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 460;
      }
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const mouse = mousePosRef.current;
      const dragging = draggingNodeRef.current;

      // Update positions with subtle floating physics
      if (!isPaused) {
        nodes.forEach(node => {
          if (node === dragging) return;

          // Velocity damping & gentle bounds
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < node.size + 10) { node.x = node.size + 10; node.vx *= -1; }
          if (node.x > width - node.size - 10) { node.x = width - node.size - 10; node.vx *= -1; }
          if (node.y < node.size + 10) { node.y = node.size + 10; node.vy *= -1; }
          if (node.y > height - node.size - 10) { node.y = height - node.size - 10; node.vy *= -1; }

          // Slight random drift
          node.vx += (Math.random() - 0.5) * 0.04;
          node.vy += (Math.random() - 0.5) * 0.04;
          node.vx *= 0.98;
          node.vy *= 0.98;
        });
      }

      // Draw Edges (Glow and line)
      edges.forEach(edge => {
        const src = nodes.find(n => n.id === edge.source);
        const tgt = nodes.find(n => n.id === edge.target);
        if (!src || !tgt) return;

        // Check active filter
        if (filter !== 'ALL') {
          if (filter === 'IDEAS' && src.type !== 'IDEA' && tgt.type !== 'IDEA') return;
          if (filter === 'USERS' && src.type !== 'USER' && tgt.type !== 'USER') return;
          if (filter === 'SKILLS' && src.type !== 'SKILL' && tgt.type !== 'SKILL') return;
        }

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        // Pulse gradient line
        const gradient = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
        gradient.addColorStop(0, `${src.color}40`);
        gradient.addColorStop(1, `${tgt.color}40`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = edge.strength * 1.8;
        ctx.stroke();
      });

      // Find node under mouse
      let foundHover: Node | null = null;
      if (mouse) {
        for (let i = nodes.length - 1; i >= 0; i--) {
          const n = nodes[i];
          const dist = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (dist <= n.size + 4) {
            foundHover = n;
            break;
          }
        }
      }
      setHoveredNode(foundHover);

      // Draw Nodes
      nodes.forEach(node => {
        // Filter out if not matching
        if (filter !== 'ALL') {
          if (filter === 'IDEAS' && node.type !== 'IDEA') return;
          if (filter === 'USERS' && node.type !== 'USER') return;
          if (filter === 'SKILLS' && node.type !== 'SKILL') return;
        }

        const isHovered = foundHover?.id === node.id || dragging?.id === node.id;
        const currentSize = isHovered ? node.size + 4 : node.size;

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentSize + 6, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}${isHovered ? '45' : '18'}`;
        ctx.fill();

        // Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered ? 14 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Inner Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentSize * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#0B1220';
        ctx.fill();

        // Node Label
        ctx.font = isHovered ? 'bold 11px Inter, sans-serif' : '10px Inter, sans-serif';
        ctx.fillStyle = isHovered ? '#FFFFFF' : '#94A3B8';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + currentSize + 13);
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [filter, isPaused]);

  // Mouse interaction handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePosRef.current = { x, y };

    if (draggingNodeRef.current) {
      draggingNodeRef.current.x = x;
      draggingNodeRef.current.y = y;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = nodesRef.current.find(n => Math.hypot(n.x - x, n.y - y) <= n.size + 4);
    if (clicked) {
      draggingNodeRef.current = clicked;
    }
  };

  const handleMouseUp = () => {
    draggingNodeRef.current = null;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = nodesRef.current.find(n => Math.hypot(n.x - x, n.y - y) <= n.size + 4);
    if (clicked && clicked.url) {
      navigate(clicked.url);
    }
  };

  return (
    <div className={`relative bg-gradient-to-b from-[#0F172A] to-[#0B1220] border border-[#1E293B] rounded-2xl p-4 overflow-hidden shadow-2xl ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              3D Idea & Talent Spark Graph
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono">
                Live DB
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive relational mesh connecting sparks, required skills, and verified builders
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          {(['ALL', 'IDEAS', 'USERS', 'SKILLS'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                filter === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume Orbit' : 'Pause Orbit'}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-[460px] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Floating Tooltip when node hovered */}
        {hoveredNode && (
          <div
            className="pointer-events-none absolute bottom-4 left-4 max-w-sm bg-[#16253D]/95 border border-[#38BDF8]/40 backdrop-blur-md rounded-xl p-3 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-2 mb-1">
              {hoveredNode.type === 'IDEA' && <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />}
              {hoveredNode.type === 'USER' && <User className="w-3.5 h-3.5 text-purple-400" />}
              {hoveredNode.type === 'SKILL' && <Tag className="w-3.5 h-3.5 text-amber-400" />}
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                {hoveredNode.type}
              </span>
            </div>
            <div className="text-sm font-bold text-white">{hoveredNode.label}</div>
            {hoveredNode.sublabel && (
              <div className="text-xs text-slate-300 mt-0.5">{hoveredNode.sublabel}</div>
            )}
            {hoveredNode.url && (
              <div className="text-[10px] text-cyan-400 font-semibold mt-2 flex items-center gap-1">
                Click to explore node →
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" /> Ideas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" /> Builders
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" /> Skills
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Domains
          </span>
        </div>
        <div className="text-slate-500 italic">Drag nodes to rearrange • Click to navigate</div>
      </div>
    </div>
  );
};

export default IdeaNetworkCanvas;
