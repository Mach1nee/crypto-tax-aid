import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap, FileText, ArrowRight, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <header className="border-b border-border/50 backdrop-blur sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">CryptoTax</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate("/auth")} variant="ghost">
                Entrar
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center space-y-8">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Simplifique seus{" "}
              <span className="gradient-text">impostos de cripto</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conecte suas carteiras e exchanges. Geramos relatórios automáticos para sua declaração de imposto de renda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gap-2 text-lg px-8 h-12"
            >
              Começar Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/premium")}
              className="gap-2 text-lg px-8 h-12"
            >
              <Crown className="h-5 w-5" />
              Ver Plano Premium
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-8">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              <span>100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Cálculo Automático</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Relatórios Completos</span>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-border/50 hover:border-primary/50 transition-all card-glow">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Conecte Suas Carteiras</h3>
                <p className="text-muted-foreground">
                  Integre facilmente suas carteiras MetaMask, Trust, Binance e outras exchanges populares.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all card-glow">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Cálculo Automático</h3>
                <p className="text-muted-foreground">
                  Nossa IA calcula automaticamente os impostos devidos sobre suas transações cripto.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-primary/50 transition-all card-glow">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Relatórios Prontos</h3>
                <p className="text-muted-foreground">
                  Gere relatórios completos e prontos para anexar na sua declaração de IR.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 card-glow">
            <CardContent className="p-12 text-center space-y-6">
              <Crown className="h-16 w-16 text-primary mx-auto" />
              <h3 className="text-3xl font-bold">
                Promoção Especial - Apenas R$ 10/mês
              </h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Acesse relatórios ilimitados, cálculos automáticos e suporte prioritário com nosso plano premium.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gap-2"
              >
                Começar com Premium
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 CryptoTax. Simplifique seus impostos de criptomoedas.</p>
          <p>Feito com ❤️ no Brasil.</p>
          <p>By: Santos</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
