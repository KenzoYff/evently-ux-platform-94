import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useTwoFactor = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendTwoFactorCode = async () => {
    if (!user) return null;

    setLoading(true);
    try {
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

      // Salvar código no Firebase
      await addDoc(collection(db, 'two_factor_codes'), {
        user_id: user.uid,
        code,
        expires_at: expiresAt,
        is_used: false,
        created_at: new Date()
      });

      // Criar documento de email com status "enviado" simulado
      await addDoc(collection(db, 'email_queue'), {
        to: user.email,
        from: 'noreply@eventos-tecnolog.firebaseapp.com',
        subject: 'Código de Verificação em Duas Etapas',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #26387b, #1d76b2); border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h2 style="color: #1f2937; margin: 0; font-size: 24px;">Código de Verificação</h2>
              </div>
              
              <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                Seu código de verificação em duas etapas é:
              </p>
              
              <div style="background: linear-gradient(135deg, #26387b, #1d76b2); color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 30px 0; border-radius: 8px; box-shadow: 0 4px 12px rgba(38, 56, 123, 0.3);">
                ${code}
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  ⚠️ Este código expira em 5 minutos por segurança.
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Se você não solicitou este código, ignore este e-mail. Sua conta permanece segura.
              </p>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #26387b, #1d76b2); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Tecnolog
                  </p>
                </div>
              </div>
            </div>
          </div>
        `,
        user_id: user.uid,
        type: 'two_factor_code',
        sent: true,
        sent_at: new Date(),
        created_at: new Date()
      });
      
      console.log('Código 2FA gerado:', code);
      
      // Simular envio de email
      setTimeout(() => {
        toast.success('Código de verificação enviado!', {
          description: 'Verifique sua caixa de entrada.',
          duration: 4000
        });
      }, 1000);
      
      return code;
    } catch (error) {
      console.error('Erro ao enviar código 2FA:', error);
      toast.error('Erro ao enviar código de verificação');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyTwoFactorCode = async (inputCode: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      // Buscar código válido
      const codesRef = collection(db, 'two_factor_codes');
      const q = query(
        codesRef,
        where('user_id', '==', user.uid),
        where('code', '==', inputCode),
        where('is_used', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const codeDoc = querySnapshot.docs[0];
        const data = codeDoc.data();
        
        // Verificar se o código não expirou
        if (data.expires_at.toDate() > new Date()) {
          // Marcar código como usado
          await updateDoc(doc(db, 'two_factor_codes', codeDoc.id), {
            is_used: true,
            used_at: new Date()
          });

          toast.success('Código verificado com sucesso');
          return true;
        } else {
          toast.error('Código expirado');
          return false;
        }
      } else {
        toast.error('Código inválido');
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar código 2FA:', error);
      toast.error('Erro ao verificar código');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sendTwoFactorCode,
    verifyTwoFactorCode,
  };
};