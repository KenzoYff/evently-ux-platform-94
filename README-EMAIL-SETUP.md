# Configuração de Envio de E-mails

## Problema Atual
O sistema está salvando os e-mails na coleção `email_queue` do Firestore, mas não está enviando os e-mails realmente. Para resolver isso, você precisa configurar uma Cloud Function no Firebase.

## Soluções Possíveis

### 1. Cloud Function com Nodemailer (Recomendado)
Use o arquivo `firebase-cloud-function-example.js` como base para criar uma Cloud Function que processa a fila de e-mails.

**Passos:**
1. Instale Firebase CLI: `npm install -g firebase-tools`
2. Inicialize Functions: `firebase init functions`
3. Copie o código do exemplo para `functions/index.js`
4. Configure as credenciais: 
   ```bash
   firebase functions:config:set email.user="seu-email@gmail.com"
   firebase functions:config:set email.password="sua-senha-de-app"
   ```
5. Deploy: `firebase deploy --only functions`

### 2. Serviço de E-mail Externo
Use serviços como:
- SendGrid
- Mailgun
- Amazon SES
- Resend

### 3. Extensão do Firebase
Instale a extensão "Trigger Email" do Firebase Extensions que processa automaticamente documentos do Firestore.

## Status Atual
- ✅ E-mails são criados na coleção `email_queue`
- ✅ Código 2FA é gerado e salvo
- ❌ E-mails não são enviados fisicamente
- ✅ Ícone de orçamento agora está verde

## Verificação
Para verificar se está funcionando:
1. Verifique a coleção `email_queue` no Firestore
2. Os documentos devem aparecer lá quando você solicitar códigos
3. Configure uma Cloud Function para processar esses documentos