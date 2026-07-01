import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, CheckCircle, Users,
  Shield, BarChart3, Layout, Clock,
  Building2, UserPlus, LogIn,
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ─── NAVBAR ─── */}
      <nav className="border-b border-slate-800/60 backdrop-blur-sm sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Dev<span className="text-primary-400">Sprint</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#roles" className="hover:text-white transition-colors">
              Roles
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/register-company"
              className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-primary-600/20"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden">

        {/* Background Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-36 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-600/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8">
            <Zap size={14} className="text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">
              The Modern Agile Workspace
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Manage Your{' '}
            <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Sprints
            </span>
            <br />
            Like a Pro
          </h1>

          {/* Sub Heading */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            DevSprint is a powerful Kanban board designed for agile teams.
            Create companies, assign tasks, track progress — all in one
            beautiful workspace.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register-company"
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all shadow-2xl shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-0.5"
            >
              <Building2 size={18} />
              Register Your Company
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3.5 rounded-xl font-semibold text-base transition-all border border-slate-700"
            >
              <LogIn size={18} />
              Sign In to Dashboard
            </Link>
          </div>

          {/* Preview Board */}
          <div className="max-w-5xl mx-auto bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 shadow-2xl backdrop-blur">
            <div className="grid grid-cols-3 gap-4">

              {/* TODO Column */}
              <div className="rounded-xl overflow-hidden">
                <div className="bg-slate-800/80 border-t-2 border-slate-500 px-4 py-2.5">
                  <span className="text-sm font-semibold text-slate-300">
                    📋 To Do
                  </span>
                  <span className="ml-2 text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">
                    3
                  </span>
                </div>
                <div className="bg-slate-800/30 p-3 space-y-2.5 min-h-[200px]">
                  {['Design Login Page', 'Setup CI/CD Pipeline', 'Write Unit Tests'].map(
                    (task, i) => (
                      <div
                        key={i}
                        className="bg-slate-800 border border-slate-700/60 rounded-lg p-3 animate-fade-in"
                        style={{ animationDelay: `${i * 150}ms` }}
                      >
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            i === 0
                              ? 'bg-red-900/40 text-red-400'
                              : i === 1
                              ? 'bg-yellow-900/40 text-yellow-400'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low'}
                        </span>
                        <p className="text-sm text-slate-200 mt-2 font-medium">
                          {task}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* IN PROGRESS Column */}
              <div className="rounded-xl overflow-hidden">
                <div className="bg-slate-800/80 border-t-2 border-blue-500 px-4 py-2.5">
                  <span className="text-sm font-semibold text-blue-300">
                    ⚡ In Progress
                  </span>
                  <span className="ml-2 text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">
                    2
                  </span>
                </div>
                <div className="bg-slate-800/30 p-3 space-y-2.5 min-h-[200px]">
                  {['Build REST API', 'Create Dashboard'].map((task, i) => (
                    <div
                      key={i}
                      className="bg-slate-800 border border-slate-700/60 rounded-lg p-3 animate-fade-in"
                      style={{ animationDelay: `${(i + 3) * 150}ms` }}
                    >
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 text-red-400">
                        High
                      </span>
                      <p className="text-sm text-slate-200 mt-2 font-medium">
                        {task}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DONE Column */}
              <div className="rounded-xl overflow-hidden">
                <div className="bg-slate-800/80 border-t-2 border-green-500 px-4 py-2.5">
                  <span className="text-sm font-semibold text-green-300">
                    ✅ Done
                  </span>
                  <span className="ml-2 text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">
                    2
                  </span>
                </div>
                <div className="bg-slate-800/30 p-3 space-y-2.5 min-h-[200px]">
                  {['Project Setup', 'Database Schema'].map((task, i) => (
                    <div
                      key={i}
                      className="bg-slate-800 border border-slate-700/60 rounded-lg p-3 animate-fade-in"
                      style={{ animationDelay: `${(i + 5) * 150}ms` }}
                    >
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                        Low
                      </span>
                      <p className="text-sm text-slate-200 mt-2 font-medium line-through opacity-60">
                        {task}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-24 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="text-primary-400">Ship Faster</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Built for modern development teams who want clarity, speed, and
              collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Layout size={24} />,
                title: 'Kanban Boards',
                desc: 'Visual task management with drag-and-drop columns — To Do, In Progress, Done.',
                color: 'text-blue-400',
                bg: 'bg-blue-600/10',
              },
              {
                icon: <Users size={24} />,
                title: 'Team Management',
                desc: 'Invite your team via unique company codes. Assign tasks to specific members.',
                color: 'text-green-400',
                bg: 'bg-green-600/10',
              },
              {
                icon: <Shield size={24} />,
                title: 'Role-Based Access',
                desc: 'Master Admin, Admin, and User roles with proper permission controls.',
                color: 'text-purple-400',
                bg: 'bg-purple-600/10',
              },
              {
                icon: <Building2 size={24} />,
                title: 'Multi-Company',
                desc: 'Complete data isolation. Each company sees only their own data.',
                color: 'text-yellow-400',
                bg: 'bg-yellow-600/10',
              },
              {
                icon: <BarChart3 size={24} />,
                title: 'Progress Tracking',
                desc: 'Real-time stats and completion rates for every team member.',
                color: 'text-red-400',
                bg: 'bg-red-600/10',
              },
              {
                icon: <Clock size={24} />,
                title: 'Domain Validation',
                desc: 'Restrict signups to company email domains for security.',
                color: 'text-cyan-400',
                bg: 'bg-cyan-600/10',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-6 hover:border-slate-500/60 hover:bg-slate-900 transition-all duration-300 group"
              >
                <div
                  className={`${feature.bg} ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS SECTION ─── */}
      <section
        id="how-it-works"
        className="py-24 border-t border-slate-800/60 bg-slate-900/30"
      >
        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Started in{' '}
              <span className="text-primary-400">3 Simple Steps</span>
            </h2>
            <p className="text-slate-400 text-lg">
              From signup to shipping — in under 5 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: <Building2 size={28} />,
                title: 'Register Your Company',
                desc: 'Create your company workspace and become the Master Admin. Set email domain restrictions.',
                link: '/register-company',
                linkText: 'Register Now →',
                color: 'from-primary-600 to-blue-600',
              },
              {
                step: '02',
                icon: <UserPlus size={28} />,
                title: 'Invite Your Team',
                desc: 'Share the unique invite code. Team members sign up as Admins or Users.',
                link: '/signup',
                linkText: 'Join Company →',
                color: 'from-blue-600 to-purple-600',
              },
              {
                step: '03',
                icon: <Layout size={28} />,
                title: 'Start Sprinting',
                desc: 'Admins create and assign tasks. Users track progress on their Kanban boards.',
                link: '/login',
                linkText: 'Sign In →',
                color: 'from-purple-600 to-pink-600',
              },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div
                  className={`bg-gradient-to-br ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 transition-transform`}
                >
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Step {item.step}
                </span>
                <h3 className="text-xl font-bold text-white mt-2 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {item.desc}
                </p>
                <Link
                  to={item.link}
                  className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  {item.linkText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLES SECTION ─── */}
      <section id="roles" className="py-24 border-t border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for <span className="text-primary-400">Every Role</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Three distinct roles. One unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '👑',
                role: 'Master Admin',
                color: 'border-purple-500/60',
                badge: 'bg-purple-900/30 text-purple-400',
                features: [
                  'Registers the company',
                  'Sets email domain restrictions',
                  'Manages all admins and users',
                  'Can remove team members',
                  'Shares invite code',
                ],
              },
              {
                icon: '⚡',
                role: 'Admin',
                color: 'border-yellow-500/60',
                badge: 'bg-yellow-900/30 text-yellow-400',
                features: [
                  'Creates tasks',
                  'Assigns tasks to users',
                  'Views all company tasks',
                  'Tracks team progress',
                  'Edits and deletes tasks',
                ],
              },
              {
                icon: '👤',
                role: 'Team Member',
                color: 'border-blue-500/60',
                badge: 'bg-blue-900/30 text-blue-400',
                features: [
                  'Personal Kanban board',
                  'Sees only assigned tasks',
                  'Moves tasks between columns',
                  'Updates task status',
                  'Focused work view',
                ],
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-slate-900/60 border ${item.color} rounded-2xl p-6 hover:bg-slate-900 transition-all`}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.badge}`}
                >
                  {item.role}
                </span>
                <ul className="mt-5 space-y-3">
                  {item.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <CheckCircle
                        size={15}
                        className="text-green-400 flex-shrink-0"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 border-t border-slate-800/60">
        <div className="max-w-3xl mx-auto px-6 text-center">

          <div className="bg-gradient-to-br from-primary-600/20 to-purple-600/20 border border-primary-500/20 rounded-3xl p-12">
            <div className="h-14 w-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-600/30">
              <Zap size={28} className="text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Sprint?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
              Start managing your team's workflow today. Free to use, no credit
              card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register-company"
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-2xl shadow-primary-600/30 hover:shadow-primary-600/50"
              >
                <Building2 size={18} />
                Register Company
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3.5 rounded-xl font-semibold border border-slate-700 transition-all"
              >
                <UserPlus size={18} />
                Join Existing Company
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-800/60 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-400">
              Dev<span className="text-primary-400">Sprint</span>
            </span>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} DevSprint. Built for agile teams.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/login" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-slate-300 transition-colors">
              Join Company
            </Link>
            <Link to="/register-company" className="hover:text-slate-300 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;