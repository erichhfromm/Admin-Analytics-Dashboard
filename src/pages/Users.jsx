import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Search, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { getUsers } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)]">User Management</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your team members and users.</p>
        </div>
        <button className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-colors shadow-sm shadow-indigo-500/30">
          Add New User
        </button>
      </div>

      <Card className="!p-0">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-6 border-b border-[var(--border-color)] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] px-10 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] pl-10 pr-8 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 cursor-pointer transition-all"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 flex justify-center">
                 <div className="w-8 h-8 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-color)]/50">
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[var(--bg-color)]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">{user.name}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-[var(--text-muted)]">{user.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-transparent
                          ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                            user.status === 'Inactive' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' : 
                            'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 
                            ${user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Inactive' ? 'bg-rose-500' : 'bg-amber-500'}`} 
                          />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <button className="p-2 text-[var(--text-muted)] lg:hidden transition-colors">
                            <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-[var(--text-muted)]">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={40} className="text-[var(--text-muted)] opacity-50 mb-3" />
                        <p className="text-sm font-medium">No users found</p>
                        <p className="text-xs mt-1 opacity-70">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 sm:p-6 border-t border-[var(--border-color)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)] font-medium">Showing <span className="text-[var(--text-main)]">1 to {filteredUsers.length}</span> of <span className="text-[var(--text-main)]">{filteredUsers.length}</span> results</p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-xs font-medium border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-muted)] rounded hover:bg-[var(--bg-color)] transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 text-xs font-medium border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-muted)] rounded hover:bg-[var(--bg-color)] transition-colors disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Users;
