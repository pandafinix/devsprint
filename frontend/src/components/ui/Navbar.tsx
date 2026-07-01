import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ProfileModal } from '../modals/ProfileModal';
import { Button } from './Button';
import { LogOut, Zap, User, Settings, Shield, Crown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ✅ Logout and redirect to landing page
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    if (user?.role === 'MASTER_ADMIN')
      return (
        <span className="text-xs bg-purple-900/30 text-purple-400 border border-purple-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Crown size={10} /> Master Admin
        </span>
      );
    if (user?.role === 'ADMIN')
      return (
        <span className="text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Shield size={10} /> Admin
        </span>
      );
    return (
      <span className="text-xs bg-blue-900/30 text-blue-400 border border-blue-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
        <User size={10} /> Member
      </span>
    );
  };

  return (
    <>
      <nav className="h-16 bg-slate-900 border-b border-slate-700/60 px-6 flex items-center justify-between sticky top-0 z-40">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">
              Dev<span className="text-primary-400">Sprint</span>
            </span>
            {user?.companyName && (
              <span className="text-xs text-slate-500 ml-2">
                {user.companyName}
              </span>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center group-hover:border-primary-400 transition-colors">
                <User size={15} className="text-primary-400" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-200">
                    {user.name}
                  </p>
                  {getRoleBadge()}
                </div>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Settings size={14} className="text-slate-500 group-hover:text-primary-400 transition-colors hidden sm:block" />
            </button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut size={15} />}
            className="text-slate-400 hover:text-red-400"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </nav>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};