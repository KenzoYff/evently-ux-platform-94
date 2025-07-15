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
        to: targetEmail,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #26387b;">${title}</h2>
            <p>${body}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Esta é uma notificação automática do sistema de eventos.</p>
          </div>
        `,
        user_id: user.uid,
        type: 'notification',
        created_at: new Date()
      });
      
      console.log('Email notification queued:', { title, body, targetEmail });
      
      toast.success('Notificação por email enviada!');
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação por email:', error);
      toast.error('Erro ao enviar notificação por email');
      return false;
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
    requestNotificationPermission,
    sendNotification,
    sendEmailNotification,
    getNotifications,
    isSupported: messaging !== null
  };
};