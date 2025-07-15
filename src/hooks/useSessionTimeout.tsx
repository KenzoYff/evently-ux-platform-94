import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSettings } from './useUserSettings';
import { toast } from 'sonner';

export const useSessionTimeout = () => {
  const { user, logout } = useAuth();
  const { settings } = useUserSettings();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    if (user && settings?.session_timeout_minutes) {
      const timeoutMs = settings.session_timeout_minutes * 60 * 1000;
      const warningMs = timeoutMs - 2 * 60 * 1000; // 2 minutos antes

      // Aviso 2 minutos antes do timeout
      warningRef.current = setTimeout(() => {
        toast.warning('Sua sessão expirará em 2 minutos. Clique em qualquer lugar para renovar.');
      }, warningMs);

      // Timeout da sessão
      timeoutRef.current = setTimeout(() => {
        toast.error('Sessão expirada. Você será desconectado.');
        logout();
      }, timeoutMs);
    }
  };

  useEffect(() => {
    if (user && settings) {
      resetTimeout();

      // Eventos que resetam o timeout
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      const resetHandler = () => {
        resetTimeout();
      };

      events.forEach(event => {
        document.addEventListener(event, resetHandler, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetHandler, true);
        });
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (warningRef.current) {
          clearTimeout(warningRef.current);
        }
      };
    }
  }, [user, settings, logout]);

  return { resetTimeout };
};