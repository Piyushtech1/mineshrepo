import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { SkillItem, ServiceItem } from '../../server/db/schema';
import { Plus, Edit2, Trash2, Check, Layers, Sparkles } from 'lucide-react';

export const SkillsServicesView: React.FC = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Skill Modal
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [skillData, setSkillData] = useState<Partial<SkillItem>>({
    name: '',
    category: 'Software',
    proficiency: 90,
    highlighted: true,
  });

  // Service Modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceData, setServiceData] = useState<Partial<ServiceItem>>({
    title: '',
    description: '',
    icon: 'Sparkles',
    deliverables: [],
    active: true,
  });
  const [delivInput, setDelivInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [skRes, srvRes] = await Promise.all([
        api.getAdminSkills(),
        api.getAdminServices(),
      ]);
      setSkills(skRes.skills);
      setServices(srvRes.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Skill Handlers
  const handleOpenAddSkill = () => {
    setEditingSkill(null);
    setSkillData({ name: '', category: 'Discipline', proficiency: 95, highlighted: true });
    setSkillModalOpen(true);
  };

  const handleOpenEditSkill = (s: SkillItem) => {
    setEditingSkill(s);
    setSkillData(s);
    setSkillModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        await api.updateSkill(editingSkill.id, skillData);
        showNotice('Skill updated.');
      } else {
        await api.createSkill(skillData);
        showNotice('Skill added.');
      }
      setSkillModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await api.deleteSkill(id);
      showNotice('Skill deleted.');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Service Handlers
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceData({ title: '', description: '', active: true });
    setDelivInput('');
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: ServiceItem) => {
    setEditingService(srv);
    setServiceData(srv);
    setDelivInput((srv.deliverables || []).join('\n'));
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...serviceData,
      deliverables: delivInput.split('\n').map(d => d.trim()).filter(Boolean),
    };
    try {
      if (editingService) {
        await api.updateService(editingService.id, payload);
        showNotice('Service updated.');
      } else {
        await api.createService(payload);
        showNotice('Service created.');
      }
      setServiceModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.deleteService(id);
      showNotice('Service deleted.');
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
            Skills & Services Offerings
          </h1>
          <p className="text-xs font-mono-meta text-zinc-400">
            Manage your service packages, deliverables, and technical competencies
          </p>
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* 1. Services Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-500" />
            <h2 className="font-heading text-xl font-bold text-white">
              Client Services & Deliverables
            </h2>
          </div>
          <button
            type="button"
            onClick={handleOpenAddService}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 shadow"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(srv => (
            <div
              key={srv.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-white">
                    {srv.title}
                  </h3>
                  <span className={`text-[10px] font-mono-meta px-2 py-0.5 rounded ${srv.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {srv.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  {srv.description}
                </p>
                {srv.deliverables && srv.deliverables.length > 0 && (
                  <ul className="text-[11px] text-zinc-400 flex flex-col gap-1 pt-2 border-t border-zinc-800">
                    {srv.deliverables.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-800/80 pt-3">
                <button
                  type="button"
                  onClick={() => handleOpenEditService(srv)}
                  className="rounded p-1 text-zinc-400 hover:text-white text-xs flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteService(srv.id)}
                  className="rounded p-1 text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Skills Section */}
      <div className="flex flex-col gap-6 pt-6 border-t border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="font-heading text-xl font-bold text-white">
              Skills & Software Proficiency
            </h2>
          </div>
          <button
            type="button"
            onClick={handleOpenAddSkill}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 shadow"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Skill</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {skills.map(skill => (
            <div
              key={skill.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between gap-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-heading text-sm font-bold text-white">
                  {skill.name}
                </span>
                <span className="text-[10px] font-mono-meta text-zinc-400">
                  {skill.category} • <strong className="text-amber-400">{skill.proficiency}%</strong>
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEditSkill(skill)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="p-1 text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Modal */}
      {skillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveSkill}
            className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#0e0f12] p-6 shadow-2xl flex flex-col gap-4"
          >
            <h3 className="font-heading text-base font-bold text-white">
              {editingSkill ? 'Edit Skill' : 'Add Skill'}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Skill / Tool Name *</label>
              <input
                type="text"
                required
                value={skillData.name || ''}
                onChange={e => setSkillData({ ...skillData, name: e.target.value })}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Category</label>
              <select
                value={skillData.category || 'Discipline'}
                onChange={e => setSkillData({ ...skillData, category: e.target.value as any })}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
              >
                <option value="Discipline">Discipline</option>
                <option value="Software">Software</option>
                <option value="Methodology">Methodology</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">
                Proficiency: {skillData.proficiency}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={skillData.proficiency || 90}
                onChange={e => setSkillData({ ...skillData, proficiency: Number(e.target.value) })}
                className="accent-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSkillModalOpen(false)}
                className="rounded border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-amber-500 px-4 py-1.5 text-xs font-bold text-zinc-950"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveService}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0e0f12] p-6 shadow-2xl flex flex-col gap-4"
          >
            <h3 className="font-heading text-base font-bold text-white">
              {editingService ? 'Edit Service' : 'Add Service'}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Service Title *</label>
              <input
                type="text"
                required
                value={serviceData.title || ''}
                onChange={e => setServiceData({ ...serviceData, title: e.target.value })}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
                placeholder="Brand Identity Systems"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Description</label>
              <textarea
                rows={3}
                value={serviceData.description || ''}
                onChange={e => setServiceData({ ...serviceData, description: e.target.value })}
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono-meta text-zinc-400">Deliverables (one per line)</label>
              <textarea
                rows={3}
                value={delivInput}
                onChange={e => setDelivInput(e.target.value)}
                placeholder="Logomark vector files&#10;Brand book PDF..."
                className="rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="rounded border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-amber-500 px-4 py-1.5 text-xs font-bold text-zinc-950"
              >
                Save Service
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
