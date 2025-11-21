
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import DashboardView from './components/DashboardView';
import LogisticsView from './components/LogisticsView';
import ExpensesView from './components/ExpensesView';
import TripListView from './components/TripListView';
import { AppView, Trip } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  // Load trips from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem('viajafacil_trips');
    const savedLegacy = localStorage.getItem('viajafacil_trip'); // Migration for legacy single trip

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Sanitize data to ensure all arrays exist
        if (Array.isArray(parsedData)) {
            const sanitizedTrips = parsedData.map((t: any) => ({
                ...t,
                destinations: t.destinations || [],
                flights: t.flights || [],
                accommodations: t.accommodations || [],
                transfers: t.transfers || [],
                expenses: t.expenses || [],
                activities: t.activities || []
            }));
            setTrips(sanitizedTrips);
        }
      } catch (e) {
        console.error("Failed to parse trips", e);
        setTrips([]);
      }
    } else if (savedLegacy) {
      // Migration logic: Convert old single trip to new array format
      try {
        const legacyTrip = JSON.parse(savedLegacy);
        const migratedTrip: Trip = {
            ...legacyTrip,
            id: 'legacy-trip',
            name: legacyTrip.destination || 'Minha Viagem',
            destinations: legacyTrip.destination ? [{ id: '1', name: legacyTrip.destination }] : [],
            activities: [],
            flights: legacyTrip.flights || [],
            accommodations: legacyTrip.accommodations || [],
            transfers: legacyTrip.transfers || [],
            expenses: legacyTrip.expenses || []
        };
        setTrips([migratedTrip]);
        localStorage.removeItem('viajafacil_trip'); // Clean up legacy
      } catch (e) { console.error(e); }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('viajafacil_trips', JSON.stringify(trips));
  }, [trips]);

  const createTrip = (newTrip: Trip) => {
    setTrips([...trips, newTrip]);
    setActiveTripId(newTrip.id);
    setCurrentView(AppView.DASHBOARD);
  };

  const updateActiveTrip = (data: Partial<Trip>) => {
    if (!activeTripId) return;
    setTrips(prev => prev.map(t => t.id === activeTripId ? { ...t, ...data } : t));
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    if (activeTripId === id) setActiveTripId(null);
  };

  const importTrips = (importedTrips: Trip[]) => {
      // Sanitize imported trips too
      const sanitizedImport = importedTrips.map((t: any) => ({
          ...t,
          destinations: t.destinations || [],
          flights: t.flights || [],
          accommodations: t.accommodations || [],
          transfers: t.transfers || [],
          expenses: t.expenses || [],
          activities: t.activities || []
      }));
      setTrips(sanitizedImport);
  }

  const activeTrip = trips.find(t => t.id === activeTripId);

  if (!activeTripId || !activeTrip) {
    return (
      <TripListView 
        trips={trips} 
        onSelectTrip={(id) => { setActiveTripId(id); setCurrentView(AppView.DASHBOARD); }} 
        onCreateTrip={createTrip}
        onDeleteTrip={deleteTrip}
        onImportTrips={importTrips}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <DashboardView trip={activeTrip} updateTrip={updateActiveTrip} onBack={() => setActiveTripId(null)} />;
      case AppView.LOGISTICS:
        return <LogisticsView trip={activeTrip} updateTrip={updateActiveTrip} />;
      case AppView.EXPENSES:
        return <ExpensesView trip={activeTrip} updateTrip={updateActiveTrip} />;
      default:
        return <DashboardView trip={activeTrip} updateTrip={updateActiveTrip} onBack={() => setActiveTripId(null)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <main className="flex-1 overflow-hidden relative">
        {renderView()}
      </main>
      <Navigation currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;
