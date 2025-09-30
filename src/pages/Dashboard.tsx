import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Wallet, FileText, LogOut, Crown, Plus } from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { WalletsList } from "@/components/dashboard/WalletsList";
import { AddWalletDialog } from "@/components/dashboard/AddWalletDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddWallet, setShowAddWallet] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setSubscription(subData);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const isPremium = subscription?.plan_type === "premium";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">CryptoTax</h1>
            </div>
            <div className="flex items-center gap-4">
              {!isPremium && (
                <Button
                  onClick={() => navigate("/premium")}
                  className="gap-2"
                  variant="default"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade Premium
                </Button>
              )}
              {isPremium && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                  <Crown className="h-4 w-4" />
                  Premium
                </div>
              )}
              <Button onClick={handleSignOut} variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user?.email}
          </p>
        </div>

        <StatsCards userId={user?.id} isPremium={isPremium} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Minhas Carteiras
                </CardTitle>
                <CardDescription>
                  Conecte suas carteiras e exchanges
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddWallet(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <WalletsList userId={user?.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>
                Gere seus relatórios para o IR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline" disabled={!isPremium}>
                {isPremium ? "Gerar Relatório 2024" : "Premium necessário"}
              </Button>
              <Button className="w-full" variant="outline" disabled={!isPremium}>
                {isPremium ? "Gerar Relatório Anual" : "Premium necessário"}
              </Button>
              {!isPremium && (
                <p className="text-sm text-muted-foreground text-center">
                  Faça upgrade para acessar relatórios detalhados
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Suas últimas movimentações de criptomoedas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsList userId={user?.id} isPremium={isPremium} />
          </CardContent>
        </Card>
      </main>

      <AddWalletDialog
        open={showAddWallet}
        onOpenChange={setShowAddWallet}
        userId={user?.id}
      />
    </div>
  );
};

export default Dashboard;
