
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, User, Mail, Building, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const Profile: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    department: userProfile?.department || '',
    position: userProfile?.position || ''
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userProfile) {
      console.log('No file selected or no user profile');
      return;
    }

    console.log('Starting image upload:', file.name, file.size);

    // Validar tipo e tamanho do arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      setUploading(true);
      console.log('Creating storage reference...');
      
      // Criar referência no Firebase Storage com um nome único
      const timestamp = Date.now();
      const imageRef = ref(storage, `profile-pictures/${userProfile.uid}/${timestamp}_${file.name}`);
      
      console.log('Uploading file to:', `profile-pictures/${userProfile.uid}/${timestamp}_${file.name}`);
      
      // Upload do arquivo
      const snapshot = await uploadBytes(imageRef, file);
      console.log('File uploaded successfully:', snapshot);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);
      
      // Atualizar perfil do usuário
      await updateUserProfile({ photoURL: downloadURL });
      
      toast.success('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Erro detalhado no upload:', error);
      toast.error('Erro ao fazer upload da foto. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({
        displayName: formData.displayName,
        department: formData.department,
        position: formData.position
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header moderno */}
        <div className="mb-8 animate-slide-up">
          <div className="bg-gradient-to-r from-[#26387b] to-[#1d76b2] rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
            <div className="relative z-10">
              <h1 className="text-3xl lg:text-4xl font-bold animate-slide-up">Meu Perfil</h1>
              <p className="text-white/90 text-lg animate-fade-in mt-2">Gerencie suas informações pessoais e configurações</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Foto de Perfil - Design moderno */}
          <Card className="lg:col-span-1 card-interactive animate-bounce-in">
            <CardHeader className="text-center">
              <CardTitle className="text-xl flex items-center gap-3 justify-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                Foto de Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 lg:w-40 lg:h-40 ring-4 ring-primary/20 ring-offset-4 ring-offset-background transition-all-smooth group-hover:ring-primary/40">
                  <AvatarImage 
                    src={userProfile?.photoURL} 
                    alt="Foto do perfil" 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl lg:text-4xl bg-gradient-to-br from-[#26387b] to-[#1d76b2] text-white">
                    {userProfile?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="photo-upload" 
                  className="absolute bottom-2 right-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-3 cursor-pointer transition-all-smooth hover:scale-110 shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={uploading}
                className="button-modern flex items-center space-x-2 w-full"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Carregando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Alterar Foto</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Informações Pessoais - Design melhorado */}
          <Card className="lg:col-span-2 card-interactive animate-bounce-in" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="displayName" className="flex items-center space-x-2 text-base font-medium">
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                      <User className="w-3 h-3 text-blue-500" />
                    </div>
                    <span>Nome Completo</span>
                  </Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="h-12 transition-all-smooth focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="flex items-center space-x-2 text-base font-medium">
                    <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center">
                      <Mail className="w-3 h-3 text-green-500" />
                    </div>
                    <span>Email</span>
                  </Label>
                  <Input
                    id="email"
                    value={userProfile?.email || ''}
                    disabled
                    className="h-12 bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="department" className="flex items-center space-x-2 text-base font-medium">
                    <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center">
                      <Building className="w-3 h-3 text-purple-500" />
                    </div>
                    <span>Departamento</span>
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Seu departamento"
                    className="h-12 transition-all-smooth focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="position" className="flex items-center space-x-2 text-base font-medium">
                    <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center">
                      <Briefcase className="w-3 h-3 text-orange-500" />
                    </div>
                    <span>Cargo</span>
                  </Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Seu cargo"
                    className="h-12 transition-all-smooth focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleSaveProfile} 
                  className="w-full bg-gradient-to-r from-[#26387b] to-[#1d76b2] text-white hover:from-[#1d2b63] hover:to-[#155a8f] button-modern h-12"
                >
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
