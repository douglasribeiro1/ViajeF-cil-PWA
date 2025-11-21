import React, { useState } from 'react';
import { Trip, SuggestionItem } from '../types';
import { generateItinerarySuggestions } from '../services/geminiService';
import { Sparkles, MapPin, Loader2 } from 'lucide-react';

interface AssistantProps {
  trip: Trip;
  updateTrip: (data: Partial<Trip>) => void;
}

const AssistantView: React.FC<AssistantProps> = ({ trip }) => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const destinationStr = trip.destinations.map(d => d.name).join(', ');
    if (!destinationStr) return;
    
    setLoading(true);
    try {
        // Calculate days roughly
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 3;
        
        const result = await generateItinerarySuggestions(destinationStr, days, trip.budget);
        setSuggestions(result);
    } catch (error) {
        console.error(error);
        alert("Não foi possível gerar sugestões. Verifique sua API Key.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24 h-full flex flex-col animate-in fade-in bg-gradient-to-b from-indigo-50/50 to-white">
      <div className="text-center py-6">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Sparkles size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Assistente de Viagem</h2>
        <p className="text-gray-500 mt-2">
            Peça sugestões personalizadas para {trip.destinations.length > 0 ? trip.destinations.map(d => d.name).join(', ') : "sua viagem"}.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            {trip.destinations.length === 0 ? (
                <p className="text-gray-400 text-center">Adicione pelo menos uma cidade na tela inicial para receber sugestões.</p>
            ) : (
                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-indigo-200 hover:scale-105 transition flex items-center gap-3 disabled:opacity-70 disabled:scale-100"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                    Gerar Roteiro com IA
                </button>
            )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-gray-700">Sugestões Encontradas</h3>
                <button onClick={handleGenerate} className="text-xs text-indigo-600 font-medium">Gerar Novamente</button>
            </div>
            {suggestions.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm flex gap-4">
                    <div className="flex flex-col items-center justify-center w-12 bg-indigo-50 rounded-lg text-indigo-700 font-bold">
                        <span className="text-[10px] uppercase">Dia</span>
                        <span className="text-xl">{item.day}</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.activity}</h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={12}/> {item.location}</span>
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">R$ {item.estimatedCost}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AssistantView;