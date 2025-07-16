import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirebaseNotifications } from '@/hooks/useFirebaseNotifications';
import { Bell, BellOff, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const NotificationManager: React.FC = () => {
  const {
    permission,
    requestNotificationPermission,
    sendNotification,
    sendEmailNotification,
    loading,
    isSupported
  } = useFirebaseNotifications();

  const [testNotification, setTestNotification] = useState(false);

  const handleEnableNotifications = async () => {
    const success = await requestNotificationPermission();
    if (success) {
      toast.success('Notificações push habilitadas!');
    }
  };

  const handleTestPushNotification = async () => {
    setTestNotification(true);
    await sendNotification(
      'Notificação de Teste',
      'Esta é uma notificação de teste do sistema Eventos Tecnolog!'
    );
    setTestNotification(false);
  };

  const handleTestEmailNotification = async () => {
    await sendEmailNotification(
      'Email de Teste',
      'Este é um email de teste da Tecnolog!'
    );
  };

  return (
    <div className="space-y-6">
      {/* Status das Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Status das Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>Notificações Push</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
                {permission === 'granted' ? 'Habilitadas' : 
                 permission === 'denied' ? 'Negadas' : 'Não solicitadas'}
              </Badge>
              {permission !== 'granted' && (
                <Button 
                  onClick={handleEnableNotifications}
                  size="sm"
                  disabled={!isSupported}
                >
                  Habilitar
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Notificações por Email</span>
            </div>
            <Badge variant="default">Habilitadas</Badge>
          </div>

          {!isSupported && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Notificações push não são suportadas neste navegador ou ambiente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testes de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Testar Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleTestPushNotification}
              disabled={permission !== 'granted' || testNotification}
              variant="outline"
            >
              <Bell className="h-4 w-4 mr-2" />
              {testNotification ? 'Enviando...' : 'Testar Push'}
            </Button>
            
            <Button 
              onClick={handleTestEmailNotification}
              variant="outline"
              disabled={loading}
            >
              <Mail className="h-4 w-4 mr-2" />
              {loading ? 'Enviando...' : 'Testar Email'}
            </Button>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Use os botões acima para testar se as notificações estão funcionando corretamente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Configurar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-semibold">Notificações Push:</h4>
            <p className="text-sm text-muted-foreground">
              1. Clique em "Habilitar" para notificações push<br/>
              2. Permita notificações quando o navegador solicitar<br/>
              3. Você receberá notificações mesmo com o site fechado
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Notificações por Email:</h4>
            <p className="text-sm text-muted-foreground">
              1. As notificações por email são enviadas automaticamente<br/>
              2. Verifique sua caixa de entrada e spam<br/>
              3. Configure na seção "Notificações" para desabilitar se desejar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManager;