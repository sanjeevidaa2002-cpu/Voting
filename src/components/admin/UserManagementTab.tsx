import React, { useState, useEffect } from 'react';
import { RegisteredUser } from '../../types';
import { api } from '../../services/api';
import {
  Search,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  CheckCircle2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Crown,
  User,
  Filter,
  RefreshCw,
  AlertTriangle,
  Users
} from 'lucide-react';

interface UserManagementTabProps {
  onShowNotification: (msg: string, type?: 'success' | 'error') => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({ onShowNotification }) => {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminUsers(search);
      setUsers(data.users || []);
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to fetch registered users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleToggleStatus = async (user: RegisteredUser) => {
    try {
      setProcessingId(user.id);
      const res = await api.toggleAdminUserStatus(user.id, !user.isActive);
      onShowNotification(res.message);
      await loadUsers();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to update user status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (user: RegisteredUser, newRole: 'user' | 'admin') => {
    const actionText = newRole === 'admin' ? 'promote this user to Administrator' : 'demote this administrator to regular User';
    if (!window.confirm(`Are you sure you want to ${actionText} (${user.email})?`)) {
      return;
    }

    try {
      setProcessingId(user.id);
      const res = await api.updateAdminUserRole(user.id, newRole);
      onShowNotification(res.message || `Role successfully updated to ${newRole.toUpperCase()}`);
      await loadUsers();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to update user role', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (user: RegisteredUser) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account ${user.email}? This action cannot be undone.`)) {
      return;
    }
    try {
      setProcessingId(user.id);
      const res = await api.deleteAdminUser(user.id);
      onShowNotification(res.message);
      await loadUsers();
    } catch (err: any) {
      onShowNotification(err.message || 'Failed to delete user', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'admin' && u.role !== 'admin') return false;
    if (roleFilter === 'user' && u.role === 'admin') return false;
    if (statusFilter === 'active' && !u.isActive) return false;
    if (statusFilter === 'disabled' && u.isActive) return false;
    return true;
  });

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalActiveVoters = users.filter((u) => !!u.votedContestantId).length;

  return (
    <div className="space-y-6">
      {/* Metrics Header Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{users.length}</div>
            <div className="text-xs text-zinc-400">Registered Accounts</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalAdmins}</div>
            <div className="text-xs text-zinc-400">Executive Admins</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalActiveVoters}</div>
            <div className="text-xs text-zinc-400">Verified Ballots Cast</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{users.filter(u => !u.isActive).length}</div>
            <div className="text-xs text-zinc-400">Disabled Accounts</div>
          </div>
        </div>
      </div>

      {/* Header, Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-3xl border border-white/10">
        <div>
          <h2 className="text-xl font-serif font-black text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            User & Administrator Management
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage authenticated audience accounts, assign executive admin roles, and enforce security policies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="user">Users Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/40 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                <th className="p-4">User Details</th>
                <th className="p-4">System Role</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Voting Activity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Role & Access Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Loading user accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500">
                    No matching accounts found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isUserAdmin = user.role === 'admin';
                  const isBusy = processingId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-white/[0.02] transition ${
                        isUserAdmin ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-xl border border-white/10 object-cover bg-zinc-800 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{user.fullName}</span>
                              {isUserAdmin && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                                  <Crown className="w-3 h-3" /> Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-zinc-500" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* System Role */}
                      <td className="p-4">
                        {isUserAdmin ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Executive Admin</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 text-[11px]">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Standard User</span>
                          </div>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="p-4 font-mono text-[11px] text-zinc-400">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Voting Record */}
                      <td className="p-4">
                        {user.votedContestantId ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Voted: {user.votedContestantName || 'Contestant'}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500 italic">No ballot cast</span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {user.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          {/* Role Toggle Button */}
                          {isUserAdmin ? (
                            <button
                              onClick={() => handleRoleChange(user, 'user')}
                              disabled={isBusy}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 transition flex items-center gap-1.5"
                              title="Demote to Regular User"
                            >
                              <Shield className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">Demote</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(user, 'admin')}
                              disabled={isBusy}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-zinc-300 hover:bg-amber-500/15 hover:border-amber-500/30 hover:text-amber-300 transition flex items-center gap-1.5"
                              title="Promote to Administrator"
                            >
                              <Crown className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">Make Admin</span>
                            </button>
                          )}

                          {/* Status Toggle Button */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={isBusy}
                            className={`p-2 rounded-xl text-xs font-bold border transition ${
                              user.isActive
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                            title={user.isActive ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isBusy}
                            className="p-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
