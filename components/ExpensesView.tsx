
import React, { useState, useEffect } from 'react';
import { Trip, Expense } from '../types';
import { Plus, DollarSign, PieChart, X, Trash2, Globe, Edit2, AlertTriangle } from 'lucide-react';

interface ExpensesProps {
  trip: Trip;
  updateTrip: (data: Partial<Trip>) => void;
}

const ExpensesView: React.FC<ExpensesProps> = ({ trip, updateTrip }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ category: 'Alimentação', date: new Date().toISOString().split('T')[0] });
  
  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  // Foreign Currency State
  const [useForeignCurrency, setUseForeignCurrency] = useState(false);
  const [foreignAmt, setForeignAmt] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<string>(trip.defaultExchangeRate?.toString() || '');
  const [currSymbol, setCurrSymbol] = useState(trip.foreignCurrency || 'USD');

  // Update exchange rate if trip defaults change and user hasn't touched it yet
  useEffect(() => {
    if (showForm && !editingId && !exchangeRate && trip.defaultExchangeRate) {
        setExchangeRate(trip.defaultExchangeRate.toString());
    }
    if (showForm && !editingId && !currSymbol && trip.foreignCurrency) {
        setCurrSymbol(trip.foreignCurrency);
    }
  }, [showForm, editingId, trip.defaultExchangeRate, trip.foreignCurrency]);

  // Auto calculate BRL amount
  useEffect(() => {
    if (useForeignCurrency && foreignAmt && exchangeRate) {
        const calc = parseFloat(foreignAmt) * parseFloat(exchangeRate);
        if (!isNaN(calc)) {
            setNewExpense(prev => ({ ...prev, amount: parseFloat(calc.toFixed(2)) }));
        }
    }
  }, [foreignAmt, exchangeRate, useForeignCurrency]);

  const categories = ['Alimentação', 'Transporte', 'Compras', 'Lazer', 'Hospedagem', 'Voo', 'Outros'];

  const openNewForm = () => {
      setEditingId(null);
      setNewExpense({ category: 'Alimentação', date: new Date().toISOString().split('T')[0] });
      setUseForeignCurrency(false);
      setForeignAmt('');
      setShowForm(true);
  };

  const handleEdit = (expense: Expense) => {
      setEditingId(expense.id);
      setNewExpense({
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          category: expense.category
      });
      
      if (expense.isForeign) {
          setUseForeignCurrency(true);
          setForeignAmt(expense.foreignAmount?.toString() || '');
          setExchangeRate(expense.exchangeRate?.toString() || '');
          setCurrSymbol(expense.currencySymbol || 'USD');
      } else {
          setUseForeignCurrency(false);
          setForeignAmt('');
      }
      
      setShowForm(true);
  };

  const handleSave = () => {
    if (!newExpense.description || !newExpense.amount) return;
    
    const expenseData: Expense = {
        id: editingId || Math.random().toString(36).substr(2, 9),
        description: newExpense.description,
        amount: Number(newExpense.amount),
        date: newExpense.date || new Date().toISOString(),
        category: newExpense.category as any,
        isForeign: useForeignCurrency,
        foreignAmount: useForeignCurrency ? Number(foreignAmt) : undefined,
        exchangeRate: useForeignCurrency ? Number(exchangeRate) : undefined,
        currencySymbol: useForeignCurrency ? currSymbol : undefined
    };

    if (editingId) {
        updateTrip({ expenses: (trip.expenses || []).map(e => e.id === editingId ? expenseData : e) });
    } else {
        updateTrip({ expenses: [expenseData, ...(trip.expenses || [])] });
    }
    
    // Reset Form
    setNewExpense({ category: 'Alimentação', date: new Date().toISOString().split('T')[0] });
    setUseForeignCurrency(false);
    setForeignAmt('');
    setEditingId(null);
    setShowForm(false);
  };

  // 1. Request Delete
  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, id });
  };

  // 2. Confirm Delete
  const confirmDelete = () => {
    const { id } = deleteConfirm;
    if (!id) return;
    updateTrip({ expenses: (trip.expenses || []).filter(e => e.id !== id) });
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const totalExpenses = (trip.expenses || []).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-4 pb-24 h-full flex flex-col animate-in fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Controle de Gastos</h2>
            <button 
                type="button"
                onClick={openNewForm}
                className="bg-emerald-600 text-white p-2 rounded-full shadow-lg hover:bg-emerald-700 transition"
            >
                <Plus size={24} />
            </button>
        </div>

        {/* Summary Card */}
        <div className="bg-gray-900 text-white rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2 text-gray-400">
                <PieChart size={18} />
                <span className="text-sm font-medium uppercase tracking-wider">Total Gasto</span>
            </div>
            <div className="text-4xl font-bold">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map(cat => {
                    const catTotal = (trip.expenses || []).filter(e => e.category === cat || 
                        // Backward compatibility check (if existing data has english keys)
                        (cat === 'Alimentação' && e.category === 'Food' as any) ||
                        (cat === 'Transporte' && e.category === 'Transport' as any) ||
                        (cat === 'Compras' && e.category === 'Shopping' as any) ||
                        (cat === 'Lazer' && e.category === 'Activity' as any) ||
                        (cat === 'Hospedagem' && e.category === 'Accommodation' as any) ||
                        (cat === 'Voo' && e.category === 'Flight' as any) ||
                        (cat === 'Outros' && e.category === 'Other' as any)
                    ).reduce((acc, curr) => acc + curr.amount, 0);
                    
                    if (catTotal === 0) return null;
                    return (
                        <div key={cat} className="flex-shrink-0 bg-white/10 px-3 py-1 rounded-full text-xs">
                            {cat}: R$ {catTotal.toFixed(0)}
                        </div>
                    )
                })}
            </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm.isOpen && (
             <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Excluir Gasto?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Esta ação não pode ser desfeita. O registro será removido.</p>
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
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

        {/* Add/Edit Expense Modal */}
        {showForm && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">{editingId ? 'Editar Gasto' : 'Novo Gasto'}</h3>
                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                    <Globe size={16} className="text-blue-600" />
                                    Gasto em outra moeda?
                                </label>
                                <input 
                                    type="checkbox" 
                                    checked={useForeignCurrency} 
                                    onChange={(e) => setUseForeignCurrency(e.target.checked)}
                                    className="w-5 h-5 rounded text-blue-600"
                                />
                            </div>
                            
                            {useForeignCurrency && (
                                <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                                    <div className="col-span-2 flex gap-2">
                                        <input 
                                            placeholder="Moeda (USD)" 
                                            className="w-20 p-2 border rounded text-center uppercase"
                                            value={currSymbol}
                                            onChange={e => setCurrSymbol(e.target.value.toUpperCase())}
                                        />
                                        <input 
                                            type="number"
                                            placeholder="Valor (Ex: 10.50)"
                                            className="flex-1 p-2 border rounded"
                                            value={foreignAmt}
                                            onChange={e => setForeignAmt(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500">Cotação (R$)</label>
                                        <input 
                                            type="number"
                                            placeholder="Ex: 5.60"
                                            className="w-full p-2 border rounded"
                                            value={exchangeRate}
                                            onChange={e => setExchangeRate(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Valor Final (R$)
                                {useForeignCurrency && <span className="text-xs text-emerald-600 ml-2 font-medium">(Calculado automaticamente)</span>}
                            </label>
                            <input 
                                type="number" 
                                className="w-full p-4 text-2xl font-bold border rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                                value={newExpense.amount || ''} 
                                onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} 
                            />
                        </div>
                        <input 
                            placeholder="Descrição (ex: Jantar, Uber)" 
                            className="w-full p-3 border rounded-lg" 
                            value={newExpense.description || ''} 
                            onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                type="date" 
                                className="w-full p-3 border rounded-lg" 
                                value={newExpense.date || ''} 
                                onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                            />
                            <select 
                                className="w-full p-3 border rounded-lg bg-white"
                                value={newExpense.category}
                                onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        
                        <button type="button" onClick={handleSave} className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold text-lg mt-2">
                            {editingId ? 'Salvar Alterações' : 'Adicionar'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto pb-10 space-y-3">
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-2">Histórico</h3>
            {(trip.expenses || []).length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                    <DollarSign size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Nenhum gasto registrado.</p>
                </div>
            ) : (
                (trip.expenses || []).map(expense => (
                    <div key={expense.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg 
                                ${(expense.category === 'Alimentação' || expense.category === 'Food' as any) ? 'bg-orange-100 text-orange-600' : 
                                  (expense.category === 'Transporte' || expense.category === 'Transport' as any) ? 'bg-blue-100 text-blue-600' : 
                                  'bg-gray-100 text-gray-600'}`}>
                                {(expense.category === 'Alimentação' || expense.category === 'Food' as any) ? '🍔' : 
                                 (expense.category === 'Transporte' || expense.category === 'Transport' as any) ? '🚗' : '💰'}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">{expense.description}</h4>
                                <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString('pt-BR')} • {expense.category}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-gray-900">R$ {expense.amount.toFixed(2)}</span>
                            {expense.isForeign && expense.foreignAmount && (
                                <span className="text-xs text-gray-400 font-medium">
                                    {expense.currencySymbol} {expense.foreignAmount.toFixed(2)}
                                </span>
                            )}
                            <div className="flex gap-2 mt-1">
                                <button type="button" onClick={() => handleEdit(expense)} className="text-gray-300 hover:text-blue-500 p-2 hover:bg-gray-50 rounded-full"><Edit2 size={14} /></button>
                                <button type="button" onClick={(e) => requestDelete(e, expense.id)} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default ExpensesView;
