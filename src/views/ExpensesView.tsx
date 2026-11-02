import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Upload, 
  Download, 
  PieChart, 
  TrendingUp, 
  Receipt, 
  Sparkles,
  Calendar,
  Check,
  Trash2
} from 'lucide-react';
import { PuppyProfile, ExpenseRecord } from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

interface ExpensesViewProps {
  puppy: PuppyProfile;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ puppy }) => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => storage.getExpenses(puppy.id));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  React.useEffect(() => {
    setExpenses(storage.getExpenses(puppy.id));
  }, [puppy.id]);

  React.useEffect(() => {
    return storage.subscribe(() => {
      setExpenses([...storage.getExpenses(puppy.id)]);
    });
  }, [puppy.id]);


  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<any>('vet');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!title.trim() || isNaN(val)) return;

    storage.addExpense({
      puppyId: puppy.id,
      title,
      amount: val,
      category,
      vendor: vendor.trim() || 'Store',
      date
    });
    setExpenses(storage.getExpenses(puppy.id));
    setIsAddOpen(false);
    setTitle('');
    setAmount('');
    setVendor('');
  };

  const handleSimulateReceiptScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setTitle('Puppy Dental Treats & Chew Rope');
        setAmount('18.49');
        setCategory('treats');
        setVendor('Petco');
        setIsAddOpen(true);
      }, 1200);
    }
  };

  const handleExportCSV = () => {
    let csv = 'ID,Date,Title,Category,Vendor,Amount\n';
    expenses.forEach(exp => {
      csv += `"${exp.id}","${exp.date}","${exp.title}","${exp.category}","${exp.vendor}","${exp.amount.toFixed(2)}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${puppy.name}-Expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoryTotals = expenses.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
              Puppy Expense Tracker
            </h1>
            <span className="text-xs font-bold bg-[#F3E7DA] text-[#5F3E29] px-2.5 py-0.5 rounded-full">
              ${totalSpend.toFixed(2)} Total
            </span>
          </div>
          <p className="text-xs text-[#766A63] mt-1">
            Track vet exams, food subscriptions, chew toys, and pet insurance with AI receipt extraction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Hidden file input for receipt scanner */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSimulateReceiptScan}
            />
            <div className="px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] hover:bg-[#F3E7DA] text-xs font-bold text-[#5F3E29] flex items-center gap-1.5 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
              {isScanning ? 'Scanning...' : 'Scan Receipt'}
            </div>
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'vet', label: 'Vet Care', color: 'text-rose-700 bg-rose-50' },
          { id: 'food', label: 'Food & Nutrition', color: 'text-amber-700 bg-amber-50' },
          { id: 'insurance', label: 'Insurance', color: 'text-sky-700 bg-sky-50' },
          { id: 'toys', label: 'Toys & Chews', color: 'text-purple-700 bg-purple-50' }
        ].map(cat => {
          const amount = categoryTotals[cat.id] || 0;
          return (
            <div key={cat.id} className="p-4 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
                {cat.label}
              </span>
              <div className="text-xl font-extrabold text-[#2C211B] mt-1">
                ${amount.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#766A63] mt-0.5">
                {totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0}% of total
              </div>
            </div>
          );
        })}
      </div>

      {/* Expenses History List */}
      <div className="bg-white rounded-2xl border border-[#E8DDD3] p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#2C211B] mb-4">
          Expense History ({expenses.length})
        </h3>

        <div className="space-y-2.5">
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#766A63]">
              <DollarSign className="w-8 h-8 text-[#8B5E3C]/40 mx-auto mb-2" />
              <p className="font-semibold text-[#2C211B]">No expenses recorded yet</p>
              <p className="mt-0.5">Track your vet bills, food, training gear, and supplies for {puppy.name}.</p>
            </div>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp.id}
              className="p-3.5 rounded-xl border border-[#E8DDD3] bg-white hover:bg-[#FFF9F2] transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3] text-[#8B5E3C]">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#2C211B]">{exp.title}</h4>
                  <p className="text-[11px] text-[#766A63] mt-0.5">
                    {exp.date} • {exp.vendor} • <span className="capitalize font-medium">{exp.category}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm font-black text-[#2C211B]">
                  ${exp.amount.toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    storage.deleteExpense(exp.id);
                    setExpenses([...storage.getExpenses(puppy.id)]);
                  }}
                  className="p-1 text-[#766A63] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )))}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Puppy Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Expense Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Purina Pro Plan 30lb Bag"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="45.00"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              >
                <option value="vet">Vet</option>
                <option value="food">Food</option>
                <option value="treats">Treats</option>
                <option value="toys">Toys</option>
                <option value="training">Training</option>
                <option value="grooming">Grooming</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Vendor
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Chewy.com"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
