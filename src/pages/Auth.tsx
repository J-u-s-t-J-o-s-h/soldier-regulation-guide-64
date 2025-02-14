
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement authentication logic
    console.log("Form submitted:", { email, password, name });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <svg
              className="h-16 w-16"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Circle */}
              <circle
                cx="100"
                cy="100"
                r="98"
                fill="#2C4A2C"
                stroke="#BFB393"
                strokeWidth="4"
              />
              {/* Shield Background */}
              <path
                d="M100 35C138.66 35 170 66.34 170 105C170 143.66 138.66 175 100 175C61.34 175 30 143.66 30 105C30 66.34 61.34 35 100 35Z"
                fill="#4A5D4F"
              />
              {/* Book Icon */}
              <path
                d="M80 75V135H130V75H80ZM125 130H85V80H125V130Z"
                fill="#BFB393"
              />
              <rect
                x="90"
                y="90"
                width="30"
                height="4"
                fill="#BFB393"
              />
              <rect
                x="90"
                y="100"
                width="30"
                height="4"
                fill="#BFB393"
              />
              <rect
                x="90"
                y="110"
                width="20"
                height="4"
                fill="#BFB393"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-military-gold">
            Army Regulations Guide
          </h2>
          <p className="mt-2 text-military-muted">
            {isLogin
              ? "Sign in to access Army regulations"
              : "Create an account to get started"}
          </p>
        </div>

        <div className="military-glass p-8 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-military-dark/50"
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-military-muted h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-military-dark/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-military-muted h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-military-dark/50"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-military-gold hover:bg-military-gold/90 text-military-dark"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-military-muted hover:text-military-gold transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
