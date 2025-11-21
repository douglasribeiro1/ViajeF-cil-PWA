
import React, { useState, useMemo } from 'react';
import { Trip, Flight, Accommodation, Transfer, Activity, Attachment } from '../types';
import { Card } from './Card';
import { Plus, Trash2, Plane, Hotel, Bus, X, MapPin, Calendar, Paperclip, ExternalLink, Edit2, AlertTriangle } from 'lucide-react';

interface LogisticsProps {
  trip: Trip;
  updateTrip: (data: Partial<Trip>) => void;
}

type Tab = 'days' | 'flights' | 'hotels' | 'transfers';

const LogisticsView: React.FC<LogisticsProps> = ({ trip, updateTrip }) => {
  const [activeTab, setActiveTab] = useState<Tab>('days');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; type: Tab | null }>({
    isOpen: false,
    id: null,
    type: null
  });
  
  // Form States
  const [newFlight, setNewFlight] = useState<Partial<Flight>>({});
  const [newHotel, setNewHotel] = useState<Partial<Accommodation>>({});
  const [newTransfer, setNewTransfer] = useState<Partial<Transfer>>({});
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({});
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [tempAttachments, setTempAttachments] = useState<Attachment[]>([]);

  // Helper to open maps
  const openMap = (location: string) => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  // Handle file upload (limit size)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 500000) { // 500KB limit
        alert("Arquivo muito grande. O limite é 500KB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
        if (evt.target?.result) {
            setTempAttachments([...tempAttachments, {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.type,
                data: evt.target.result as string
            }]);
        }
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = (id: string) => {
    setTempAttachments(tempAttachments.filter(a => a.id !== id));
  };

  // Generate array of dates between start and end
  const tripDays = useMemo(() => {
    if (!trip.startDate || !trip.endDate) return [];
    const days = [];
    const dt = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    // Add logic to handle timezones correctly - set to noon to avoid DST issues
    dt.setUTCHours(12,0,0,0);
    end.setUTCHours(12,0,0,0);

    while (dt <= end) {
      days.push(new Date(dt).toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
    }
    return days;
  }, [trip.startDate, trip.endDate]);

  const openNewForm = () => {
      setEditingId(null);
      setNewFlight({});
      setNewHotel({});
      setNewTransfer({});
      setNewActivity({});
      setTempAttachments([]);
      // If in days tab, we don't set date here, user sets it via "Adicionar" button on specific day
      setShowForm(true);
  };

  const handleEdit = (item: any, type: Tab) => {
      setEditingId(item.id);
      setTempAttachments(item.attachments || []);
      
      if (type === 'flights') {
          setNewFlight(item);
      } else if (type === 'hotels') {
          setNewHotel(item);
      } else if (type === 'transfers') {
          setNewTransfer(item);
      } else if (type === 'days') {
          setNewActivity(item);
          setSelectedDayDate(item.date);
      }
      setShowForm(true);
  };

  const handleSave = () => {
    const id = editingId || Math.random().toString(36).substr(2, 9);

    if (activeTab === 'flights') {
        if (!newFlight.airline || !newFlight.flightNumber) return;
        const flight = { ...newFlight, id, price: Number(newFlight.price) || 0, attachments: tempAttachments } as Flight;
        
        if (editingId) {
            updateTrip({ flights: (trip.flights || []).map(f => f.id === editingId ? flight : f) });
        } else {
            updateTrip({ flights: [...(trip.flights || []), flight] });
        }
    } else if (activeTab === 'hotels') {
        if (!newHotel.name) return;
        const hotel = { ...newHotel, id, price: Number(newHotel.price) || 0, attachments: tempAttachments } as Accommodation;
        
        if (editingId) {
            updateTrip({ accommodations: (trip.accommodations || []).map(h => h.id === editingId ? hotel : h) });
        } else {
            updateTrip({ accommodations: [...(trip.accommodations || []), hotel] });
        }
    } else if (activeTab === 'transfers') {
        if (!newTransfer.from || !newTransfer.to) return;
        const transfer = { ...newTransfer, id, price: Number(newTransfer.price) || 0 } as Transfer;
        
        if (editingId) {
            updateTrip({ transfers: (trip.transfers || []).map(t => t.id === editingId ? transfer : t) });
        } else {
            updateTrip({ transfers: [...(trip.transfers || []), transfer] });
        }
    } else if (activeTab === 'days') {
        if (!newActivity.description || !newActivity.date) return;
        const activity = { ...newActivity, id, cost: Number(newActivity.cost) || 0, completed: false } as Activity;
        
        if (editingId) {
            updateTrip({ activities: (trip.activities || []).map(a => a.id === editingId ? activity : a) });
        } else {
            updateTrip({ activities: [...(trip.activities || []), activity] });
        }
    }
    setShowForm(false);
    setEditingId(null);
    setNewFlight({}); setNewHotel({}); setNewTransfer({}); setNewActivity({});
    setTempAttachments([]);
    setSelectedDayDate(null);
  };

  // 1. Request Delete (Opens Modal)
  const requestDelete = (e: React.MouseEvent, id: string, type: Tab) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, id, type });
  };

  // 2. Confirm Delete (Execute Logic)
  const confirmDelete = () => {
    const { id, type } = deleteConfirm;
    if (!id || !type) return;

    if (type === 'flights') {
        updateTrip({ flights: (trip.flights || []).filter(f => f.id !== id) });
    } else if (type === 'hotels') {
        updateTrip({ accommodations: (trip.accommodations || []).filter(h => h.id !== id) });
    } else if (type === 'transfers') {
        updateTrip({ transfers: (trip.transfers || []).filter(t => t.id !== id) });
    } else if (type === 'days') {
        updateTrip({ activities: (trip.activities || []).filter(a => a.id !== id) });
    }
    setDeleteConfirm({ isOpen: false, id: null, type: null });
  };

  const openActivityForm = (date: string) => {
    setEditingId(null);
    setNewActivity({ date });
    setSelectedDayDate(date);
    setShowForm(true);
  }

  return (
    <div className="p-4 pb-24 h-full flex flex-col animate-in fade-in">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Roteiro</h2>
            {activeTab !== 'days' && (
                <button 
                    type="button"
                    onClick={openNewForm}
                    className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
                >
                    <Plus size={24} />
                </button>
            )}
        </div>
        
        {/* Scrollable Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 mb-4">
            <button 
                type="button"
                onClick={() => setActiveTab('days')}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-all border ${activeTab === 'days' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
            >
                Dia a Dia
            </button>
            <button 
                type="button"
                onClick={() => setActiveTab('flights')}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-all border ${activeTab === 'flights' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
            >
                Voos
            </button>
            <button 
                type="button"
                onClick={() => setActiveTab('hotels')}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-all border ${activeTab === 'hotels' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
            >
                Hotéis
            </button>
            <button 
                type="button"
                onClick={() => setActiveTab('transfers')}
                className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-all border ${activeTab === 'transfers' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
            >
                Transfers
            </button>
        </div>

        {/* Delete Confirmation Modal (Custom UI) */}
        {deleteConfirm.isOpen && (
             <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir Item?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Esta ação não pode ser desfeita. O item será removido permanentemente do roteiro.</p>
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => setDeleteConfirm({ isOpen: false, id: null, type: null })}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {/* Add/Edit Item Modal */}
        {showForm && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">
                            {editingId ? 'Editar' : 'Adicionar'} 
                            {activeTab === 'days' ? (selectedDayDate ? ` - ${new Date(selectedDayDate).toLocaleDateString('pt-BR')}` : ' Atividade') : 
                             activeTab === 'flights' ? ' Voo' : 
                             activeTab === 'hotels' ? ' Hospedagem' : ' Transfer'}
                        </h3>
                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    
                    <div className="space-y-3">
                        {activeTab === 'days' && (
                            <>
                                <input placeholder="O que vamos fazer?" className="w-full p-3 border rounded-lg" value={newActivity.description || ''} onChange={e => setNewActivity({...newActivity, description: e.target.value})} autoFocus />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="time" className="w-full p-3 border rounded-lg" value={newActivity.time || ''} onChange={e => setNewActivity({...newActivity, time: e.target.value})} />
                                    <input type="number" placeholder="Custo (est.)" className="w-full p-3 border rounded-lg" value={newActivity.cost || ''} onChange={e => setNewActivity({...newActivity, cost: Number(e.target.value)})} />
                                </div>
                                <input placeholder="Local (Endereço/Link)" className="w-full p-3 border rounded-lg" value={newActivity.location || ''} onChange={e => setNewActivity({...newActivity, location: e.target.value})} />
                            </>
                        )}

                        {activeTab === 'flights' && (
                            <>
                                <input placeholder="Companhia Aérea" className="w-full p-3 border rounded-lg" value={newFlight.airline || ''} onChange={e => setNewFlight({...newFlight, airline: e.target.value})} />
                                <input placeholder="Número do Voo" className="w-full p-3 border rounded-lg" value={newFlight.flightNumber || ''} onChange={e => setNewFlight({...newFlight, flightNumber: e.target.value})} />
                                <label className="block text-sm text-gray-600">Data e Hora de Saída</label>
                                <input type="datetime-local" className="w-full p-3 border rounded-lg" value={newFlight.departureTime || ''} onChange={e => setNewFlight({...newFlight, departureTime: e.target.value})} />
                                <input placeholder="Descrição (assento, terminal)" className="w-full p-3 border rounded-lg" value={newFlight.description || ''} onChange={e => setNewFlight({...newFlight, description: e.target.value})} />
                                <input type="number" placeholder="Preço" className="w-full p-3 border rounded-lg" value={newFlight.price || ''} onChange={e => setNewFlight({...newFlight, price: Number(e.target.value)})} />
                                
                                {/* Attachments */}
                                <div className="border-t border-gray-200 pt-3 mt-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Anexos (Bilhetes/PDFs)</label>
                                    <input type="file" onChange={handleFileUpload} className="text-sm w-full mb-2 text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    {tempAttachments.map(a => (
                                        <div key={a.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm mb-1">
                                            <span className="truncate max-w-[200px]">{a.name}</span>
                                            <button type="button" onClick={() => removeAttachment(a.id)} className="text-red-500"><X size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'hotels' && (
                            <>
                                <input placeholder="Nome do Hotel/Local" className="w-full p-3 border rounded-lg" value={newHotel.name || ''} onChange={e => setNewHotel({...newHotel, name: e.target.value})} />
                                <input placeholder="Endereço" className="w-full p-3 border rounded-lg" value={newHotel.address || ''} onChange={e => setNewHotel({...newHotel, address: e.target.value})} />
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Check-in</label>
                                        <input type="date" className="w-full p-3 border rounded-lg" value={newHotel.checkIn || ''} onChange={e => setNewHotel({...newHotel, checkIn: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Check-out</label>
                                        <input type="date" className="w-full p-3 border rounded-lg" value={newHotel.checkOut || ''} onChange={e => setNewHotel({...newHotel, checkOut: e.target.value})} />
                                    </div>
                                </div>
                                <input placeholder="Cód. Reserva" className="w-full p-3 border rounded-lg" value={newHotel.reservationCode || ''} onChange={e => setNewHotel({...newHotel, reservationCode: e.target.value})} />
                                <input type="number" placeholder="Preço" className="w-full p-3 border rounded-lg" value={newHotel.price || ''} onChange={e => setNewHotel({...newHotel, price: Number(e.target.value)})} />
                                
                                {/* Attachments */}
                                <div className="border-t border-gray-200 pt-3 mt-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Anexos (Reserva/Voucher)</label>
                                    <input type="file" onChange={handleFileUpload} className="text-sm w-full mb-2 text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    {tempAttachments.map(a => (
                                        <div key={a.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm mb-1">
                                            <span className="truncate max-w-[200px]">{a.name}</span>
                                            <button type="button" onClick={() => removeAttachment(a.id)} className="text-red-500"><X size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'transfers' && (
                            <>
                                <input placeholder="De (Origem)" className="w-full p-3 border rounded-lg" value={newTransfer.from || ''} onChange={e => setNewTransfer({...newTransfer, from: e.target.value})} />
                                <input placeholder="Para (Destino)" className="w-full p-3 border rounded-lg" value={newTransfer.to || ''} onChange={e => setNewTransfer({...newTransfer, to: e.target.value})} />
                                <label className="block text-sm text-gray-600">Data e Hora</label>
                                <input type="datetime-local" className="w-full p-3 border rounded-lg" value={newTransfer.date || ''} onChange={e => setNewTransfer({...newTransfer, date: e.target.value})} />
                                <input placeholder="Meio (Uber, Trem, Ônibus)" className="w-full p-3 border rounded-lg" value={newTransfer.method || ''} onChange={e => setNewTransfer({...newTransfer, method: e.target.value})} />
                                <input type="number" placeholder="Preço" className="w-full p-3 border rounded-lg" value={newTransfer.price || ''} onChange={e => setNewTransfer({...newTransfer, price: Number(e.target.value)})} />
                            </>
                        )}

                        <button type="button" onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-lg mt-4">
                            {editingId ? 'Atualizar' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto pb-10 space-y-4">
            
            {activeTab === 'days' && (
                tripDays.length > 0 ? (
                    <div className="space-y-6">
                        {tripDays.map(date => {
                            const dayActivities = (trip.activities || []).filter(a => a.date === date).sort((a,b) => (a.time || '').localeCompare(b.time || ''));
                            const dateObj = new Date(date + 'T12:00:00'); // Fix timezone offset for display
                            
                            return (
                                <div key={date} className="relative pl-4 border-l-2 border-blue-100">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></div>
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-800 capitalize">
                                                {dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })}
                                            </h3>
                                            <p className="text-sm text-gray-500">{dateObj.toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <button type="button" onClick={() => openActivityForm(date)} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
                                            <Plus size={14} /> Adicionar
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {dayActivities.map(activity => (
                                            <div key={activity.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex justify-between group">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 font-medium text-gray-800">
                                                        {activity.time && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">{activity.time}</span>}
                                                        {activity.description}
                                                    </div>
                                                    {activity.location && (
                                                        <div 
                                                            onClick={() => openMap(activity.location!)}
                                                            className="text-xs text-blue-500 flex items-center gap-1 mt-1 cursor-pointer hover:underline"
                                                        >
                                                            <MapPin size={10}/> {activity.location}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 items-start ml-2">
                                                    <button type="button" onClick={() => handleEdit(activity, 'days')} className="text-gray-400 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-full">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button type="button" onClick={(e) => requestDelete(e, activity.id, 'days')} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {dayActivities.length === 0 && <p className="text-xs text-gray-400 italic">Nada planejado para este dia.</p>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Defina as datas de início e fim da viagem na tela inicial para planejar o dia a dia.</p>
                    </div>
                )
            )}

            {activeTab === 'flights' && (trip.flights || []).map(f => (
                <Card key={f.id} title={f.airline} subtitle={`Voo: ${f.flightNumber}`} icon={<Plane size={20}/>} 
                    action={
                        <div className="flex gap-1">
                            <button type="button" onClick={() => handleEdit(f, 'flights')} className="text-gray-400 p-2 hover:bg-blue-50 hover:text-blue-500 rounded-full"><Edit2 size={18}/></button>
                            <button type="button" onClick={(e) => requestDelete(e, f.id, 'flights')} className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-full"><Trash2 size={18}/></button>
                        </div>
                    }>
                    <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 mt-2">
                        <div className="col-span-2"><span className="font-medium text-gray-800">Saída:</span> {f.departureTime ? new Date(f.departureTime).toLocaleString('pt-BR') : 'N/A'}</div>
                        {f.price ? <div><span className="font-medium text-gray-800">R$ {f.price.toFixed(2)}</span></div> : null}
                    </div>
                    {f.attachments && f.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-50 pt-2">
                            {f.attachments.map(att => (
                                <a key={att.id} href={att.data} download={att.name} className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">
                                    <Paperclip size={10}/> {att.name}
                                </a>
                            ))}
                        </div>
                    )}
                </Card>
            ))}
            
            {activeTab === 'hotels' && (trip.accommodations || []).map(h => (
                <Card key={h.id} title={h.name} subtitle={h.address} icon={<Hotel size={20}/>}
                    action={
                        <div className="flex gap-1">
                            <button type="button" onClick={() => handleEdit(h, 'hotels')} className="text-gray-400 p-2 hover:bg-blue-50 hover:text-blue-500 rounded-full"><Edit2 size={18}/></button>
                            <button type="button" onClick={(e) => requestDelete(e, h.id, 'hotels')} className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-full"><Trash2 size={18}/></button>
                        </div>
                    }>
                     <div className="text-sm text-gray-600 mt-2 grid grid-cols-2 gap-2">
                        <div><span className="text-xs text-gray-400 block">Check-in</span>{h.checkIn ? new Date(h.checkIn).toLocaleDateString('pt-BR') : 'N/A'}</div>
                        <div><span className="text-xs text-gray-400 block">Check-out</span>{h.checkOut ? new Date(h.checkOut).toLocaleDateString('pt-BR') : 'N/A'}</div>
                        {h.address && (
                             <div onClick={() => openMap(h.address)} className="col-span-2 flex items-center gap-1 text-blue-500 text-xs cursor-pointer hover:underline mt-1">
                                <ExternalLink size={10} /> Ver no mapa
                             </div>
                        )}
                        {h.reservationCode && <div className="col-span-2 mt-1 font-mono bg-gray-100 inline-block px-2 py-1 rounded text-xs text-gray-800 w-fit">Res: {h.reservationCode}</div>}
                    </div>
                    {h.attachments && h.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-50 pt-2">
                            {h.attachments.map(att => (
                                <a key={att.id} href={att.data} download={att.name} className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">
                                    <Paperclip size={10}/> {att.name}
                                </a>
                            ))}
                        </div>
                    )}
                </Card>
            ))}

            {activeTab === 'transfers' && (trip.transfers || []).map(t => (
                <Card key={t.id} title={t.method} subtitle={`${t.from} ➔ ${t.to}`} icon={<Bus size={20}/>}
                    action={
                        <div className="flex gap-1">
                            <button type="button" onClick={() => handleEdit(t, 'transfers')} className="text-gray-400 p-2 hover:bg-blue-50 hover:text-blue-500 rounded-full"><Edit2 size={18}/></button>
                            <button type="button" onClick={(e) => requestDelete(e, t.id, 'transfers')} className="text-gray-400 p-2 hover:bg-red-50 hover:text-red-500 rounded-full"><Trash2 size={18}/></button>
                        </div>
                    }>
                    <div className="text-sm text-gray-600 mt-2">
                        <div>{t.date ? new Date(t.date).toLocaleString('pt-BR') : 'Data não definida'}</div>
                        {t.price ? <div className="font-medium text-gray-800 mt-1">R$ {t.price.toFixed(2)}</div> : null}
                    </div>
                </Card>
            ))}

            {((activeTab === 'flights' && (trip.flights || []).length === 0) ||
              (activeTab === 'hotels' && (trip.accommodations || []).length === 0) ||
              (activeTab === 'transfers' && (trip.transfers || []).length === 0)) && (
                <div className="text-center text-gray-400 mt-10">
                    <p>Nenhum item cadastrado.</p>
                    <button type="button" onClick={openNewForm} className="text-blue-600 font-medium mt-2">Adicionar agora</button>
                </div>
            )}
        </div>
    </div>
  );
};

export default LogisticsView;
