import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { superAdminAPI } from '@/api/superAdmin';
import { toast } from 'react-toastify';
import bgImage from '@/assets/bg-image.jpg';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await superAdminAPI.login(email, password);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (response.admin.role === 'super-admin') {
        navigate('/super-admin/dashboard');
      } else if (response.admin.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Card with higher z-index */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full shadow-2xl">
          <CardHeader className="space-y-2 text-center pt-6 md:pt-8 pb-4 md:pb-6">
            <CardTitle className="text-2xl md:text-3xl font-bold text-lnmiit-maroon">
              Admin Login
            </CardTitle>
            <p className="text-base text-muted-foreground">
              LNMBoard
            </p>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-6 md:pb-8">
            <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm md:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@lnmiit.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-10 md:h-12 text-sm md:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm md:text-base">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-10 md:h-12 text-sm md:text-base"
                />
              </div>

              <Button
                type="submit"
                variant="lnmiit"
                className="w-full h-10 md:h-12 text-sm md:text-base"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Want to create admin account?{' '}
                <button
                  onClick={() => navigate('/admin/register')}
                  className="text-lnmiit-maroon font-semibold hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminLogin;


