import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Bell, Shield, Palette, Clock, Upload, Settings as SettingsIcon } from 'lucide-react';
import UserManagementDialog from '@/components/UserManagementDialog';
import TwoFactorVerification from '@/components/TwoFactorVerification';
import NotificationManager from '@/components/NotificationManager';
import FileUploadManager from '@/components/FileUploadManager';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { userProfile } = useAuth();
  const { settings, loading, enableTwoFactor, disableTwoFactor, updateSessionTimeout, updateEmailNotifications, updatePushNotifications } = useUserSettings();
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  
  useSessionTimeout();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header moderno */}
        <div className="mb-8 animate-slide-up">
          <div className="bg-gradient-to-r from-[#26387b] to-[#1d76b2] rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
            <div className="relative z-10">
              <h1 className="text-3xl lg:text-4xl font-bold animate-slide-up">Configurações</h1>
              <p className="text-white/90 text-lg animate-fade-in mt-2">Gerencie as configurações do sistema</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className={`grid w-full ${userProfile?.role === 'admin' ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Arquivos
            </TabsTrigger>
            {userProfile?.role === 'admin' && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aparência */}
              <Card className="card-interactive animate-bounce-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <span>Aparência</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-all-smooth">
                    <div className="space-y-1">
                      <Label htmlFor="dark-mode" className="text-base font-medium cursor-pointer">
                        Modo Escuro
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Alternar entre tema claro e escuro
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configurações de Sistema */}
              <Card className="card-interactive animate-bounce-in" style={{animationDelay: '0.1s'}}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span>Sistema</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-all-smooth">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Configurações Gerais</Label>
                      <p className="text-sm text-muted-foreground">
                        Configurações básicas do sistema
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span>Configurações de Segurança</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-all-smooth">
                  <div className="space-y-1">
                    <Label htmlFor="two-factor" className="text-base font-medium cursor-pointer">
                      Autenticação de Dois Fatores
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Adicionar uma camada extra de segurança à sua conta
                    </p>
                  </div>
                  <Switch 
                    id="two-factor" 
                    checked={settings?.two_factor_enabled || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTwoFactorDialogOpen(true);
                      } else {
                        disableTwoFactor();
                      }
                    }}
                    disabled={loading}
                    className="data-[state=checked]:bg-primary" 
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-all-smooth">
                  <div className="space-y-1">
                    <Label htmlFor="session-timeout" className="text-base font-medium cursor-pointer">
                      Timeout de Sessão
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Tempo para desconectar automaticamente após inatividade
                    </p>
                  </div>
                  <Select 
                    value={settings?.session_timeout_minutes?.toString() || '30'}
                    onValueChange={(value) => updateSessionTimeout(parseInt(value))}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="240">4 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Dicas de Segurança</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ative a autenticação de dois fatores para maior segurança</li>
                    <li>• Use senhas fortes e únicas</li>
                    <li>• Configure um timeout de sessão adequado ao seu uso</li>
                    <li>• Mantenha seus dados de login sempre atualizados</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <span>Configurações de Notificações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-all-smooth">
                  <div className="space-y-1">
                    <Label htmlFor="email-notifications" className="text-base font-medium cursor-pointer">
                      Notificações por Email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações importantes por email
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={settings?.email_notifications || false}
                    onCheckedChange={updateEmailNotifications}
                    disabled={loading}
                    className="data-[state=checked]:bg-primary" 
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-all-smooth">
                  <div className="space-y-1">
                    <Label htmlFor="push-notifications" className="text-base font-medium cursor-pointer">
                      Notificações Push
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações no navegador
                    </p>
                  </div>
                  <Switch 
                    id="push-notifications" 
                    checked={settings?.push_notifications || false}
                    onCheckedChange={updatePushNotifications}
                    disabled={loading}
                    className="data-[state=checked]:bg-primary" 
                  />
                </div>
              </CardContent>
            </Card>
            
            <NotificationManager />
          </TabsContent>

          <TabsContent value="files" className="space-y-6 mt-6">
            <FileUploadManager />
          </TabsContent>

          {userProfile?.role === 'admin' && (
            <TabsContent value="users" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span>Gerenciamento de Usuários</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserManagementDialog />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <TwoFactorVerification
        open={twoFactorDialogOpen}
        onOpenChange={setTwoFactorDialogOpen}
        onVerified={() => enableTwoFactor()}
      />
    </div>
  );
};

export default Settings;
