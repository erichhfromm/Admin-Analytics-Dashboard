import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { User, Bell, Shield, Key, Loader2, Monitor, Moon, Sun, Camera, Trash2 } from 'lucide-react';
import { getSettings, updateSettings, updatePassword, uploadImage } from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [themePreference, setThemePreference] = useState(localStorage.getItem('theme') || 'system');

  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Administrator',
    notifications: {
      email: true,
      push: true,
      updates: false
    }
  });

  useEffect(() => {
    getSettings().then(data => {
      if (data) {
        setFormData({
          name: data.name,
          email: data.email,
          role: 'Administrator',
          notifications: data.notifications
        });
        if (data.theme) setThemePreference(data.theme);
        if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (activeTab === 'security') {
        if (!passwords.current || !passwords.new) {
            toast.error("Please fill both password fields");
            setSaving(false);
            return;
        }
        await updatePassword({ currentPassword: passwords.current, newPassword: passwords.new });
        setPasswords({ current: '', new: '' });
        toast.success('Password updated successfully!');
      } else {
        await updateSettings({
          name: formData.name,
          email: formData.email,
          avatar: formData.name.charAt(0).toUpperCase(),
          avatarUrl: avatarPreview || '',
          notifications: formData.notifications,
          theme: themePreference
        });
        
        if (themePreference !== 'system') {
          localStorage.setItem('theme', themePreference);
          if (themePreference === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }

        window.dispatchEvent(new Event('profileUpdate'));
        toast.success('Settings saved successfully!');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Failed to save settings';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { // Limit increased for server storage
        toast.error("File size too large (max 2MB)");
        return;
      }
      
      const uploadToast = toast.loading("Uploading image...");
      try {
          const { url } = await uploadImage(file);
          setAvatarPreview(url);
          toast.success("Image uploaded!", { id: uploadToast });
      } catch (err) {
          toast.error("Failed to upload image", { id: uploadToast });
      }
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    toast("Photo removed", { icon: '🗑️' });
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-main)]">Account Settings</h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Manage your account preferences and configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-color)] hover:text-[var(--text-main)] border border-transparent'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <Card className="flex-1">
          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center gap-6 pb-6 border-b border-[var(--border-color)]">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-600 to-indigo-900 text-white flex items-center justify-center font-bold text-3xl shadow-xl shadow-indigo-500/20 transition-transform group-hover:scale-105 border-4 border-white dark:border-gray-800">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        formData.name.charAt(0) || 'A'
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-1 right-1 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-[var(--border-color)] text-[var(--primary)] hover:scale-110 transition-all z-10"
                    >
                      <Camera size={16} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-main)]">Profile Picture</h3>
                    <p className="text-xs text-[var(--text-muted)] mb-3">JPG, GIF or PNG. Max size of 800K</p>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current.click()}
                        className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all"
                      >
                        Upload Photo
                      </button>
                      {avatarPreview && (
                        <button 
                          type="button" 
                          onClick={removeAvatar}
                          className="px-4 py-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] text-rose-500 text-sm font-medium rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-main)]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-main)]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-[var(--text-main)]">Role</label>
                    <input
                      type="text"
                      disabled
                      value={formData.role}
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-muted)] opacity-70 px-4 py-2.5 rounded-lg text-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold text-[var(--text-main)] mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive daily summary emails' },
                    { key: 'push', label: 'Push Notifications', desc: 'Receive instant web push notifications' },
                    { key: 'updates', label: 'Product Updates', desc: 'Get notified about new features and updates' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl">
                      <div>
                        <p className="font-semibold text-[var(--text-main)] text-sm">{item.label}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={formData.notifications[item.key]}
                          onChange={() => setFormData(prev => ({
                            ...prev, 
                            notifications: { ...prev.notifications, [item.key]: !prev.notifications[item.key] }
                          }))}
                        />
                        <div className="w-11 h-6 bg-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold text-[var(--text-main)] mb-4">Update Password</h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-main)]">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwords.current}
                      onChange={e => setPasswords({...passwords, current: e.target.value})}
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-main)]">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-all" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold text-[var(--text-main)] mb-4">Theme Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor },
                  ].map(theme => (
                    <div 
                      key={theme.id}
                      onClick={() => setThemePreference(theme.id)}
                      className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${themePreference === theme.id ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border-color)] bg-[var(--bg-color)] hover:border-[var(--text-muted)]'}`}
                    >
                      <theme.icon size={24} className={themePreference === theme.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'} />
                      <span className={`mt-3 font-semibold text-sm ${themePreference === theme.id ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}`}>{theme.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2 italic">Note: Real-time toggle is available in the top navbar.</p>
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-[var(--border-color)] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
