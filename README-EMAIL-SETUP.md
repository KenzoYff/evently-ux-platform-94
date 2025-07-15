# Configuração do Sistema de Email - Eventos Tecnológicos

## Problema Atual
O sistema de duas etapas e notificações por email não está funcionando porque os emails não estão sendo enviados. O código atual salva os emails no Firestore, mas não há Cloud Functions configuradas para processá-los.

## ✅ Correções Implementadas
- Email remetente configurado: `noreply@eventos-tecnolog.firebaseapp.com`  
- Design dos emails melhorado com ícones verdes (não transparentes)
- HTML responsivo e profissional
- Templates atualizados para ambos os sistemas

## 🚀 Solução: Configurar Firebase Cloud Functions

### 1. Pré-requisitos
- Projeto Firebase com Firestore ativo
- Domínio: eventos-tecnolog.firebaseapp.com
- Email configurado: noreply@eventos-tecnolog.firebaseapp.com

### 2. Configuração do Firebase Functions

#### Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

#### Inicializar Functions no projeto
```bash
firebase init functions
```

#### Instalar dependências
```bash
cd functions
npm install nodemailer
```

#### Copiar o código
Copie o código do arquivo `public/firebase-cloud-function-example.js` para `functions/index.js`

### 3. Configurar Credenciais de Email

#### Opção 1: Gmail App Password (Recomendado)
1. Crie uma conta Gmail para noreply@eventos-tecnolog.firebaseapp.com
2. Ative a autenticação em duas etapas
3. Gere um App Password específico
4. Configure no Firebase:
```bash
firebase functions:config:set email.user="noreply@eventos-tecnolog.firebaseapp.com"
firebase functions:config:set email.password="app-password-gerado"
```

#### Opção 2: SMTP Customizado
Configure um servidor SMTP customizado para o domínio eventos-tecnolog.firebaseapp.com

### 4. Deploy
```bash
firebase deploy --only functions
```

### 5. Testar
Após o deploy, teste o sistema de duas etapas. Os emails devem ser enviados automaticamente.

## 📤 Sistema de Upload - Como Usar

### ✅ O sistema de upload já está funcionando!

O hook `useFirebaseStorage` já está configurado e pronto para uso. Funcionalidades:

#### Recursos Disponíveis:
- Upload de arquivos únicos ou múltiplos
- Tipos suportados: JPG, PNG, GIF, PDF, TXT
- Tamanho máximo: 10MB por arquivo
- Organização automática por usuário
- Exclusão de arquivos
- Listagem de arquivos do usuário

#### Como usar em componentes:
```jsx
import { useFirebaseStorage } from '@/hooks/useFirebaseStorage';

function MeuComponente() {
  const { uploadFile, uploading, progress, deleteFile, listUserFiles } = useFirebaseStorage();

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    const result = await uploadFile(file, 'documentos'); // pasta personalizada
    
    if (result) {
      console.log('Arquivo enviado:', result.url);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      {uploading && <p>Enviando... {progress}%</p>}
    </div>
  );
}
```

#### Estrutura de Pastas no Storage:
```
/uploads/
  /{userId}/
    /timestamp-arquivo.jpg
/documentos/
  /{userId}/
    /timestamp-documento.pdf
```

## ✅ Status Final
- ✅ Email remetente: noreply@eventos-tecnolog.firebaseapp.com
- ✅ Design verde com ícones não transparentes
- ✅ HTML responsivo e profissional
- ✅ Códigos 2FA com expiração de 5 minutos
- ✅ Sistema de upload totalmente funcional
- ⚠️ Configurar Cloud Functions para envio de emails

## 🔧 Problemas Comuns
1. **Função não disparando**: Verifique se o Firestore está ativo
2. **Email não enviando**: Verifique credenciais do Gmail
3. **Erro de autenticação**: Use App Password, não senha normal
4. **Domínio não reconhecido**: Configure SPF/DKIM para o domínio
5. **Upload falha**: Verifique se o Firebase Storage está ativo