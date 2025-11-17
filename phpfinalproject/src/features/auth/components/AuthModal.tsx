import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Crown, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Login schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Sign up schema
const signUpSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'signup';
}

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuthStore();

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Sign up form
  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle login
  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password, 'customer');
      toast.success('Welcome back!');
      onOpenChange(false);
      loginForm.reset();
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign up
  const onSignUpSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await signup(data.name, data.email, data.password);
      toast.success('Welcome to Lord of the Rims!');
      onOpenChange(false);
      signUpForm.reset();
    } catch (error) {
      toast.error('Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset forms when switching tabs
  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    loginForm.reset();
    signUpForm.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-primary" />
            <DialogTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Lord of the Rims
            </DialogTitle>
          </div>
          <DialogDescription className="text-center">
            {activeTab === 'login' ? 'Welcome back! Login to your account' : 'Create your account to start renting'}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => handleTabChange('login')}
            className={cn(
              'flex-1 pb-3 text-sm font-medium transition-colors relative',
              activeTab === 'login'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Login
            {activeTab === 'login' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={cn(
              'flex-1 pb-3 text-sm font-medium transition-colors relative',
              activeTab === 'signup'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Sign Up
            {activeTab === 'signup' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...loginForm.register('email')}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  {...loginForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('signup')}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && (
          <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10"
                  {...signUpForm.register('name')}
                />
              </div>
              {signUpForm.formState.errors.name && (
                <p className="text-sm text-red-500">{signUpForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...signUpForm.register('email')}
                />
              </div>
              {signUpForm.formState.errors.email && (
                <p className="text-sm text-red-500">{signUpForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className="pl-10 pr-10"
                  {...signUpForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {signUpForm.formState.errors.password && (
                <p className="text-sm text-red-500">{signUpForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10"
                  {...signUpForm.register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {signUpForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{signUpForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className="text-primary hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
