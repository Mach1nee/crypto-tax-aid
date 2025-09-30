import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react";

interface StatsCardsProps {
  userId: string;
  isPremium: boolean;
}

export const StatsCards = ({ userId, isPremium }: StatsCardsProps) => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalValue: 0,
    totalTax: 0,
    walletsCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId);

      const { data: wallets } = await supabase
        .from("wallets")
        .select("id")
        .eq("user_id", userId);

      if (transactions) {
        const totalValue = transactions.reduce((sum, t) => sum + (Number(t.total_brl) || 0), 0);
        const totalTax = transactions.reduce((sum, t) => sum + (Number(t.tax_amount) || 0), 0);

        setStats({
          totalTransactions: transactions.length,
          totalValue,
          totalTax,
          walletsCount: wallets?.length || 0,
        });
      }
    };

    fetchStats();
  }, [userId]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transações</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          <p className="text-xs text-muted-foreground">
            {isPremium ? "Histórico completo" : "Plano gratuito"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isPremium
              ? `R$ ${stats.totalValue.toFixed(2)}`
              : "Premium"}
          </div>
          <p className="text-xs text-muted-foreground">
            Em transações
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Impostos</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isPremium
              ? `R$ ${stats.totalTax.toFixed(2)}`
              : "Premium"}
          </div>
          <p className="text-xs text-muted-foreground">
            A pagar estimado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Carteiras</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.walletsCount}</div>
          <p className="text-xs text-muted-foreground">
            Conectadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
