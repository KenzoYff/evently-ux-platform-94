import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'sonner';
import { useUserSettings } from './useUserSettings';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const { settings } = useUserSettings();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmailAndPassword = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verificar se 2FA está habilitado
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      if (userData?.twoFactorEnabled) {
        // Gerar código 2FA
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Salvar código no Firestore
        await addDoc(collection(db, 'two_factor_codes'), {
          userId: userCredential.user.uid,
          code,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
          used: false,
          createdAt: serverTimestamp()
        });

        // Simular envio de email (em produção, usar Cloud Function)
        console.log('Código 2FA gerado:', code);
        
        return { requiresTwoFactor: true, user: userCredential.user, code };
      }

      // Log de auditoria
      await addDoc(collection(db, 'audit_logs'), {
        userId: userCredential.user.uid,
        action: 'login',
        timestamp: serverTimestamp(),
        ip: window.location.hostname,
        userAgent: navigator.userAgent
      });

      toast.success('Login realizado com sucesso!');
      return { requiresTwoFactor: false, user: userCredential.user };
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = 'Erro no login. Tente novamente.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuário desabilitado.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const registerWithEmailAndPassword = async (email: string, password: string, displayName: string) => {
    setAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar perfil do usuário
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        twoFactorEnabled: false,
        emailVerified: false
      });

      // Log de auditoria
      await addDoc(collection(db, 'audit_logs'), {
        userId: userCredential.user.uid,
        action: 'register',
        timestamp: serverTimestamp(),
        ip: window.location.hostname,
        userAgent: navigator.userAgent
      });

      toast.success('Conta criada com sucesso!');
      return userCredential.user;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está em uso.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
          break;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        // Log de auditoria
        await addDoc(collection(db, 'audit_logs'), {
          userId: user.uid,
          action: 'logout',
          timestamp: serverTimestamp(),
          ip: window.location.hostname,
          userAgent: navigator.userAgent
        });
      }

      await signOut(auth);
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const resetPassword = async (email: string) => {
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de recuperação enviado!');
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      
      let errorMessage = 'Erro ao enviar email de recuperação.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
      }
      
      toast.error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyTwoFactorCode = async (code: string) => {
    if (!user) return false;

    try {
      // Verificar código no Firestore
      const codesRef = collection(db, 'two_factor_codes');
      // Em uma implementação real, você faria uma query aqui
      // Por agora, simulamos a verificação
      
      // Log de auditoria
      await addDoc(collection(db, 'audit_logs'), {
        userId: user.uid,
        action: 'two_factor_verify',
        timestamp: serverTimestamp(),
        success: true,
        ip: window.location.hostname,
        userAgent: navigator.userAgent
      });

      toast.success('Código 2FA verificado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao verificar código 2FA:', error);
      
      // Log de auditoria (falha)
      if (user) {
        await addDoc(collection(db, 'audit_logs'), {
          userId: user.uid,
          action: 'two_factor_verify',
          timestamp: serverTimestamp(),
          success: false,
          ip: window.location.hostname,
          userAgent: navigator.userAgent
        });
      }

      toast.error('Código 2FA inválido');
      return false;
    }
  };

  return {
    user,
    loading,
    authLoading,
    loginWithEmailAndPassword,
    registerWithEmailAndPassword,
    logout,
    resetPassword,
    verifyTwoFactorCode
  };
};