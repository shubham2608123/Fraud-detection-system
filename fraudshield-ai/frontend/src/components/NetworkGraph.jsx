import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../utils/api';

const nodeTypes = {
  mule: ({ data }) => (
    <div className="w-[50px] h-[50px] bg-red-100 border-2 border-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-red-600 cursor-pointer shadow-lg">
      {data.label?.slice(-4)}
    </div>
  ),
  connected: ({ data }) => (
    <div className="w-[40px] h-[40px] bg-blue-100 border-2 border-blue-500 rounded-full flex items-center justify-center text-[8px] font-bold text-blue-600 cursor-pointer">
      {data.label?.slice(-4)}
    </div>
  ),
  normal: ({ data }) => (
    <div className="w-[35px] h-[35px] bg-slate-100 border-2 border-slate-400 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-500 cursor-pointer">
      {data.label?.slice(-4)}
    </div>
  ),
};

export default function NetworkGraph({ accountId }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    api.get(`/transactions/network/${accountId}`)
      .then(res => {
        setGraphData(res.data);
      })
      .catch(err => {
        console.error('Network fetch error:', err);
      })
      .finally(() => setLoading(false));
  }, [accountId]);

  const nodes = useMemo(() => {
    return (graphData.nodes || []).map((node, i) => ({
      id: node.id,
      type: node.type,
      position: {
        x: 400 + Math.cos(2 * Math.PI * i / Math.max(graphData.nodes.length, 1)) * 200,
        y: 300 + Math.sin(2 * Math.PI * i / Math.max(graphData.nodes.length, 1)) * 200,
      },
      data: node.data,
    }));
  }, [graphData]);

  const edges = useMemo(() => {
    return (graphData.edges || []).map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.data?.is_suspicious,
      style: {
        stroke: edge.data?.is_suspicious ? '#dc2626' : '#3b82f6',
        strokeWidth: 2,
      },
      label: edge.data?.amount ? `₹${edge.data.amount.toLocaleString()}` : '',
      labelStyle: { fontSize: 9, fill: '#64748b' },
    }));
  }, [graphData]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-slate-600">Mule Account</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-slate-600">Connected Account</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
          <span className="text-slate-600">Normal Account</span>
        </div>
      </div>
      <div style={{ height: '450px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
