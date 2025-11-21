
import React, { useState, useRef } from 'react';
import { Trip } from '../types';
import { Plus, Map, Calendar, ChevronRight, Trash2, Download, Upload, AlertCircle } from 'lucide-react';

interface TripListViewProps {
  trips: Trip[];
  onSelectTrip: (id: string) => void;
  onCreateTrip: (trip: Trip) => void;
  onDeleteTrip: (id: string) => void;
  onImportTrips?: (trips: Trip[]) => void;
}

const TripListView: React.FC<TripListViewProps> = ({ trips, onSelectTrip, onCreateTrip, onDeleteTrip, onImportTrips }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!newTripName.trim()) return;
    
    const newTrip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTripName,
      destinations: [],
      startDate: '',
      endDate: '',
      budget: 0,
      flights: [],
      accommodations: [],
      transfers: [],
      expenses: [],
      activities: []
    };

    onCreateTrip(newTrip);
    setNewTripName('');
    setIsCreating(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(trips, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `backup_viajafacil_${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        if (Array.isArray(importedData)) {
            // Basic validation check
            if(onImportTrips) {
                onImportTrips(importedData);
                alert('Roteiros restaurados com sucesso!');
            }
        } else {
            alert('Arquivo inválido. O backup deve conter uma lista de roteiros.');
        }
      } catch (error) {
        console.error(error);
        alert('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-10 animate-in fade-in">
      <div className="flex justify-between items-center mb-6 mt-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Roteiros</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie suas próximas aventuras</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Backup Actions */}
      <div className="flex gap-3 mb-6">
        <button onClick={handleExport} className="flex-1 bg-white border border-gray-200 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
            <Download size={16} /> Backup
        </button>
        <button onClick={handleImportClick} className="flex-1 bg-white border border-gray-200 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
            <Upload size={16} /> Restaurar
        </button>
        <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json" className="hidden" />
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95">
              <h3 className="text-xl font-bold mb-4">Nova Viagem</h3>
              <input 
                autoFocus
                placeholder="Nome da viagem (ex: Férias 2025)" 
                className="w-full p-3 border rounded-lg mb-4"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <div className="flex gap-3">
                <button onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-gray-200 rounded-lg font-medium">Cancelar</button>
                <button onClick={handleCreate} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">Criar</button>
              </div>
           </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Map size={48} className="mx-auto mb-4 opacity-20" />
            <p>Você ainda não tem roteiros.</p>
            <button onClick={() => setIsCreating(true)} className="text-blue-600 font-medium mt-2">Criar o primeiro</button>
          </div>
        ) : (
          trips.map(trip => (
            <div 
              key={trip.id} 
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform relative group"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteTrip(trip.id); }}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-1"
              >
                <Trash2 size={18} />
              </button>
              
              <div onClick={() => onSelectTrip(trip.id)} className="cursor-pointer">
                <h3 className="font-bold text-lg text-gray-800 pr-8">{trip.name}</h3>
                
                <div className="mt-3 flex flex-wrap gap-2">
                   {trip.destinations.length > 0 ? (
                      trip.destinations.map(d => (
                        <span key={d.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                          {d.name}
                        </span>
                      ))
                   ) : (
                     <span className="text-xs text-gray-400 italic">Sem destinos definidos</span>
                   )}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>
                      {trip.startDate ? new Date(trip.startDate).toLocaleDateString('pt-BR') : 'Data ind.'}
                    </span>
                  </div>
                  <div className="flex items-center text-blue-600 font-medium">
                    Abrir <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TripListView;
