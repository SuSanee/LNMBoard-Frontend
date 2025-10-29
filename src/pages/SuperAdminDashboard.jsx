import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '@/api/superAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'react-toastify';
import { LogOut, Users, UserPlus, CheckCircle } from 'lucide-react';
import logo from '@/assets/lnmiit-logo.png';

const SuperAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('requests');
  const [adminRequests, setAdminRequests] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!superAdminAPI.isAuthenticated()) {
      navigate('/super-admin/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requests, admins] = await Promise.all([
        superAdminAPI.getAdminRequests(),
        superAdminAPI.getAllAdmins(),
      ]);
      setAdminRequests(requests);
      setAllAdmins(admins);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    superAdminAPI.logout();
    toast.success('Logged out successfully');
    navigate('/super-admin/login');
  };

  const handleApprove = async (id) => {
    try {
      await superAdminAPI.approveAdmin(id);
      toast.success('Admin approved successfully');
      loadData();
    } catch (error) {
      console.error('Error approving admin:', error);
      toast.error(error.response?.data?.message || 'Failed to approve admin');
    }
  };

  const handleReject = async (id) => {
    try {
      await superAdminAPI.rejectAdmin(id);
      toast.success('Admin request rejected');
      loadData();
    } catch (error) {
      console.error('Error rejecting admin:', error);
      toast.error(error.response?.data?.message || 'Failed to reject admin');
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      await superAdminAPI.deleteAdmin(id);
      toast.success('Admin deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await superAdminAPI.createAdmin(formData.name, formData.email, formData.password);
      toast.success('Admin created successfully');
      setFormData({ name: '', email: '', password: '' });
      loadData();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.response?.data?.message || 'Failed to create admin');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex h-screen bg-lnmiit-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-lnmiit-maroon text-white flex flex-col shadow-lg">
        <div className="p-6 border-b border-white/10 flex flex-col items-center">
          <img src={logo} alt="LNMIIT Logo" className="h-16 mb-3 bg-white p-2 rounded" />
          <h2 className="text-lg font-bold text-center">Super Admin Panel</h2>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection('requests')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                  activeSection === 'requests'
                    ? 'bg-lnmiit-gold text-lnmiit-maroon font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                Admin Requests
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('admins')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                  activeSection === 'admins'
                    ? 'bg-lnmiit-gold text-lnmiit-maroon font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                <Users className="w-5 h-5" />
                All Admins
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('create')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                  activeSection === 'create'
                    ? 'bg-lnmiit-gold text-lnmiit-maroon font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                Create Admin
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-2xl font-bold text-lnmiit-maroon">
              Digital Notice Board — Super Admin
            </h1>
            <Button
              onClick={handleLogout}
              variant="lnmiit"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Admin Requests Section */}
          {activeSection === 'requests' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lnmiit-maroon">Pending Admin Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : adminRequests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending requests</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Date Requested</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminRequests.map((request) => (
                          <TableRow key={request._id}>
                            <TableCell className="font-medium">{request.name}</TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{formatDate(request.createdAt)}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                onClick={() => handleApprove(request._id)}
                                variant="lnmiit"
                                size="sm"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(request._id)}
                                variant="destructive"
                                size="sm"
                              >
                                Reject
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* All Admins Section */}
          {activeSection === 'admins' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lnmiit-maroon">All Admins</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : allAdmins.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No admins found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Joined On</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allAdmins.map((admin) => (
                          <TableRow key={admin._id}>
                            <TableCell className="font-medium">{admin.name}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>{formatDate(admin.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                onClick={() => handleDeleteAdmin(admin._id)}
                                variant="destructive"
                                size="sm"
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Create Admin Section */}
          {activeSection === 'create' && (
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="text-lnmiit-maroon">Create New Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter admin name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@lnmiit.ac.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" variant="lnmiit" className="w-full">
                    Create Admin
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;


