import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, Briefcase, Image, Settings, LogOut, 
  Users, Clock, CheckCircle, XCircle, MoreVertical, Edit, Trash2,
  Plus, Search, Filter, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Dashboard Overview
const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setRecentBookings(bookingsRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Bookings', value: stats?.total_bookings || 0, icon: Calendar, color: 'cyan' },
    { label: 'Pending', value: stats?.pending_bookings || 0, icon: Clock, color: 'yellow' },
    { label: 'Confirmed', value: stats?.confirmed_bookings || 0, icon: CheckCircle, color: 'green' },
    { label: 'Completed', value: stats?.completed_bookings || 0, icon: CheckCircle, color: 'purple' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-white/50">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-2xl p-6 border border-white/10"
            data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-400/20 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-cyan-400 text-sm hover:underline">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-sm text-white/60 font-medium">Client</th>
                <th className="text-left p-4 text-sm text-white/60 font-medium">Service</th>
                <th className="text-left p-4 text-sm text-white/60 font-medium">Date</th>
                <th className="text-left p-4 text-sm text-white/60 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{booking.full_name}</p>
                      <p className="text-xs text-white/40">{booking.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-white/70">{booking.service_name}</td>
                  <td className="p-4 text-white/70">{booking.preferred_date}</td>
                  <td className="p-4">
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/40">
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
    confirmed: 'bg-green-400/20 text-green-400 border-green-400/30',
    completed: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
    cancelled: 'bg-red-400/20 text-red-400 border-red-400/30'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

// Bookings Management
const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Status updated');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch = b.full_name.toLowerCase().includes(search.toLowerCase()) ||
                          b.email.toLowerCase().includes(search.toLowerCase()) ||
                          b.service_name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-white/30"
              data-testid="bookings-search"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a12] border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-sm text-white/60 font-medium">Client</th>
                  <th className="text-left p-4 text-sm text-white/60 font-medium">Service</th>
                  <th className="text-left p-4 text-sm text-white/60 font-medium">Date & Time</th>
                  <th className="text-left p-4 text-sm text-white/60 font-medium">Status</th>
                  <th className="text-left p-4 text-sm text-white/60 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-white/5 hover:bg-white/5" data-testid={`booking-row-${booking.id}`}>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{booking.full_name}</p>
                        <p className="text-xs text-white/40">{booking.email}</p>
                        <p className="text-xs text-white/40">{booking.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white/70">{booking.service_name}</p>
                      <p className="text-xs text-white/40 line-clamp-1 max-w-xs">{booking.description}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white/70">{booking.preferred_date}</p>
                      <p className="text-xs text-white/40">{booking.preferred_time}</p>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-white/10 rounded-lg" data-testid={`booking-actions-${booking.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a0a12] border-white/10">
                          <DropdownMenuItem onClick={() => updateStatus(booking.id, 'confirmed')} className="hover:bg-white/10">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" /> Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(booking.id, 'completed')} className="hover:bg-white/10">
                            <CheckCircle className="w-4 h-4 mr-2 text-purple-400" /> Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(booking.id, 'cancelled')} className="hover:bg-white/10">
                            <XCircle className="w-4 h-4 mr-2 text-red-400" /> Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/40">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Projects Management
const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    work_type: '',
    image_url: '',
    featured: true
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await axios.put(`${API}/projects/${editingProject.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Project updated');
      } else {
        await axios.post(`${API}/projects`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Project created');
      }
      fetchProjects();
      resetForm();
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`${API}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      work_type: project.work_type,
      image_url: project.image_url,
      featured: project.featured
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', work_type: '', image_url: '', featured: true });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-semibold text-sm hover:scale-105 transition-transform"
          data-testid="add-project-btn"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Project Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold mb-4">{editingProject ? 'Edit Project' : 'New Project'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  required
                  data-testid="project-name-input"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Work Type</label>
                <input
                  type="text"
                  value={formData.work_type}
                  onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                  placeholder="e.g., Mixing, Dubbing"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  required
                  data-testid="project-type-input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none"
                required
                data-testid="project-description-input"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                required
                data-testid="project-image-input"
              />
              <p className="text-xs text-white/40 mt-1">Paste image URL from Unsplash or any image hosting service</p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:scale-105 transition-transform"
                data-testid="project-submit-btn"
              >
                {editingProject ? 'Update' : 'Create'} Project
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl glass border border-white/10 text-sm hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl overflow-hidden border border-white/10 group"
            data-testid={`project-card-${project.id}`}
          >
            <div className="relative h-40">
              <img 
                src={project.image_url} 
                alt={project.name}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 rounded-lg glass-heavy hover:bg-white/20"
                  data-testid={`edit-project-${project.id}`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 rounded-lg glass-heavy hover:bg-red-500/30"
                  data-testid={`delete-project-${project.id}`}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <span className="text-xs text-cyan-400 uppercase tracking-wider">{project.work_type}</span>
              <h3 className="font-bold mt-1">{project.name}</h3>
              <p className="text-white/50 text-sm mt-1 line-clamp-2">{project.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main Admin Dashboard
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/projects', icon: Image, label: 'Projects' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#030305] pt-28" data-testid="admin-dashboard">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 fixed left-0 top-28 bottom-0 border-r border-white/5 p-6 hidden lg:block">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
                data-testid={`sidebar-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="glass rounded-xl p-4 border border-white/10 mb-4">
              <p className="text-sm text-white/60">Logged in as</p>
              <p className="font-semibold truncate">{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
              data-testid="admin-logout"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Mobile Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 px-6 py-3 z-50">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl ${
                  location.pathname === item.path ? 'text-cyan-400' : 'text-white/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-6 lg:p-10 pb-24 lg:pb-10">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="bookings" element={<BookingsManagement />} />
            <Route path="projects" element={<ProjectsManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
