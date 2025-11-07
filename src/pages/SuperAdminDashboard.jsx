import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '@/api/superAdmin';
import { accountAPI } from '@/api/account';
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
  const [activeSection, setActiveSection] = useState('admins');
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
      const [admins] = await Promise.all([
        superAdminAPI.getAllAdmins(),
      ]);
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

  const submitChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setPwdLoading(true);
      await accountAPI.changePassword(pwdForm.currentPassword, pwdForm.newPassword, pwdForm.confirmPassword);
      toast.success('Password updated successfully');
      setShowChangePwd(false);
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
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
    <div className="flex flex-col md:flex-row h-screen bg-lnmiit-bg">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-lnmiit-maroon text-white flex flex-col shadow-lg flex-shrink-0">
        <div className="p-4 md:p-6 border-b border-white/10 flex flex-row items-center justify-between">
          <img src={logo} alt="LNMIIT Logo" className="h-12 md:h-16 bg-white p-2 rounded" />
          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              onClick={() => setShowChangePwd(true)}
              variant="lnmiit"
              className="flex items-center gap-2"
            >
              Change Password
            </Button>
            <Button
              onClick={handleLogout}
              variant="lnmiit"
              className="flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <nav className="flex-1 p-2 md:p-4">
          <ul className="flex flex-row md:flex-col justify-around md:justify-start md:space-y-2">
            <li className="flex-1 md:flex-none">
              <button
                onClick={() => setActiveSection('admins')}
                className={`w-full text-center md:text-left px-2 py-2 md:px-4 md:py-3 rounded-lg transition-all flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 ${
                  activeSection === 'admins'
                    ? 'bg-lnmiit-gold text-lnmiit-maroon font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs md:text-base">Admins</span>
              </button>
            </li>
            <li className="flex-1 md:flex-none">
              <button
                onClick={() => setActiveSection('create')}
                className={`w-full text-center md:text-left px-2 py-2 md:px-4 md:py-3 rounded-lg transition-all flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 ${
                  activeSection === 'create'
                    ? 'bg-lnmiit-gold text-lnmiit-maroon font-semibold'
                    : 'hover:bg-white/10'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span className="text-xs md:text-base">Create</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
            <div className="flex items-center">
            </div>
            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                onClick={() => setShowChangePwd(true)}
                variant="lnmiit"
                className="items-center gap-2"
              >
                Change Password
              </Button>
              <Button
                onClick={handleLogout}
                variant="lnmiit"
                className="items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
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
            <Card className="max-w-full md:max-w-2xl">
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

      {showChangePwd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowChangePwd(false)}>
          <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={pwdForm.confirmPassword} onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowChangePwd(false)}>Cancel</Button>
                  <Button type="submit" disabled={pwdLoading} className="bg-lnmiit-maroon hover:bg-lnmiit-maroon/90 text-white">{pwdLoading ? 'Updating...' : 'Update Password'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Change Password Modal
// Placed after component return to keep component export default at bottom
// Rendered conditionally below

export default SuperAdminDashboard;


