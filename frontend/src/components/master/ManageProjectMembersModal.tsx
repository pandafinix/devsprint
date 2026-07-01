import React, { useState, useEffect, useCallback } from 'react';
import { projectApi, getErrorMessage } from '../../services/api';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Project, UserResponse } from '../../types';
import {
  X, UserPlus, UserMinus, Shield, Users, Plus,
  Check, Undo2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ManageProjectMembersModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ManageProjectMembersModal: React.FC<ManageProjectMembersModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [allAdmins, setAllAdmins] = useState<UserResponse[]>([]);
  const [allFreeUsers, setAllFreeUsers] = useState<UserResponse[]>([]);

  const [originalAdminIds, setOriginalAdminIds] = useState<Set<number>>(new Set());
  const [originalUserIds, setOriginalUserIds] = useState<Set<number>>(new Set());

  // Pending changes
  const [adminsToAdd, setAdminsToAdd] = useState<Set<number>>(new Set());
  const [adminsToRemove, setAdminsToRemove] = useState<Set<number>>(new Set());
  const [usersToAdd, setUsersToAdd] = useState<Set<number>>(new Set());
  const [usersToRemove, setUsersToRemove] = useState<Set<number>>(new Set());

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const [adminsData, availableUsersData] = await Promise.all([
        projectApi.getAllAdmins(),
        projectApi.getAvailableUsers(),
      ]);
      setAllAdmins(adminsData);
      setAllFreeUsers(availableUsersData);

      const adminIds = new Set((project.admins ?? []).map((a) => a.id));
      const userIds = new Set((project.users ?? []).map((u) => u.id));
      setOriginalAdminIds(adminIds);
      setOriginalUserIds(userIds);

      // reset pending changes
      setAdminsToAdd(new Set());
      setAdminsToRemove(new Set());
      setUsersToAdd(new Set());
      setUsersToRemove(new Set());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, project.admins, project.users]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // ───── Build current views with pending changes ─────

  // Current admin list = (originals + toAdd) - toRemove
  const visibleCurrentAdmins: UserResponse[] = [
    ...allAdmins.filter((a) => originalAdminIds.has(a.id)),
    ...allAdmins.filter(
      (a) => adminsToAdd.has(a.id) && !originalAdminIds.has(a.id)
    ),
  ];

  // Available admins = all - currently in project (after pending)
  const visibleAvailableAdmins: UserResponse[] = allAdmins.filter((a) => {
    const isCurrentlyInProject = originalAdminIds.has(a.id) || adminsToAdd.has(a.id);
    const isBeingRemoved = adminsToRemove.has(a.id);
    if (isCurrentlyInProject && !isBeingRemoved) return false;
    return true;
  });

  // Same for users
  const originalUsersList = (project.users ?? []).filter((u) => originalUserIds.has(u.id));
  const newlyAddedUsers = allFreeUsers.filter(
    (u) => usersToAdd.has(u.id) && !originalUserIds.has(u.id)
  );
  const visibleCurrentUsers: UserResponse[] = [
    ...originalUsersList,
    ...newlyAddedUsers,
  ];

  const visibleAvailableUsers: UserResponse[] = allFreeUsers.filter((u) => {
    const isCurrentlyInProject = originalUserIds.has(u.id) || usersToAdd.has(u.id);
    const isBeingRemoved = usersToRemove.has(u.id);
    if (isCurrentlyInProject && !isBeingRemoved) return false;
    return true;
  });

  // ───── Toggle pending actions ─────

  const toggleRemoveAdmin = (id: number) => {
    if (originalAdminIds.has(id)) {
      // original admin → mark as remove (or undo)
      setAdminsToRemove((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      // newly added admin → just remove from "toAdd"
      setAdminsToAdd((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const toggleAddAdmin = (id: number) => {
    if (adminsToRemove.has(id)) {
      // undo pending remove
      setAdminsToRemove((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }
    setAdminsToAdd((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRemoveUser = (id: number) => {
    if (originalUserIds.has(id)) {
      setUsersToRemove((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setUsersToAdd((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const toggleAddUser = (id: number) => {
    if (usersToRemove.has(id)) {
      setUsersToRemove((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }
    setUsersToAdd((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ───── Save / Cancel ─────

  const hasChanges =
    adminsToAdd.size > 0 ||
    adminsToRemove.size > 0 ||
    usersToAdd.size > 0 ||
    usersToRemove.size > 0;

  const handleCancel = () => {
    if (hasChanges) {
      if (!window.confirm('Discard pending changes?')) return;
    }
    onClose();
  };

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSaving(true);

    let successCount = 0;
    let failCount = 0;

    try {
      // Admins to add
      for (const adminId of adminsToAdd) {
        try {
          await projectApi.addAdminToProject(project.id, adminId);
          successCount++;
        } catch {
          failCount++;
        }
      }

      // Admins to remove
      for (const adminId of adminsToRemove) {
        try {
          await projectApi.removeAdminFromProject(project.id, adminId);
          successCount++;
        } catch {
          failCount++;
        }
      }

      // Users to add
      for (const userId of usersToAdd) {
        try {
          await projectApi.addUserToProject(project.id, userId);
          successCount++;
        } catch {
          failCount++;
        }
      }

      // Users to remove
      for (const userId of usersToRemove) {
        try {
          await projectApi.removeUserFromProject(project.id, userId);
          successCount++;
        } catch {
          failCount++;
        }
      }

      if (failCount === 0) {
        toast.success(`✅ ${successCount} change${successCount > 1 ? 's' : ''} saved`);
      } else {
        toast.error(`${failCount} change${failCount > 1 ? 's' : ''} failed`);
      }

      onUpdate();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // ───── Render helpers ─────

  const isPendingRemoveAdmin = (id: number) =>
    originalAdminIds.has(id) && adminsToRemove.has(id);
  const isPendingAddAdmin = (id: number) =>
    !originalAdminIds.has(id) && adminsToAdd.has(id);

  const isPendingRemoveUser = (id: number) =>
    originalUserIds.has(id) && usersToRemove.has(id);
  const isPendingAddUser = (id: number) =>
    !originalUserIds.has(id) && usersToAdd.has(id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCancel} />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Manage Members</h2>
            <p className="text-xs text-slate-500">
              {project.name} • {project.code}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Pending changes summary */}
        {hasChanges && (
          <div className="px-6 py-2 bg-blue-950/30 border-b border-blue-700/30 text-xs text-blue-300 flex items-center justify-between">
            <span>
              ⚠ {adminsToAdd.size + usersToAdd.size} to add,{' '}
              {adminsToRemove.size + usersToRemove.size} to remove • Click "Save Changes" to apply
            </span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="text-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-6">

              {/* CURRENT ADMINS */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield size={14} className="text-yellow-400" />
                  Current Admins ({visibleCurrentAdmins.length})
                </h3>

                {visibleCurrentAdmins.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">No admins</p>
                ) : (
                  <div className="space-y-2">
                    {visibleCurrentAdmins.map((admin) => {
                      const pendingRemove = isPendingRemoveAdmin(admin.id);
                      const pendingAdd = isPendingAddAdmin(admin.id);

                      let cardClass =
                        'flex items-center justify-between rounded-lg px-3 py-2 border transition-all duration-300';

                      if (pendingRemove) {
                        cardClass +=
                          ' bg-slate-800/60 border-slate-700 opacity-60 grayscale';
                      } else if (pendingAdd) {
                        cardClass +=
                          ' bg-green-950/30 border-green-600/50 ring-1 ring-green-500/30';
                      } else {
                        cardClass += ' bg-yellow-950/20 border-yellow-700/40';
                      }

                      return (
                        <div key={admin.id} className={cardClass}>
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                pendingRemove
                                  ? 'bg-slate-600'
                                  : 'bg-gradient-to-br from-yellow-600 to-orange-600'
                              }`}
                            >
                              <span className="text-xs font-bold text-white">
                                {admin.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  pendingRemove
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-200'
                                }`}
                              >
                                {admin.name}
                              </p>
                              <p className="text-xs text-slate-500">{admin.email}</p>
                            </div>
                            {pendingAdd && (
                              <span className="text-[10px] bg-green-600/20 text-green-300 px-2 py-0.5 rounded-full border border-green-600/40">
                                Pending Add
                              </span>
                            )}
                            {pendingRemove && (
                              <span className="text-[10px] bg-red-600/20 text-red-300 px-2 py-0.5 rounded-full border border-red-600/40">
                                Pending Remove
                              </span>
                            )}
                          </div>

                          {pendingRemove ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              leftIcon={<Undo2 size={12} />}
                              onClick={() => toggleRemoveAdmin(admin.id)}
                            >
                              Undo
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="danger"
                              leftIcon={<UserMinus size={12} />}
                              onClick={() => toggleRemoveAdmin(admin.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AVAILABLE ADMINS */}
              {visibleAvailableAdmins.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Plus size={14} className="text-yellow-400" />
                    Add Admins ({visibleAvailableAdmins.length} available)
                  </h3>
                  <div className="space-y-2">
                    {visibleAvailableAdmins.map((admin) => {
                      const pendingUndoRemove = adminsToRemove.has(admin.id);

                      return (
                        <div
                          key={admin.id}
                          className="flex items-center justify-between bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-2 hover:border-yellow-500/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                              <span className="text-xs font-bold text-slate-400">
                                {admin.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-300">
                                {admin.name}
                              </p>
                              <p className="text-xs text-slate-500">{admin.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            leftIcon={
                              pendingUndoRemove ? <Undo2 size={12} /> : <UserPlus size={12} />
                            }
                            onClick={() => toggleAddAdmin(admin.id)}
                          >
                            {pendingUndoRemove ? 'Keep' : 'Add'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CURRENT USERS */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Users size={14} className="text-blue-400" />
                  Current Team Members ({visibleCurrentUsers.length})
                </h3>

                {visibleCurrentUsers.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">No team members</p>
                ) : (
                  <div className="space-y-2">
                    {visibleCurrentUsers.map((user) => {
                      const pendingRemove = isPendingRemoveUser(user.id);
                      const pendingAdd = isPendingAddUser(user.id);

                      let cardClass =
                        'flex items-center justify-between rounded-lg px-3 py-2 border transition-all duration-300';

                      if (pendingRemove) {
                        cardClass +=
                          ' bg-slate-800/60 border-slate-700 opacity-60 grayscale';
                      } else if (pendingAdd) {
                        cardClass +=
                          ' bg-green-950/30 border-green-600/50 ring-1 ring-green-500/30';
                      } else {
                        cardClass += ' bg-blue-950/20 border-blue-700/40';
                      }

                      return (
                        <div key={user.id} className={cardClass}>
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                pendingRemove
                                  ? 'bg-slate-600'
                                  : 'bg-gradient-to-br from-blue-600 to-primary-600'
                              }`}
                            >
                              <span className="text-xs font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  pendingRemove
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-200'
                                }`}
                              >
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                            {pendingAdd && (
                              <span className="text-[10px] bg-green-600/20 text-green-300 px-2 py-0.5 rounded-full border border-green-600/40">
                                Pending Add
                              </span>
                            )}
                            {pendingRemove && (
                              <span className="text-[10px] bg-red-600/20 text-red-300 px-2 py-0.5 rounded-full border border-red-600/40">
                                Pending Remove
                              </span>
                            )}
                          </div>

                          {pendingRemove ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              leftIcon={<Undo2 size={12} />}
                              onClick={() => toggleRemoveUser(user.id)}
                            >
                              Undo
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="danger"
                              leftIcon={<UserMinus size={12} />}
                              onClick={() => toggleRemoveUser(user.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AVAILABLE USERS */}
              {visibleAvailableUsers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Plus size={14} className="text-blue-400" />
                    Add Team Members ({visibleAvailableUsers.length} available)
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">
                    These users are not in any active project
                  </p>
                  <div className="space-y-2">
                    {visibleAvailableUsers.map((user) => {
                      const pendingUndoRemove = usersToRemove.has(user.id);
                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-2 hover:border-blue-500/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                              <span className="text-xs font-bold text-slate-400">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-300">
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            leftIcon={
                              pendingUndoRemove ? <Undo2 size={12} /> : <UserPlus size={12} />
                            }
                            onClick={() => toggleAddUser(user.id)}
                          >
                            {pendingUndoRemove ? 'Keep' : 'Add'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {visibleAvailableAdmins.length === 0 &&
                visibleAvailableUsers.length === 0 && (
                  <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6 text-center">
                    <p className="text-sm text-slate-400">
                      All available admins and users are already in this project
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-slate-500">
            {hasChanges
              ? '⚠ You have unsaved changes'
              : 'No pending changes'}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Check size={14} />}
              disabled={!hasChanges && !isSaving}
            >
              {hasChanges ? 'Save Changes' : 'Done'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};