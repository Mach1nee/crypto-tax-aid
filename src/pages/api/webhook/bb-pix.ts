// src/services/bbPixWebhook.ts
import { supabase } from "@/integrations/supabase/client";

export interface BBWebhookData {
  pix: Array<{
    txid: string;
    valor: string;
    chave: string;
    horario: string;
    infoPagador?: string;
  }>;
}

export async function handleBBWebhook(webhookData: BBWebhookData) {
  try {
    // Verificar se é uma notificação PIX
    if (webhookData.pix) {
      for (const pix of webhookData.pix) {
        const txid = pix.txid;
        
        console.log('Processando webhook PIX:', txid);

        // Buscar a cobrança no banco
        const { data: charge, error: chargeError } = await supabase
          .from('pix_charges')
          .select('*')
          .eq('txid', txid)
          .single();

        if (chargeError || !charge) {
          console.error('Cobrança não encontrada:', txid);
          continue;
        }

        // Verificar se já foi processada
        if (charge.status === 'paid') {
          console.log('Cobrança já processada:', txid);
          continue;
        }

        // Atualizar status da cobrança
        const { error: updateChargeError } = await supabase
          .from('pix_charges')
          .update({ 
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('txid', txid);

        if (updateChargeError) {
          console.error('Erro ao atualizar cobrança:', updateChargeError);
          continue;
        }

        // Ativar premium do usuário
        const { error: updateSubError } = await supabase
          .from('subscriptions')
          .update({
            plan_type: 'premium',
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            txid: txid
          })
          .eq('user_id', charge.user_id);

        if (updateSubError) {
          console.error('Erro ao ativar premium:', updateSubError);
        } else {
          console.log(`✅ Premium ativado para usuário: ${charge.user_id}`);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Erro no webhook:', error);
    throw error;
  }
}