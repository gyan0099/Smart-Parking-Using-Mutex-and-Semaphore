import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';

import DashboardPage from './pages/DashboardPage';
import ParkingMapPage from './pages/ParkingMapPage';
import VehicleEntryPage from './pages/VehicleEntryPage';
import VehicleExitPage from './pages/VehicleExitPage';
import WaitingQueuePage from './pages/WaitingQueuePage';
import SyncMonitorPage from './pages/SyncMonitorPage';
import SimulationPage from './pages/SimulationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import DocumentationPage from './pages/DocumentationPage';
import TestsPage from './pages/TestsPage';

import { 
  fetchParkingState, 
  submitVehicleEntry, 
  submitVehicleExit, 
  cancelQueueRequest, 
  toggleSlotMaintenance, 
  resetSystem 
} from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [parkingState, setParkingState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);
  const wsRef = useRef(null);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial HTTP Fetch
  const loadState = async () => {
    try {
      const data = await fetchParkingState();
      setParkingState(data);
    } catch (err) {
      console.error('Failed to load initial parking state:', err);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // WebSocket Connection Lifecycle
  useEffect(() => {
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'INITIAL_STATE' || msg.type === 'STATE_UPDATE') {
            setParkingState(msg.data);
          }
          if (msg.notification) {
            addToast(msg.notification);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 2000);
      };

      ws.onerror = () => {
        setIsConnected(false);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Handlers for child pages
  const handleVehicleEntry = async (data) => {
    const res = await submitVehicleEntry(data);
    return res;
  };

  const handleVehicleExit = async (data) => {
    const res = await submitVehicleExit(data);
    return res;
  };

  const handleCancelQueue = async (queueId) => {
    const res = await cancelQueueRequest(queueId);
    return res;
  };

  const handleToggleMaintenance = async (slotNumber, maintenance) => {
    const res = await toggleSlotMaintenance(slotNumber, maintenance);
    return res;
  };

  const handleReset = async () => {
    try {
      await resetSystem(true);
      addToast({
        type: 'info',
        title: 'System Restored',
        message: 'Default demo state successfully loaded into SQLite database.',
      });
      loadState();
    } catch (err) {
      console.error(err);
    }
  };

  const queueCount = parkingState?.waiting_queue?.length || 0;

  return (
    <div className="min-h-screen bg-[#0a0f1d] flex flex-col font-sans">
      <Navbar
        isConnected={isConnected}
        onReset={handleReset}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          queueCount={queueCount}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#070b16]">
          {activePage === 'dashboard' && (
            <DashboardPage
              state={parkingState}
              setActivePage={setActivePage}
              onReset={handleReset}
            />
          )}

          {activePage === 'parking_map' && (
            <ParkingMapPage
              state={parkingState}
              onExitVehicle={handleVehicleExit}
              onToggleMaintenance={handleToggleMaintenance}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'entry' && (
            <VehicleEntryPage
              onVehicleEntry={handleVehicleEntry}
              state={parkingState}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'exit' && (
            <VehicleExitPage
              onVehicleExit={handleVehicleExit}
              state={parkingState}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'queue' && (
            <WaitingQueuePage
              state={parkingState}
              onCancelQueue={handleCancelQueue}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'sync_monitor' && (
            <SyncMonitorPage
              state={parkingState}
            />
          )}

          {activePage === 'simulation' && (
            <SimulationPage />
          )}

          {activePage === 'analytics' && (
            <AnalyticsPage
              state={parkingState}
            />
          )}

          {activePage === 'history' && (
            <HistoryPage />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              state={parkingState}
              onReset={handleReset}
            />
          )}

          {activePage === 'documentation' && (
            <DocumentationPage />
          )}

          {activePage === 'tests' && (
            <TestsPage />
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
