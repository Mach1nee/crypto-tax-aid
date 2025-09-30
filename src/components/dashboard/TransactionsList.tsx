import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRightLeft, Repeat } from "lucide-react";

interface TransactionsListProps {
  userId: string;
  isPremium: boolean;
}

export const TransactionsList = ({ userId, isPremium }: TransactionsListProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false })
        .limit(isPremium ? 100 : 5);

      setTransactions(data || []);
      setLoading(false);
    };

    fetchTransactions();
  }, [userId, isPremium]);

  if (loading) {
    return <p className="text-muted-foreground text-center py-8">Carregando...</p>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-muted-foreground">Nenhuma transação encontrada</p>
        <p className="text-sm text-muted-foreground">
          Conecte suas carteiras para importar transações
        </p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "sell":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case "swap":
        return <Repeat className="h-4 w-4 text-primary" />;
      default:
        return <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      buy: "Compra",
      sell: "Venda",
      swap: "Troca",
      transfer: "Transferência",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            {getIcon(transaction.transaction_type)}
            <div>
              <p className="font-medium">
                {transaction.amount} {transaction.crypto_symbol}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(transaction.transaction_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={transaction.transaction_type === "buy" ? "default" : "secondary"}>
              {getTypeLabel(transaction.transaction_type)}
            </Badge>
            {isPremium && transaction.total_brl && (
              <p className="text-sm text-muted-foreground mt-1">
                R$ {Number(transaction.total_brl).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      ))}

      {!isPremium && transactions.length >= 5 && (
        <p className="text-center text-sm text-muted-foreground">
          Upgrade para premium para ver todas as transações
        </p>
      )}
    </div>
  );
};
