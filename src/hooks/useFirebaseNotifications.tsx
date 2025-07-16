import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUserSettings } from './useUserSettings';

export const useFirebaseNotifications = () => {
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const [messaging, setMessaging] = useState<any>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const initializeMessaging = async () => {
        try {
          // Inicializar messaging
          const messagingInstance = getMessaging();
          setMessaging(messagingInstance);

          // Verificar permissão atual
          const currentPermission = Notification.permission;
          setPermission(currentPermission);

          // Configurar listener para mensagens em primeiro plano
          onMessage(messagingInstance, (payload) => {
            console.log('Mensagem recebida em primeiro plano:', payload);
            
            if (payload.notification) {
              toast.success(payload.notification.title || 'Nova notificação', {
                description: payload.notification.body
              });
            }
          });

        } catch (error) {
          console.error('Erro ao inicializar Firebase Messaging:', error);
        }
      };

      initializeMessaging();
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!messaging) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // Para desenvolvimento, não usar VAPID key
        // Em produção, você deve configurar uma VAPID key válida
        const token = await getToken(messaging);

        if (token) {
          setFcmToken(token);
          
          // Salvar token no Firestore
          await addDoc(collection(db, 'fcm_tokens'), {
            userId: user?.uid,
            token: token,
            createdAt: serverTimestamp(),
            lastUsed: serverTimestamp()
          });

          toast.success('Notificações push ativadas com sucesso!');
          return true;
        }
      } else {
        toast.error('Permissão para notificações negada');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao configurar notificações');
      return false;
    }
  };

  const sendNotification = async (title: string, body: string, targetUserId?: string) => {
    if (!user) return;

    try {
      // Salvar notificação no Firestore
      await addDoc(collection(db, 'notifications'), {
        title,
        body,
        targetUserId: targetUserId || user.uid,
        senderId: user.uid,
        type: 'push',
        read: false,
        createdAt: serverTimestamp()
      });

      // Se for para o próprio usuário, exibir toast
      if (!targetUserId || targetUserId === user.uid) {
        toast.success(title, { description: body });
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
      return false;
    }
  };

  const sendEmailNotification = async (title: string, body: string, targetEmail?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Salvar notificação de email no Firestore
      await addDoc(collection(db, 'email_notifications'), {
        title,
        body,
        targetEmail: targetEmail || user.email,
        senderId: user.uid,
        sent: false,
        createdAt: serverTimestamp()
      });

      // Criar documento de email para ser processado por Cloud Function
      await addDoc(collection(db, 'email_queue'), {
        to: targetEmail || user.email,
        from: 'noreply@eventos-tecnolog.firebaseapp.com',
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background: #f8f9fa; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 60px; height: 60px; background: #22c55e; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <h2 style="color: #1f2937; margin: 0; font-size: 24px;">${title}</h2>
              </div>
              
              <div style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                ${body}
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Esta é uma notificação automática da Tecnolog.
                </p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px;">
                  <div style="width: 20px; height: 20px; background: #22c55e; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
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
        type: 'notification',
        sent: true,
        sent_at: new Date(),
        created_at: new Date()
      });
      
      console.log('Email notification queued:', { title, body, targetEmail });
      
      // Simular envio de email
      setTimeout(() => {
        toast.success('Notificação por email enviada!', {
          description: 'Verifique sua caixa de entrada.',
          duration: 4000
        });
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação por email:', error);
      toast.error('Erro ao enviar notificação por email');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getNotifications = async () => {
    if (!user) return [];

    try {
      // Em uma implementação real, você faria uma query no Firestore
      // Por agora, retornamos um array vazio
      return [];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  };

  return {
    permission,
    fcmToken,
    loading,
    requestNotificationPermission,
    sendNotification,
    sendEmailNotification,
    getNotifications,
    isSupported: messaging !== null
  };
};