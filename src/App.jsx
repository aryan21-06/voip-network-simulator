import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Pause, RotateCcw, Phone, Wifi, AlertTriangle, CheckCircle, Monitor, Router, Server } from 'lucide-react';
import './index.css';

const VoIPNetworkSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [networkData, setNetworkData] = useState([]);
  const [settings, setSettings] = useState({
    bandwidth: 1000,
    packetLoss: 0,
    jitter: 0,
    latency: 20,
    qosEnabled: false
  });
  const [callQuality, setCallQuality] = useState({
    mos: 4.5,
    rFactor: 85,
    status: 'Excellent'
  });
  const [activeConnection, setActiveConnection] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);

  const calculateMOS = (loss, delay, jitter) => {
    let rFactor = 93.2;
    
    if (delay > 150) {
      rFactor -= (delay - 150) * 0.2;
    }
    
    rFactor -= loss * 25;
    rFactor -= jitter * 0.1;
    
    if (settings.qosEnabled) {
      rFactor += 5;
    }
    
    rFactor = Math.max(0, Math.min(100, rFactor));
    
    let mos;
    if (rFactor < 0) mos = 1;
    else if (rFactor > 100) mos = 4.5;
    else if (rFactor < 60) mos = 1 + 0.035 * rFactor + rFactor * (rFactor - 60) * (100 - rFactor) * 7e-6;
    else mos = 1 + 0.035 * rFactor + rFactor * (rFactor - 60) * (100 - rFactor) * 7e-6;
    
    mos = Math.max(1, Math.min(5, mos));
    
    let status;
    if (mos >= 4.0) status = 'Excellent';
    else if (mos >= 3.5) status = 'Good';
    else if (mos >= 3.0) status = 'Fair';
    else if (mos >= 2.0) status = 'Poor';
    else status = 'Bad';
    
    return { mos: parseFloat(mos.toFixed(2)), rFactor: Math.round(rFactor), status };
  };

  const generateNetworkData = (time) => {
    const baseLoad = 30 + Math.sin(time / 10) * 20;
    const actualLoss = settings.qosEnabled ? settings.packetLoss * 0.3 : settings.packetLoss;
    const actualJitter = settings.qosEnabled ? settings.jitter * 0.5 : settings.jitter;
    const actualLatency = settings.latency + (settings.qosEnabled ? 0 : Math.random() * 10);
    
    return {
      time: time,
      bandwidth: settings.bandwidth,
      networkLoad: Math.round(baseLoad + Math.random() * 10),
      packetLoss: parseFloat((actualLoss + Math.random() * 0.5).toFixed(2)),
      jitter: parseFloat((actualJitter + Math.random() * 2).toFixed(1)),
      latency: Math.round(actualLatency),
      voiceBandwidth: 64
    };
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const newData = generateNetworkData(newTime);
          
          setNetworkData(prevData => {
            const updated = [...prevData, newData];
            return updated.slice(-30);
          });
          
          const quality = calculateMOS(newData.packetLoss, newData.latency, newData.jitter);
          setCallQuality(quality);
          
          return newTime;
        });
      }, 500);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, settings]);

  const reset = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setNetworkData([]);
    setCallQuality({ mos: 4.5, rFactor: 85, status: 'Excellent' });
  };

  const getQualityColor = (mos) => {
    if (mos >= 4.0) return 'text-green-600';
    if (mos >= 3.5) return 'text-blue-600';
    if (mos >= 3.0) return 'text-yellow-600';
    if (mos >= 2.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getQualityIcon = (mos) => {
    if (mos >= 3.5) return <CheckCircle className="w-6 h-6 text-green-500" />;
    return <AlertTriangle className="w-6 h-6 text-orange-500" />;
  };

  // Network Topology Component
  const NetworkTopology = () => {
    const networkNodes = [
      { id: 'phone1', x: 50, y: 200, type: 'phone', label: 'IP Phone 1' },
      { id: 'phone2', x: 50, y: 300, type: 'phone', label: 'IP Phone 2' },
      { id: 'pc1', x: 50, y: 400, type: 'pc', label: 'PC 1' },
      { id: 'switch1', x: 250, y: 300, type: 'switch', label: 'Access Switch' },
      { id: 'router1', x: 450, y: 300, type: 'router', label: 'Core Router' },
      { id: 'server1', x: 650, y: 250, type: 'server', label: 'Call Manager' },
      { id: 'phone3', x: 850, y: 200, type: 'phone', label: 'IP Phone 3' },
      { id: 'phone4', x: 850, y: 300, type: 'phone', label: 'IP Phone 4' }
    ];

    const connections = [
      { from: { x: 90, y: 220 }, to: { x: 250, y: 320 }, type: 'voice' },
      { from: { x: 90, y: 320 }, to: { x: 250, y: 320 }, type: 'voice' },
      { from: { x: 90, y: 420 }, to: { x: 250, y: 320 }, type: 'data' },
      { from: { x: 290, y: 320 }, to: { x: 450, y: 320 }, type: 'trunk' },
      { from: { x: 490, y: 320 }, to: { x: 650, y: 270 }, type: 'management' },
      { from: { x: 490, y: 300 }, to: { x: 810, y: 220 }, type: 'voice' },
      { from: { x: 490, y: 300 }, to: { x: 810, y: 320 }, type: 'voice' }
    ];

    const getNodeIcon = (type) => {
      switch (type) {
        case 'phone': return <Phone className="w-6 h-6 text-blue-600" />;
        case 'pc': return <Monitor className="w-6 h-6 text-gray-600" />;
        case 'switch': return <div className="w-6 h-6 bg-green-500 rounded border border-green-700"></div>;
        case 'router': return <Router className="w-6 h-6 text-orange-600" />;
        case 'server': return <Server className="w-6 h-6 text-purple-600" />;
        default: return null;
      }
    };

    const getConnectionColor = (type) => {
      if (!settings.qosEnabled) return '#94a3b8';
      
      switch (type) {
        case 'voice': return '#ef4444';
        case 'data': return '#3b82f6';
        case 'trunk': return '#10b981';
        case 'management': return '#8b5cf6';
        default: return '#94a3b8';
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Network Topology</h3>
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showTraffic ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showTraffic ? 'Hide Traffic' : 'Show Traffic'}
          </button>
        </div>

        <div className="relative bg-gray-50 rounded-lg p-4">
          <svg width="900" height="500" className="w-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <rect x="20" y="150" width="200" height="300" fill="#dbeafe" fillOpacity="0.3" rx="10" />
            <text x="120" y="140" textAnchor="middle" className="text-sm font-medium fill-blue-700">
              Office Network
            </text>

            <rect x="620" y="150" width="260" height="300" fill="#dcfce7" fillOpacity="0.3" rx="10" />
            <text x="750" y="140" textAnchor="middle" className="text-sm font-medium fill-green-700">
              Remote Office
            </text>

            {connections.map((conn, index) => (
              <line
                key={index}
                x1={conn.from.x}
                y1={conn.from.y}
                x2={conn.to.x}
                y2={conn.to.y}
                stroke={getConnectionColor(conn.type)}
                strokeWidth={conn.type === 'voice' && settings.qosEnabled ? 4 : 2}
                className={showTraffic ? 'animate-pulse' : ''}
              />
            ))}

            {networkNodes.map((node) => (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width="40"
                  height="40"
                  fill="white"
                  stroke={node.type === 'phone' ? '#3b82f6' : node.type === 'pc' ? '#6b7280' : 
                         node.type === 'switch' ? '#10b981' : node.type === 'router' ? '#f97316' : '#8b5cf6'}
                  strokeWidth="2"
                  rx="8"
                />
                <foreignObject x={node.x + 7} y={node.y + 7} width="26" height="26">
                  {getNodeIcon(node.type)}
                </foreignObject>
                <text
                  x={node.x + 20}
                  y={node.y + 55}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {node.label}
                </text>
                {node.type === 'switch' || node.type === 'router' ? (
                  settings.qosEnabled && (
                    <circle
                      cx={node.x + 35}
                      cy={node.y + 5}
                      r="3"
                      fill="#10b981"
                      className="animate-pulse"
                    />
                  )
                ) : null}
              </g>
            ))}

            <g transform="translate(20, 20)">
              <rect width="280" height="80" fill="white" stroke="#d1d5db" strokeWidth="1" rx="8" fillOpacity="0.95" />
              <text x="10" y="20" className="text-sm font-semibold fill-gray-800">Legend</text>
              
              <line x1="10" y1="35" x2="30" y2="35" stroke="#ef4444" strokeWidth="4" />
              <text x="35" y="40" className="text-xs fill-gray-700">Voice (Priority)</text>
              
              <line x1="10" y1="50" x2="30" y2="50" stroke="#3b82f6" strokeWidth="2" />
              <text x="35" y="55" className="text-xs fill-gray-700">Data</text>
              
              <line x1="10" y1="65" x2="30" y2="65" stroke="#10b981" strokeWidth="2" />
              <text x="35" y="70" className="text-xs fill-gray-700">Trunk</text>
              
              <circle cx="150" cy="40" r="3" fill="#10b981" />
              <text x="160" y="45" className="text-xs fill-gray-700">QoS Enabled</text>
            </g>
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-blue-800 text-sm">Voice VLAN 100</h4>
            <p className="text-xs text-blue-600">Dedicated for IP phones with high priority</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-semibold text-gray-800 text-sm">Data VLAN 10</h4>
            <p className="text-xs text-gray-600">Regular computer traffic with normal priority</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Phone className="text-blue-600" />
          VoIP Network Quality Simulator
        </h1>
        <p className="text-gray-600">Real-time simulation of Voice over IP network performance and quality metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Wifi className="text-blue-500" />
            Network Configuration
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bandwidth (kbps)
              </label>
              <input
                type="range"
                min="64"
                max="2000"
                step="64"
                value={settings.bandwidth}
                onChange={(e) => setSettings(prev => ({...prev, bandwidth: parseInt(e.target.value)}))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600">{settings.bandwidth} kbps</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packet Loss (%)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={settings.packetLoss}
                onChange={(e) => setSettings(prev => ({...prev, packetLoss: parseFloat(e.target.value)}))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600">{settings.packetLoss}%</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jitter (ms)
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={settings.jitter}
                onChange={(e) => setSettings(prev => ({...prev, jitter: parseInt(e.target.value)}))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600">{settings.jitter} ms</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Latency (ms)
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={settings.latency}
                onChange={(e) => setSettings(prev => ({...prev, latency: parseInt(e.target.value)}))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600">{settings.latency} ms</span>
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.qosEnabled}
                  onChange={(e) => setSettings(prev => ({...prev, qosEnabled: e.target.checked}))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enable QoS (Quality of Service)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                QoS prioritizes voice traffic and reduces packet loss, jitter, and latency
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Stop' : 'Start'} Simulation
            </button>
            
            <button
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Voice Quality Metrics</h2>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getQualityIcon(callQuality.mos)}
                <span className="text-sm font-medium text-gray-600">MOS Score</span>
              </div>
              <div className={`text-4xl font-bold ${getQualityColor(callQuality.mos)}`}>
                {callQuality.mos}
              </div>
              <div className={`text-sm font-medium ${getQualityColor(callQuality.mos)}`}>
                {callQuality.status}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">R-Factor:</span>
                <span className="font-semibold">{callQuality.rFactor}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    callQuality.rFactor >= 80 ? 'bg-green-500' :
                    callQuality.rFactor >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${callQuality.rFactor}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">QoS Status:</span>
                <span className={settings.qosEnabled ? 'text-green-600 font-medium' : 'text-gray-500'}>
                  {settings.qosEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Codec:</span>
                <span className="font-medium">G.711 (64 kbps)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <NetworkTopology />
      </div>

      {networkData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Network Performance Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={networkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="packetLoss" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Packet Loss (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="jitter" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Jitter (ms)"
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Latency (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Current Network Status</h3>
            {networkData.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Network Load</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {networkData[networkData.length - 1]?.networkLoad}%
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Available Bandwidth</div>
                    <div className="text-2xl font-bold text-green-600">
                      {settings.bandwidth} kbps
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Packet Loss:</span>
                    <span className="font-semibold">
                      {networkData[networkData.length - 1]?.packetLoss}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Jitter:</span>
                    <span className="font-semibold">
                      {networkData[networkData.length - 1]?.jitter} ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Latency:</span>
                    <span className="font-semibold">
                      {networkData[networkData.length - 1]?.latency} ms
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Understanding VoIP Quality Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-blue-600 mb-2">MOS Score</h4>
            <p className="text-gray-600">
              Mean Opinion Score (1-5). Measures perceived voice quality.
              5 = Excellent, 4 = Good, 3 = Fair, 2 = Poor, 1 = Bad
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-green-600 mb-2">Packet Loss</h4>
            <p className="text-gray-600">
              Percentage of voice packets lost in transmission.
              &lt;1% = Good, 1-3% = Acceptable, &gt;3% = Poor quality
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-yellow-600 mb-2">Jitter</h4>
            <p className="text-gray-600">
              Variation in packet arrival times.
              &lt;20ms = Good, 20-50ms = Acceptable, &gt;50ms = Poor
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-purple-600 mb-2">Latency</h4>
            <p className="text-gray-600">
              One-way delay of voice packets.
              &lt;150ms = Good, 150-300ms = Acceptable, &gt;300ms = Poor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoIPNetworkSimulator;