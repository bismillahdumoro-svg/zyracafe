import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Lock, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserRole } from "@/lib/types";

interface LoginPageProps {
  onLogin: (username: string, password: string, role: UserRole) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("cashier");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // todo: remove mock functionality
    setTimeout(() => {
      onLogin(username, password, role);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-end p-4">
        <ThemeToggle />
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-semibold">POS App</CardTitle>
            <p className="text-muted-foreground text-sm">
              Masuk ke sistem kasir
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-muted rounded-md">
                <Button
                  type="button"
                  variant={role === "cashier" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setRole("cashier")}
                  data-testid="button-role-cashier"
                >
                  Kasir
                </Button>
                <Button
                  type="button"
                  variant={role === "admin" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setRole("admin")}
                  data-testid="button-role-admin"
                >
                  Admin
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    data-testid="input-username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    data-testid="input-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center p-4 text-sm text-muted-foreground">
        POS App v1.0
      </footer>
    </div>
  );
}
