import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Search, Filter, Edit2, Trash2, Plus, X, Loader2 } from 'lucide-react';
import { getUsers, addUser, updateUser, deleteUser } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null); // ID of user being deleted
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', email: '', role: 'User', status: 'Active' });

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getUsers(search, statusFilter, sortField, sortOrder, currentPage, itemsPerPage);
    setUsers(data.users || []);
    setTotalUsersCount(data.totalUsers || 0);
    setServerTotalPages(data.totalPages || 0);
    setLoading(false);
  };

  useEffect(() => {
    const handleGlobalSearch = (e) => {
        setSearch(e.detail);
    };
    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => window.removeEventListener('globalSearch', handleGlobalSearch);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
        fetchUsers();
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [search, statusFilter, sortField, sortOrder, currentPage]);

  // Pagination index info
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Reset pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const openModal = (user = null) => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({ id: null, name: '', email: '', role: 'User', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, name: '', email: '', role: 'User', status: 'Active' });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (formData.id) {
        const updated = await updateUser(formData.id, formData);
        setUsers(users.map(u => u.id === updated.id ? updated : u));
        toast.success('User updated successfully!');
      } else {
        const added = await addUser({ ...formData, id: undefined });
        setUsers([added, ...users]);
        toast.success('New user added!');
      }
      closeModal();
    } catch (err) {
      toast.error('Something went wrong!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm("Are you sure you want to delete this user?")) return;
    setIsDeletingId(id);
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted successfully!');
      
      // If deleting the last item on the page, go back a page
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)]">User Management</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your team members, robust implementation.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--primary-hover)] transition-all hover:scale-105 active:scale-95 shadow-sm shadow-red-500/30"
        >
          <Plus size={18} />
          Add New User
        </button>
      </div>

      <Card className="!p-0">
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

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="p-12 flex justify-center items-center h-full">
                 <div className="w-8 h-8 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-color)]/50">
                  <th 
                    className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--primary)] transition-colors"
                    onClick={() => {
                        setSortOrder(sortField === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                        setSortField('name');
                    }}
                  >
                    User {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className={`hover:bg-[var(--bg-color)]/50 transition-colors group ${isDeletingId === user.id ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
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
                          <button 
                            onClick={() => openModal(user)}
                            className="p-2 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isDeletingId === user.id}
                            className="p-2 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors disabled:cursor-not-allowed"
                          >
                            {isDeletingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
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
        
        {/* Pagination Controls */}
        <div className="p-4 sm:p-6 border-t border-[var(--border-color)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)] font-medium">
            Showing <span className="text-[var(--text-main)]">{users.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalUsersCount)}</span> of <span className="text-[var(--text-main)]">{totalUsersCount}</span> results
          </p>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1.5 text-xs font-medium border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-muted)] rounded hover:bg-[var(--bg-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, serverTotalPages))}
              disabled={currentPage === serverTotalPages || serverTotalPages === 0 || loading}
              className="px-3 py-1.5 text-xs font-medium border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-muted)] rounded hover:bg-[var(--bg-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Add / Edit User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[var(--surface-color)] rounded-xl shadow-xl border border-[var(--border-color)] overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
                <h3 className="text-lg font-bold text-[var(--text-main)]">
                  {formData.id ? 'Edit User' : 'Add New User'}
                </h3>
                <button onClick={closeModal} className="text-[var(--text-muted)] hover:text-rose-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-main)]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-main)]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-main)]">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="User">User</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-main)]">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--primary-hover)] transition-all shadow-sm shadow-red-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {formData.id ? 'Save Changes' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
