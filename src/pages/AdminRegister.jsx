import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { superAdminAPI } from '@/api/superAdmin';
import { toast } from 'react-toastify';
import bgImage from '@/assets/bg-image.jpg';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastSubmit, setLastSubmit] = useState(0);
  const navigate = useNavigate();

  // Validation rules
  const validateEmail = (email) => /^[\w.-]+@lnmiit\.ac\.in$/.test(email);
  const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  const validateName = (name) => name.trim().length >= 3;

  const validateForm = () => {
    const newErrors = {};

    if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please use a valid LNMIIT email (@lnmiit.ac.in)';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 8+ chars with uppercase letter and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Rate limiting
    const now = Date.now();
    if (now - lastSubmit < 3000) {
      toast.warning('Please wait a moment before trying again');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setLastSubmit(now);

    try {
      await superAdminAPI.registerAdmin(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );
      toast.success('Registration request submitted! Please wait for super admin approval.');
      setTimeout(() => {
        navigate('/super-admin/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
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
      <div className="relative z-10" style={{ width: '700px', maxWidth: '90vw' }}>
        <Card className="w-full shadow-2xl">
          <CardHeader className="space-y-2 text-center pt-8 pb-6">
            <CardTitle className="text-3xl font-bold text-lnmiit-maroon">
              Admin Registration
            </CardTitle>
            <p className="text-base text-muted-foreground">
              Request admin access to the Digital Notice Board System
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full h-12 text-base ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@lnmiit.ac.in"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full h-12 text-base ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full h-12 text-base ${errors.password ? 'border-red-500' : ''}`}
                />
                {formData.password && (
                  <div className="text-sm">
                    {validatePassword(formData.password) ? (
                      <p className="text-green-600">✓ Strong password</p>
                    ) : (
                      <p className="text-yellow-600">
                        Need: 8+ chars, 1 uppercase, 1 number
                      </p>
                    )}
                  </div>
                )}
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full h-12 text-base ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-sm text-green-600">✓ Passwords match</p>
                )}
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Your registration request will be sent to the super admin for approval. 
                  You will be able to login once your request is approved.
                </p>
              </div>

              <Button
                type="submit"
                variant="lnmiit"
                className="w-full h-12 text-base"
                disabled={loading || Object.keys(errors).some(key => errors[key])}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Submitting...
                  </span>
                ) : (
                  'Register'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/super-admin/login')}
                  className="text-lnmiit-maroon font-semibold hover:underline"
                >
                  Login here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegister;


