/**
 * API Service for Smart Parking Slot Allocation System
 * Product 9 - OS & CN Lab (SR University)
 */

const BASE_URL = ''; // Relative path leverages Vite dev server proxy

export async function fetchParkingState() {
  const res = await fetch(`${BASE_URL}/api/parking/state`);
  if (!res.ok) throw new Error('Failed to fetch parking state');
  return res.json();
}

export async function submitVehicleEntry(data) {
  const res = await fetch(`${BASE_URL}/api/parking/entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function submitVehicleExit(data) {
  const res = await fetch(`${BASE_URL}/api/parking/exit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Vehicle exit failed');
  return json;
}

export async function cancelQueueRequest(queueId) {
  const res = await fetch(`${BASE_URL}/api/parking/queue/${queueId}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Cancellation failed');
  return json;
}

export async function fetchSyncState() {
  const res = await fetch(`${BASE_URL}/api/sync/state`);
  if (!res.ok) throw new Error('Failed to fetch synchronization state');
  return res.json();
}

export async function fetchAnalytics(rangeFilter = 'all') {
  const res = await fetch(`${BASE_URL}/api/analytics/dashboard?range_filter=${rangeFilter}`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchVehicleHistory() {
  const res = await fetch(`${BASE_URL}/api/analytics/history`);
  if (!res.ok) throw new Error('Failed to fetch vehicle history');
  return res.json();
}

export async function updateCapacity(totalSlots) {
  const res = await fetch(`${BASE_URL}/api/settings/capacity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ total_slots: totalSlots }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Capacity update failed');
  return json;
}

export async function toggleSlotMaintenance(slotNumber, maintenance) {
  const res = await fetch(`${BASE_URL}/api/settings/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slot_number: slotNumber, maintenance }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || 'Maintenance update failed');
  return json;
}

export async function resetSystem(demoData = true) {
  const res = await fetch(`${BASE_URL}/api/settings/reset?demo_data=${demoData}`, {
    method: 'POST',
  });
  return res.json();
}

export async function runAutomatedTests() {
  const res = await fetch(`${BASE_URL}/api/tests/run`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Test execution failed');
  return res.json();
}

export async function startSimulation(config) {
  const res = await fetch(`${BASE_URL}/api/simulation/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function pauseSimulation() {
  const res = await fetch(`${BASE_URL}/api/simulation/pause`, { method: 'POST' });
  return res.json();
}

export async function resumeSimulation() {
  const res = await fetch(`${BASE_URL}/api/simulation/resume`, { method: 'POST' });
  return res.json();
}

export async function stopSimulation() {
  const res = await fetch(`${BASE_URL}/api/simulation/stop`, { method: 'POST' });
  return res.json();
}

export async function resetSimulation() {
  const res = await fetch(`${BASE_URL}/api/simulation/reset`, { method: 'POST' });
  return res.json();
}

export async function fetchSimulationStatus() {
  const res = await fetch(`${BASE_URL}/api/simulation/status`);
  return res.json();
}
