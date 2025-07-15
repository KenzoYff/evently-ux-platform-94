// Cloud Function para processar e-mails - Sistema de Eventos Tecnológicos
// Para usar, você precisa:
// 1. Configurar Firebase Cloud Functions: npm install -g firebase-tools
// 2. Instalar nodemailer: npm install nodemailer
// 3. Configurar credenciais de e-mail nos secrets do Firebase
// 4. Configurar o remetente padrão como noreply@eventos-tecnolog.firebaseapp.com

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configurar transporter para usar o domínio do Firebase
const transporter = nodemailer.createTransporter({
  service: 'gmail', // ou configure SMTP customizado
  auth: {
    user: functions.config().email.user || 'noreply@eventos-tecnolog.firebaseapp.com',
    pass: functions.config().email.password
  }
});

// Cloud Function para processar fila de e-mails
exports.processEmailQueue = functions.firestore
  .document('email_queue/{emailId}')
  .onCreate(async (snap, context) => {
    const emailData = snap.data();
    const emailId = context.params.emailId;
    
    try {
      // Configurar e-mail
      const mailOptions = {
        from: emailData.from || 'noreply@eventos-tecnolog.firebaseapp.com',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        replyTo: 'noreply@eventos-tecnolog.firebaseapp.com'
      };

      // Enviar e-mail
      await transporter.sendMail(mailOptions);
      
      // Marcar como enviado
      await snap.ref.update({
        sent: true,
        sent_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('E-mail enviado com sucesso:', emailId);
      
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      
      // Marcar como erro
      await snap.ref.update({
        error: error.message,
        failed_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// Para configurar:
// 1. Instalar dependências: npm install nodemailer
// 2. Configurar credenciais:
// firebase functions:config:set email.user="noreply@eventos-tecnolog.firebaseapp.com"
// firebase functions:config:set email.password="sua-senha-de-app-gmail"
// 3. Deploy: firebase deploy --only functions
// 
// IMPORTANTE: Configure um App Password no Gmail para noreply@eventos-tecnolog.firebaseapp.com
// Ou configure um serviço SMTP customizado para o domínio eventos-tecnolog.firebaseapp.com