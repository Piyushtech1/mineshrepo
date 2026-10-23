import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { usePortfolio } from '../../context/PortfolioContext';
import { NavigationItem } from '../../server/db/schema';
import { Save, Check, ArrowUp, ArrowDown, Eye, EyeOff, Navigation } from 'lucide-react';

export const NavigationMenuView: React.FC = () => {
  const { refreshPublicData } = usePortfolio();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await api.getAdminSettings();
        setItems(res.navigation.sort((a, b) => a.order - b.order));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNav();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(target, 0, moved);
    newItems.forEach((item, idx) => { item.order = idx + 1; });
    setItems(newItems);
  };

  const handleToggleVisible = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, visible: !item.visible } : item));
  };

  const handleRename = (id: string, label: string) => {
    setItems(items.map(item => item.id === id ? { ...item, label } : item));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateNavigation(items);
      await refreshPublicData();
      showNotice('Navigation menu updated successfully.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Navigation Menu Editor
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Reorder public header menu items, rename labels, or hide pages without deleting content
          </p>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors shadow disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save Navigation'}</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs font-mono-meta text-zinc-400">Loading navigation...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-xl border p-4 flex items-center justify-between gap-4 transition-all ${
                item.visible
                  ? 'border-zinc-800 bg-zinc-900/60'
                  : 'border-zinc-800/40 bg-zinc-900/20 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={item.label}
                    onChange={e => handleRename(item.id, e.target.value)}
                    className="rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
                  />
                  <span className="font-mono-meta text-[11px] text-zinc-400">
                    Route: <code className="text-amber-400">{item.path}</code>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleVisible(item.id)}
                  className={`rounded px-2.5 py-1 text-[11px] font-mono-meta flex items-center gap-1.5 transition-colors ${
                    item.visible
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {item.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  <span>{item.visible ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
