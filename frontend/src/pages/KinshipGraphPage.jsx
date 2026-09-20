import React, { useState, useEffect } from 'react';
import { 
  Users, Share2, AlertTriangle, ShieldCheck, ArrowLeft, 
  RefreshCw, Info, ExternalLink, Network, CheckCircle2 
} from 'lucide-react';
import { api } from '../api';

export function KinshipGraphPage({ familyId, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const currentFamilyId = familyId || localStorage.getItem('ekparivaar_family_id') || 'GJ-01-2026-F001';

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await api.getNetworkGraph(currentFamilyId).catch(() => null);
      if (data) {
        setGraphData(data);
      } else {
        // Mock fallback graph
        setGraphData({
          nodes: [
            { id: 'GJ-01-2026-F001', label: 'Ramesh Patel (Head)', type: 'head', household: 'Primary (F001)', x: 180, y: 120 },
            { id: 'mem_savitaben', label: 'Savitaben (Spouse)', type: 'member', household: 'Primary (F001)', x: 100, y: 280 },
            { id: 'mem_pooja', label: 'Pooja Patel (Aadhaar 4001)', type: 'conflict', household: 'Shared Duplicate', x: 320, y: 220 },
            { id: 'GJ-01-2026-F002', label: 'Kishore Patel (Head)', type: 'head', household: 'Secondary (F002)', x: 480, y: 120 },
            { id: 'mem_anand', label: 'Anand Patel (Son)', type: 'member', household: 'Secondary (F002)', x: 540, y: 280 }
          ],
          edges: [
            { source: 'GJ-01-2026-F001', target: 'mem_savitaben', relation: 'SPOUSE', status: 'VERIFIED' },
            { source: 'GJ-01-2026-F001', target: 'mem_pooja', relation: 'DAUGHTER', status: 'DISPUTED' },
            { source: 'GJ-01-2026-F002', target: 'mem_pooja', relation: 'DAUGHTER', status: 'DISPUTED' },
            { source: 'GJ-01-2026-F002', target: 'mem_anand', relation: 'SON', status: 'VERIFIED' }
          ]
        });
      }
    } catch (err) {
      console.error('Error fetching kinship graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [currentFamilyId]);

  const nodes = graphData?.nodes || [
    { id: 'GJ-01-2026-F001', label: 'Ramesh Patel (Head)', type: 'head', x: 200, y: 140 },
    { id: 'mem_savitaben', label: 'Savitaben (Spouse)', type: 'member', x: 120, y: 280 },
    { id: 'mem_pooja', label: 'Pooja Patel (Aadhaar 4001)', type: 'conflict', x: 340, y: 230 },
    { id: 'GJ-01-2026-F002', label: 'Kishore Patel (Head)', type: 'head', x: 480, y: 140 },
    { id: 'mem_anand', label: 'Anand Patel (Son)', type: 'member', x: 540, y: 280 }
  ];

  const edges = graphData?.edges || [
    { source: 'GJ-01-2026-F001', target: 'mem_savitaben', status: 'VERIFIED' },
    { source: 'GJ-01-2026-F001', target: 'mem_pooja', status: 'DISPUTED' },
    { source: 'GJ-01-2026-F002', target: 'mem_pooja', status: 'DISPUTED' },
    { source: 'GJ-01-2026-F002', target: 'mem_anand', status: 'VERIFIED' }
  ];

  const getNodeCoordinates = (nodeId) => {
    const n = nodes.find(item => item.id === nodeId);
    return n ? { x: n.x || 200, y: n.y || 200 } : { x: 200, y: 200 };
  };

  return (
    <div style={{ backgroundColor: 'var(--gov-bg)', minHeight: '85vh', padding: '2.5rem 0 5rem' }}>
      <div className="container">

        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => onNavigate('citizen', currentFamilyId)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--gov-teal-850)', 
              fontWeight: 600, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={18} /> Back to Citizen Dashboard
          </button>

          <span className="badge badge-red">
            <AlertTriangle size={13} /> 1 Cross-Household Conflict Detected
          </span>
        </div>

        {/* Page Header */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--gov-border)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gov-ochre-600)', fontWeight: 700 }}>
              Autonomous Fraud Prevention & Entity Resolution
            </div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--gov-teal-950)', margin: '0.2rem 0' }}>
              Kinship & Duplicate Conflict Graph
            </h1>
            <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Visual topological mapping of household kinship links and dual-claim Aadhaar collision vectors.
            </p>
          </div>

          <button
            onClick={() => onNavigate('officer-queue')}
            className="btn btn-primary"
          >
            Resolve in Officer Console <ExternalLink size={16} />
          </button>
        </div>

        {/* Main Canvas & Details Split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          
          {/* Interactive SVG Network Graph */}
          <div style={{
            backgroundColor: '#0a2e2e',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            minHeight: '440px'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '1rem', 
              left: '1.25rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#5eead4', 
              fontSize: '0.8rem', 
              fontWeight: 600 
            }}>
              <Network size={16} /> TOPOLOGICAL KINSHIP MAPPING (LIVE)
            </div>

            <svg width="100%" height="380" viewBox="0 0 680 380" style={{ marginTop: '1.5rem' }}>
              {/* Edges */}
              {edges.map((e, idx) => {
                const c1 = getNodeCoordinates(e.source);
                const c2 = getNodeCoordinates(e.target);
                const isDisputed = e.status === 'DISPUTED';

                return (
                  <g key={idx}>
                    <line
                      x1={c1.x}
                      y1={c1.y}
                      x2={c2.x}
                      y2={c2.y}
                      stroke={isDisputed ? '#ef4444' : '#14b8a6'}
                      strokeWidth={isDisputed ? 3 : 2}
                      strokeDasharray={isDisputed ? '6,4' : 'none'}
                    />
                    {isDisputed && (
                      <circle
                        cx={(c1.x + c2.x) / 2}
                        cy={(c1.y + c2.y) / 2}
                        r="8"
                        fill="#ef4444"
                      />
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((n) => {
                const isHead = n.type === 'head';
                const isConflict = n.type === 'conflict';
                const isSelected = selectedNode?.id === n.id;

                return (
                  <g 
                    key={n.id} 
                    onClick={() => setSelectedNode(n)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={isHead ? 28 : isConflict ? 24 : 20}
                      fill={isConflict ? '#ef4444' : isHead ? '#0d9488' : '#334155'}
                      stroke={isSelected ? '#ffffff' : isConflict ? '#fca5a5' : '#5eead4'}
                      strokeWidth={isSelected ? 4 : 2}
                    />
                    <text
                      x={n.x}
                      y={n.y + 4}
                      fill="#ffffff"
                      fontSize={isHead ? 11 : 10}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isHead ? 'HEAD' : isConflict ? 'ALERT' : 'MEM'}
                    </text>

                    {/* Label below node */}
                    <text
                      x={n.x}
                      y={n.y + (isHead ? 42 : 36)}
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0d9488' }} /> Household Head
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Duplicate Aadhaar Collision
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#334155' }} /> Verified Member
              </div>
            </div>
          </div>

          {/* Node Inspector & Legal Analysis */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--gov-border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--gov-teal-950)', margin: 0 }}>
                  Topological Inspector
                </h3>
                <span className="badge badge-yellow">
                  Section 14 Investigation
                </span>
              </div>

              {selectedNode ? (
                <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--gov-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Selected Entity
                  </div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--gov-text-title)', margin: '0.2rem 0' }}>
                    {selectedNode.label}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gov-text-body)', marginTop: '0.5rem' }}>
                    Type: <strong>{selectedNode.type.toUpperCase()}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gov-text-body)' }}>
                    Household Association: <strong>{selectedNode.household || 'Gujarat Registry'}</strong>
                  </div>

                  {selectedNode.type === 'conflict' && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={14} /> Dual Claim Collision Detected
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#7f1d1d', margin: '0.3rem 0 0', lineHeight: 1.4 }}>
                        Claimed simultaneously in <strong>Household A (GJ-01-2026-F001)</strong> and <strong>Household B (GJ-01-2026-F002)</strong>. Statutory review required.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', color: 'var(--gov-text-muted)', fontSize: '0.85rem' }}>
                  <Info size={24} style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--gov-teal-700)' }} />
                  Click any node on the network graph to inspect entity relations, biometric linkage, and collision proofs.
                </div>
              )}

              {/* Conflict Summary Breakdown */}
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--gov-text-title)', marginBottom: '0.5rem' }}>
                  Automated Conflict Diagnostics
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--gov-text-body)', lineHeight: 1.6 }}>
                  • <strong>Collision Bridge:</strong> Pooja Patel (Aadhaar Ref: XXXX-XXXX-4001)<br />
                  • <strong>Household 1:</strong> Ramesh Patel (Father, Ahmedabad)<br />
                  • <strong>Household 2:</strong> Kishore Patel (Father-in-law, Surat)<br />
                  • <strong>Statutory Risk:</strong> Double-dipping in MAA Vatsalya and ration quota.<br />
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('officer-queue')}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              Open Statutory Adjudication Desk <ExternalLink size={16} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
