import { useState } from 'react';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Combined landing / sign-in / sign-up page. Shown whenever no user is
 * signed in. Local-only auth (localStorage). The first registered account
 * is automatically granted admin privileges.
 */
export const Auth = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast({ title: 'Welcome back', description: 'Signed in successfully.' });
    } catch (err) {
      toast({ title: 'Sign in failed', description: (err as Error).message, variant: 'destructive' });
    } finally { setLoginLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    try {
      const u = await signUp(signupEmail, signupPassword, signupName);
      toast({
        title: u.isAdmin ? 'Account created (Admin)' : 'Account created',
        description: u.isAdmin
          ? 'You are the first user — admin privileges granted.'
          : 'Welcome to your case workspace.',
      });
    } catch (err) {
      toast({ title: 'Sign up failed', description: (err as Error).message, variant: 'destructive' });
    } finally { setSignupLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero / landing band */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container flex h-16 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-semibold text-foreground">Legal Case</h1>
            <p className="text-xs text-muted-foreground">Garnishee Case Management</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6 animate-fade-in">
          <h2 className="font-heading text-4xl sm:text-5xl font-semibold text-foreground leading-tight">
            Your private workspace for garnishee proceedings.
          </h2>
          <p className="text-lg text-muted-foreground max-w-prose">
            Track every case, court date, indorsement and counsel — neatly
            organised in your own account. Import and export Excel, log
            adjournments, and never miss a hearing.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Per-user workspace with your own theme and lists</li>
            <li>• Offline Excel import / export</li>
            <li>• Calendar of upcoming hearings</li>
            <li>• Case log with indorsements and counsel history</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg animate-slide-up">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <Label htmlFor="li-email">Email</Label>
                  <Input id="li-email" type="email" required value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <Label htmlFor="li-pwd">Password</Label>
                  <Input id="li-pwd" type="password" required value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignup} className="space-y-3">
                <div>
                  <Label htmlFor="su-name">Display name</Label>
                  <Input id="su-name" value={signupName}
                    onChange={(e) => setSignupName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div>
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" required value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <Label htmlFor="su-pwd">Password</Label>
                  <Input id="su-pwd" type="password" required minLength={6} value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)} placeholder="At least 6 characters" />
                </div>
                <Button type="submit" className="w-full" disabled={signupLoading}>
                  {signupLoading ? 'Creating account…' : 'Create account'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Your data is stored privately in this browser only.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Auth;