import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletsListProps {
  userId: string;
}

export const WalletsList = ({ userId }: WalletsListProps) => {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWallets = async () => {
    const { data } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setWallets(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchWallets();
  }, [userId]);

  const handleDelete = async (walletId: string) => {
    const { error } = await supabase
      .from("wallets")
      .delete()
      .eq("id", walletId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover carteira",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Carteira removida",
      description: "A carteira foi removida com sucesso",
    });

    fetchWallets();
  };

  if (loading) {
    return <p className="text-muted-foreground text-center py-4">Carregando...</p>;
  }

  if (wallets.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-muted-foreground">Nenhuma carteira conectada</p>
        <p className="text-sm text-muted-foreground">
          Adicione uma carteira para começar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{wallet.wallet_name || "Carteira"}</p>
              <Badge variant="outline" className="capitalize">
                {wallet.wallet_type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              {wallet.wallet_address.slice(0, 8)}...{wallet.wallet_address.slice(-6)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(wallet.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
};
