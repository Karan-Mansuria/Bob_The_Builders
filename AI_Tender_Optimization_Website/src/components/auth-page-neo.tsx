import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Zap, Mail, Lock, User } from "lucide-react";
import { motion } from "motion/react";
import { NeoBackground } from "./neo-background";
import { ThemeToggle } from "./theme-toggle";

interface AuthPageNeoProps {
  onLogin: (email: string) => void;
}

export function AuthPageNeo({ onLogin }: AuthPageNeoProps) {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (signInEmail) {
      onLogin(signInEmail);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpEmail) {
      onLogin(signUpEmail);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <NeoBackground />
      
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 hidden lg:block"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-50"></div>
              <div className="relative bg-slate-800 dark:bg-slate-700 p-4 rounded-2xl border border-cyan-500/30">
                <Zap className="h-10 w-10 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl text-slate-900 dark:text-white">TenderAI</h1>
              <p className="text-cyan-500 text-sm">Neo-Tech Edition</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl text-text-primary leading-tight">
              Smarter Tenders,<br />
              <span className="text-accent-yellow">Faster Decisions</span>
            </h2>
            <p className="text-xl text-text-secondary">
              AI-powered bid optimization that transforms your tender process
            </p>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 p-4 rounded-xl glass"
            >
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-slate-900 dark:text-white">Lightning Analysis</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Process bids in seconds</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 p-4 rounded-xl glass"
            >
              <div className="w-12 h-12 rounded-lg bg-aqua-400/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-aqua-400" />
              </div>
              <div>
                <div className="text-slate-900 dark:text-white">AI Optimization</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Maximize win rates</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 p-4 rounded-xl glass"
            >
              <div className="w-12 h-12 rounded-lg bg-amber-400/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <div className="text-slate-900 dark:text-white">Smart Insights</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Data-driven recommendations</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Auth Forms */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-strong shadow-2xl border-cyan-500/20 p-8">
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="bg-slate-800 dark:bg-slate-700 p-3 rounded-xl border border-cyan-500/30">
                  <Zap className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="text-left">
                  <div className="text-2xl text-slate-900 dark:text-white">TenderAI</div>
                  <div className="text-cyan-500 text-xs">Neo-Tech Edition</div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
                <TabsTrigger 
                  value="signin"
                  className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-slate-700 dark:text-slate-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="pl-10 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-xl h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-slate-700 dark:text-slate-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="pl-10 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-xl h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700" />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="text-cyan-500 hover:text-cyan-600">
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl shadow-lg shadow-amber-500/30 transition-all"
                  >
                    Continue
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-slate-700 dark:text-slate-300">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="pl-10 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-xl h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-slate-700 dark:text-slate-300">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="pl-10 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-xl h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-slate-700 dark:text-slate-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="pl-10 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/30 rounded-xl h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1 rounded border-slate-300 dark:border-slate-700" required />
                    <span className="text-slate-600 dark:text-slate-400">
                      I agree to the{" "}
                      <a href="#" className="text-cyan-500 hover:text-cyan-600">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-cyan-500 hover:text-cyan-600">
                        Privacy Policy
                      </a>
                    </span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl shadow-lg shadow-amber-500/30 transition-all"
                  >
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Trusted by 500+ contractors worldwide
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
