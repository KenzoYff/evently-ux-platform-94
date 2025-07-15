import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserSettings {
  id?: string;
  user_id: string;
  two_factor_enabled: boolean;
  session_timeout_minutes: number;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const docRef = doc(db, 'user_settings', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSettings(docSnap.data() as UserSettings);
      } else {
        // Criar configurações padrão se não existirem
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!user) return;

    try {
      const defaultSettings: UserSettings = {
        user_id: user.uid,
        two_factor_enabled: false,
        session_timeout_minutes: 30,
        email_notifications: true,
        push_notifications: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const docRef = doc(db, 'user_settings', user.uid);
      await setDoc(docRef, defaultSettings);
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Erro ao criar configurações padrão:', error);
      toast.error('Erro ao criar configurações padrão');
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!user) return;

    try {
      const docRef = doc(db, 'user_settings', user.uid);
      await updateDoc(docRef, { 
        [key]: value,
        updated_at: new Date().toISOString()
      });

      setSettings(prev => prev ? { ...prev, [key]: value } : null);
      toast.success('Configuração atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast.error('Erro ao atualizar configuração');
    }
  };

  const enableTwoFactor = async () => {
    await updateSetting('two_factor_enabled', true);
  };

  const disableTwoFactor = async () => {
    await updateSetting('two_factor_enabled', false);
  };

  const updateSessionTimeout = async (minutes: number) => {
    await updateSetting('session_timeout_minutes', minutes);
  };

  const updateEmailNotifications = async (enabled: boolean) => {
    await updateSetting('email_notifications', enabled);
  };

  const updatePushNotifications = async (enabled: boolean) => {
    await updateSetting('push_notifications', enabled);
  };

  return {
    settings,
    loading,
    enableTwoFactor,
    disableTwoFactor,
    updateSessionTimeout,
    updateEmailNotifications,
    updatePushNotifications,
    refreshSettings: fetchSettings,
  };
};