import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, ArrowLeft, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Premium = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProof, setPaymentProof] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pixKey = "3df19472-2603-45a5-8253-1ab4a6267e34";
  const ownerName = "Lucas Matheus Santos Da Silva";
  const price = "R$ 10,00";

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
  }, [navigate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Chave PIX copiada para a área de transferência",
    });
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan_type: "premium",
          status: "active",
          payment_proof: paymentProof,
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Premium ativado!",
        description: "Seu plano premium foi ativado com sucesso.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao ativar premium",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (subscription?.plan_type === "premium") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle>Você já é Premium!</CardTitle>
            <CardDescription>
              Aproveite todos os benefícios do plano premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button
          onClick={() => navigate("/dashboard")}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-glow">
            <CardHeader className="text-center">
              <Crown className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-3xl">Plano Premium</CardTitle>
              <CardDescription>
                🎉 Promoção Especial - Apenas {price}/mês
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Relatórios Completos</p>
                    <p className="text-sm text-muted-foreground">
                      Gere relatórios detalhados para IR
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Carteiras Ilimitadas</p>
                    <p className="text-sm text-muted-foreground">
                      Conecte quantas carteiras quiser
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Cálculo Automático</p>
                    <p className="text-sm text-muted-foreground">
                      Impostos calculados automaticamente
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Suporte Prioritário</p>
                    <p className="text-sm text-muted-foreground">
                      Atendimento rápido e dedicado
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium">Exportação PDF</p>
                    <p className="text-sm text-muted-foreground">
                      Exporte relatórios em PDF
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">{price}</p>
                  <p className="text-sm text-muted-foreground">por mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagamento via PIX</CardTitle>
              <CardDescription>
                Faça o pagamento e ative seu plano premium instantaneamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="text-xl font-bold">{price}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Chave PIX</p>
                    <div className="flex gap-2">
                      <Input
                        value={pixKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(pixKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{ownerName}</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Como funciona:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Copie a chave PIX acima</li>
                    <li>Faça o pagamento de {price}</li>
                    <li>Cole o comprovante ou ID da transação abaixo</li>
                    <li>Seu premium será ativado automaticamente</li>
                  </ol>
                </div>

                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proof">
                      Comprovante ou ID da Transação
                    </Label>
                    <Input
                      id="proof"
                      placeholder="Cole aqui o ID ou comprovante"
                      value={paymentProof}
                      onChange={(e) => setPaymentProof(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole o código de transação ou qualquer identificador do pagamento
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || !paymentProof}
                  >
                    {submitting ? "Ativando..." : "Ativar Premium"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Premium;
