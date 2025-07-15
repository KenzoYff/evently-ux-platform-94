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

      // Criar documento de email para ser processado por Cloud Function
      await addDoc(collection(db, 'email_queue'), {
        to: user.email,
        subject: 'Código de Verificação em Duas Etapas',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #26387b;">Código de Verificação</h2>
            <p>Seu código de verificação em duas etapas é:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">${code}</div>
            <p>Este código expira em 5 minutos.</p>
            <p>Se você não solicitou este código, ignore este e-mail.</p>
          </div>
        `,
        user_id: user.uid,
        type: 'two_factor_code',
        created_at: new Date()
      });
      
      console.log('Código 2FA gerado e email enfileirado:', code);
      toast.success('Código salvo no Firebase. Configure Cloud Function para enviar e-mails! Código temp: ' + code);
      
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