import { toast } from "@/hooks/use-toast";

interface BBConfig {
  clientId: string;
  clientSecret: string;
  devAppKey: string;
  baseUrl: string;
}

interface PixChargeRequest {
  valor: string;
  chave: string;
  solicitacaoPagador?: string;
}

interface PixChargeResponse {
  txid: string;
  calendario: {
    expiracao: number;
  };
  valor: {
    original: string;
  };
  chave: string;
  qrcode: string;
  imagemQrcode: string;
}

class BBPixService {
  private config: BBConfig;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_BB_CLIENT_ID,
      clientSecret: import.meta.env.VITE_BB_CLIENT_SECRET,
      devAppKey: import.meta.env.VITE_BB_DEV_APP_KEY,
      baseUrl: import.meta.env.VITE_BB_BASE_URL || 'https://api.hm.bb.com.br'
    };
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'pix.cob pix.cob.read'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao obter access token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Erro getAccessToken:', error);
      throw error;
    }
  }

  async createPixCharge(valor: string, userId: string): Promise<PixChargeResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      // Gera txid único
      const txid = `PREMIUM${userId.slice(0,8)}${Date.now()}`;
      
      const chargeData: PixChargeRequest = {
        valor: valor,
        chave: "sua_chave_pix_bb", // Sua chave PIX no BB
        solicitacaoPagador: `Assinatura Premium - ${userId}`
      };

      const response = await fetch(
        `${this.config.baseUrl}/pix/v2/cob/${txid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-Application-Key': this.config.devAppKey
          },
          body: JSON.stringify(chargeData)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao criar cobrança: ${errorText}`);
      }

      const data: PixChargeResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erro createPixCharge:', error);
      throw error;
    }
  }

  async getPixChargeStatus(txid: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.config.baseUrl}/pix/v2/cob/${txid}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Application-Key': this.config.devAppKey
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao consultar cobrança');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro getPixChargeStatus:', error);
      throw error;
    }
  }
}

export const bbPixService = new BBPixService();