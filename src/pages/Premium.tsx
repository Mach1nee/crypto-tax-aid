import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, ArrowLeft, Copy, RefreshCw, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bbPixService } from "@/services/bbPixService";

const Premium = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creatingCharge, setCreatingCharge] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [pixCharge, setPixCharge] = useState<any>(null);

  const price = "20.00";

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
      
      // Verificar se há cobrança PIX pendente
      if (subData?.plan_type !== 'premium') {
        const { data: pendingCharge } = await supabase
          .from('pix_charges')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (pendingCharge) {
          setPixCharge(pendingCharge);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const createPixCharge = async () => {
    if (!user) return;
    
    setCreatingCharge(true);
    try {
      const chargeData = await bbPixService.createPixCharge(price, user.id);
      
      // Salvar no banco
      const { data: savedCharge, error } = await supabase
        .from('pix_charges')
        .insert({
          user_id: user.id,
          txid: chargeData.txid,
          valor: parseFloat(chargeData.valor.original),
          qr_code: chargeData.qrcode,
          imagem_qrcode: chargeData.imagemQrcode,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setPixCharge(savedCharge);
      
      toast({
        title: "QR Code gerado!",
        description: "Escaneie o QR Code para pagar",
      });

    } catch (error: any) {
      console.error('Erro ao criar cobrança:', error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar QR Code",
        description: error.message || "Tente novamente mais tarde",
      });
    } finally {
      setCreatingCharge(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!pixCharge) return;
    
    setCheckingPayment(true);
    try {
      const status = await bbPixService.getPixChargeStatus(pixCharge.txid);
      
      if (status.status === 'CONCLUIDA') {
        // Atualizar status no banco
        await supabase
          .from('pix_charges')
          .update({ status: 'paid' })
          .eq('txid', pixCharge.txid);

        // Ativar premium
        const { error } = await supabase
          .from("subscriptions")
          .update({
            plan_type: "premium",
            status: "active",
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            txid: pixCharge.txid,
          })
          .eq("user_id", user.id);

        if (error) throw error;

        setSubscription({ ...subscription, plan_type: 'premium' });
        
        toast({
          title: "Premium ativado!",
          description: "Seu plano premium foi ativado com sucesso.",
        });
      } else {
        toast({
          title: "Pagamento pendente",
          description: "O pagamento ainda não foi confirmado",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao verificar pagamento",
        description: error.message,
      });
    } finally {
      setCheckingPayment(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "QR Code copiado para a área de transferência",
    });
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
                🎉 Promoção Especial - De R$30/mês Por Apenas R$ {price}/mês
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
                  <p className="text-2xl font-bold text-primary">R$ {price}</p>
                  <p className="text-sm text-muted-foreground">por mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagamento via PIX</CardTitle>
              <CardDescription>
                Gere um QR Code dinâmico e pague pelo app do seu banco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!pixCharge ? (
                <div className="text-center space-y-4">
                  <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Clique no botão abaixo para gerar um QR Code PIX
                  </p>
                  <Button
                    onClick={createPixCharge}
                    disabled={creatingCharge}
                    className="w-full"
                  >
                    {creatingCharge ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Gerando QR Code...
                      </>
                    ) : (
                      "Gerar QR Code PIX"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="text-2xl font-bold">R$ {price}</p>
                    </div>

                    {pixCharge.imagem_qrcode ? (
                      <div className="flex justify-center">
                        <img 
                          src={pixCharge.imagem_qrcode} 
                          alt="QR Code PIX" 
                          className="w-64 h-64 border-2 border-gray-300 rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-lg flex justify-center">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">
                            QR Code (copie o código abaixo)
                          </p>
                          <div className="flex gap-2">
                            <Input
                              value={pixCharge.qr_code}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => copyToClipboard(pixCharge.qr_code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        ID da Transação: {pixCharge.txid}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Como pagar:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Abra o app do seu banco</li>
                      <li>Escaneie o QR Code ou copie o código PIX</li>
                      <li>Confirme o pagamento de R$ {price}</li>
                      <li>Clique em "Verificar Pagamento" abaixo</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={checkPaymentStatus}
                      disabled={checkingPayment}
                      className="w-full"
                    >
                      {checkingPayment ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Verificar Pagamento"
                      )}
                    </Button>
                    
                    <Button
                      onClick={createPixCharge}
                      variant="outline"
                      disabled={creatingCharge}
                      className="w-full"
                    >
                      Gerar Novo QR Code
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Premium;