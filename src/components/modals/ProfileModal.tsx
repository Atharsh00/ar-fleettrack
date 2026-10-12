import React, { useState } from 'react';
import { useFleet } from '../../context/FleetContext';
import { X, CheckCircle, Trash2, Edit3, Plus } from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { profiles, activeProfileId, setActiveProfileId, addProfile, updateProfile, deleteProfile } = useFleet();
  const [newProfileName, setNewProfileName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    addProfile(newProfileName.trim());
    setNewProfileName('');
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateProfile(id, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/40">
          <div>
            <h3 className="text-base font-bold text-white">Manage Fleet Ownership Profiles</h3>
            <p className="text-xs text-slate-400">Each profile maintains an isolated ledger and fleet environment</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Create New Profile Form */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. Mahavir Freight Carriers"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Profile</span>
            </button>
          </form>

          {/* Profile List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Existing Profiles ({profiles.length})
            </span>
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              const isEditing = editingId === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="flex-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveProfileId(p.id)}
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isActive ? 'border-amber-500 bg-amber-500' : 'border-slate-600 hover:border-amber-500'
                      }`}
                    >
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-slate-950"></div>}
                    </button>

                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-slate-900 border border-amber-500 rounded px-2 py-1 text-xs text-white flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(p.id)}
                          className="px-2 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="cursor-pointer" onClick={() => setActiveProfileId(p.id)}>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          {p.name}
                          {isActive && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-extrabold">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">Created: {p.createdAt || 'Standard'}</div>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(p.id, p.name)}
                        title="Rename Profile"
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {profiles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete profile "${p.name}" and all its isolated records?`)) {
                              deleteProfile(p.id);
                            }
                          }}
                          title="Delete Profile"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
