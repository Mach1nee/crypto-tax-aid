import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const AddWalletDialog = ({ open, onOpenChange, userId }: AddWalletDialogProps) => {
  const { toast } = useToast();
  const [walletType, setWalletType] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletName, setWalletName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("wallets").insert({
        user_id: userId,
        wallet_type: walletType,
        wallet_address: walletAddress,
        wallet_name: walletName || null,
      });

      if (error) throw error;

      toast({
        title: "Carteira adicionada!",
        description: "Sua carteira foi conectada com sucesso",
      });

      onOpenChange(false);
      setWalletType("");
      setWalletAddress("");
      setWalletName("");
      
      // Reload the page to show the new wallet
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar carteira",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Carteira</DialogTitle>
          <DialogDescription>
            Conecte sua carteira ou exchange para importar transações
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-type">Tipo de Carteira</Label>
            <Select value={walletType} onValueChange={setWalletType} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metamask">MetaMask</SelectItem>
                <SelectItem value="trust">Trust Wallet</SelectItem>
                <SelectItem value="binance">Binance</SelectItem>
                <SelectItem value="coinbase">Coinbase</SelectItem>
                <SelectItem value="other">Outra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-name">Nome (opcional)</Label>
            <Input
              id="wallet-name"
              placeholder="Minha carteira principal"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-address">Endereço da Carteira</Label>
            <Input
              id="wallet-address"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adicionando..." : "Adicionar Carteira"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
