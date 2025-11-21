import React, { useState } from 'react';
import { Trip, Destination } from '../types';
import { Card } from './Card';
import { MapPin, Calendar, Wallet, Edit2, Plane, ArrowLeft, Plus, X, Coins } from 'lucide-react';

interface DashboardProps {
  trip: Trip;
  updateTrip: (data: Partial<Trip>) => void;
  onBack: () => void;
}

const DashboardView: React.FC<DashboardProps> = ({ trip, updateTrip, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTrip, setTempTrip] = useState(trip);
  const [newDest, setNewDest] = useState('');

  const totalExpenses = trip.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = trip.budget - totalExpenses;
  const progress = trip.budget > 0 ? Math.min((totalExpenses / trip.budget) * 100, 100) : 0;

  const handleSave = () => {
    updateTrip(tempTrip);
    setIsEditing(false);
  };

  const addDestination = () => {
    if(!newDest.trim()) return;
    const dest: Destination = { id: Math.random().toString(36).substr(2, 9), name: newDest };
    setTempTrip({ ...tempTrip, destinations: [...tempTrip.destinations, dest] });
    setNewDest('');
  };

  const removeDestination = (id: string) => {
    setTempTrip({ ...tempTrip, destinations: tempTrip.destinations.filter(d => d.id !== id) });
  };

  if (isEditing) {
    return (
      <div className="p-4 pb-24 space-y-4 animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-2xl font-bold text-gray-800">Editar Roteiro</h2>
        <div className="space-y-3">
            <label className="block">
                <span className="text-gray-700">Nome da Viagem</span>
                <input 
                    type="text" 
                    value={tempTrip.name}
                    onChange={(e) => setTempTrip({...tempTrip, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"
                />
            </label>
            
            <div>
                <span className="text-gray-700">Cidades / Destinos</span>
                <div className="flex gap-2 mt-1 mb-2">
                    <input 
                        type="text"
                        placeholder="Adicionar cidade..."
                        className="flex-1 rounded-md border p-3"
                        value={newDest}
                        onChange={(e) => setNewDest(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addDestination()}
                    />
                    <button onClick={addDestination} className="bg-blue-600 text-white p-3 rounded-md"><Plus/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tempTrip.destinations.map(d => (
                        <span key={d.id} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                            {d.name}
                            <button onClick={() => removeDestination(d.id)}><X size={14}/></button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-gray-700">Início</span>
                    <input 
                        type="date" 
                        value={tempTrip.startDate}
                        onChange={(e) => setTempTrip({...tempTrip, startDate: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"
                    />
                </label>
                <label className="block">
                    <span className="text-gray-700">Fim</span>
                    <input 
                        type="date" 
                        value={tempTrip.endDate}
                        onChange={(e) => setTempTrip({...tempTrip, endDate: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"
                    />
                </label>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3">
                <h3 className="text-gray-800 font-medium mb-2 flex items-center gap-2"><Wallet size={18}/> Orçamento & Moeda</h3>
                <label className="block mb-3">
                    <span className="text-gray-700 text-sm">Orçamento Total (R$)</span>
                    <input 
                        type="number" 
                        value={tempTrip.budget}
                        onChange={(e) => setTempTrip({...tempTrip, budget: Number(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"
                    />
                </label>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="block">
                        <span className="text-gray-600 text-xs">Moeda Estrangeira (Opcional)</span>
                        <input 
                            type="text" 
                            placeholder="Ex: USD, EUR"
                            value={tempTrip.foreignCurrency || ''}
                            onChange={(e) => setTempTrip({...tempTrip, foreignCurrency: e.target.value.toUpperCase()})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                        />
                    </label>
                    <label className="block">
                        <span className="text-gray-600 text-xs">Cotação Média</span>
                        <input 
                            type="number" 
                            placeholder="Ex: 5.50"
                            value={tempTrip.defaultExchangeRate || ''}
                            onChange={(e) => setTempTrip({...tempTrip, defaultExchangeRate: Number(e.target.value)})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                        />
                    </label>
                </div>
            </div>

        </div>
        <div className="flex gap-3 mt-6">
            <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-200 rounded-lg font-medium">Cancelar</button>
            <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg shadow-blue-600/30">Salvar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition z-20">
            <ArrowLeft size={20} />
        </button>
        
        <div className="relative z-10 mt-8">
          <div className="flex justify-between items-start">
            <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Roteiro de viagem</p>
                <h1 className="text-3xl font-bold break-words pr-2">{trip.name}</h1>
            </div>
            <button onClick={() => setIsEditing(true)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition shrink-0">
                <Edit2 size={18} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {trip.destinations.length > 0 ? (
                trip.destinations.map(d => (
                    <span key={d.id} className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                        <MapPin size={10} /> {d.name}
                    </span>
                ))
            ) : (
                <span className="text-blue-100 text-sm italic">Adicione cidades...</span>
            )}
          </div>
          
          <div className="mt-6 flex gap-4 text-sm font-medium text-blue-50">
            <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{trip.startDate ? new Date(trip.startDate).toLocaleDateString('pt-BR') : '--/--'}</span>
            </div>
            <span>até</span>
            <div className="flex items-center gap-1">
                <span>{trip.endDate ? new Date(trip.endDate).toLocaleDateString('pt-BR') : '--/--'}</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-12 w-24 h-24 bg-teal-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Orçamento" icon={<Wallet size={20} />} className="mb-0 bg-blue-50/50 border-blue-100">
            <div className="text-xl sm:text-2xl font-bold text-gray-800">R$ {trip.budget.toLocaleString('pt-BR')}</div>
            <div className="text-xs text-gray-500">Total Planejado</div>
        </Card>
        <Card title="Disponível" icon={<div className={`w-2 h-2 rounded-full ${remainingBudget < 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>} className="mb-0 bg-green-50/50 border-green-100">
            <div className={`text-xl sm:text-2xl font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                R$ {remainingBudget.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-gray-500">Restante</div>
        </Card>
      </div>

      {/* Budget Progress */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Gastos: R$ {totalExpenses.toLocaleString('pt-BR')}</span>
            <span className="text-gray-400">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-500 ${remainingBudget < 0 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700 ml-1">Próximos Passos</h3>
        {!trip.flights.length && (
             <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-center gap-3 text-orange-700">
                <Plane size={18} />
                <span className="text-sm">Adicione voos no Roteiro</span>
             </div>
        )}
        {!trip.accommodations.length && (
             <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-center gap-3 text-indigo-700">
                <MapPin size={18} />
                <span className="text-sm">Onde vai ficar? Adicione hospedagem.</span>
             </div>
        )}
        {trip.foreignCurrency && (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-3 text-emerald-700">
                <Coins size={18} />
                <span className="text-sm">Moeda configurada: {trip.foreignCurrency} (Cotação ref: {trip.defaultExchangeRate})</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;