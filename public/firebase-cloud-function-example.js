// Este arquivo é um exemplo de Cloud Function para processar e-mails
// Para usar, você precisa:
// 1. Configurar Firebase Cloud Functions
// 2. Instalar nodemailer ou outro serviço de e-mail
// 3. Configurar credenciais de e-mail nos secrets do Firebase

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configurar transporter (exemplo com Gmail)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
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
        from: functions.config().email.user,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
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
// firebase functions:config:set email.user="seu-email@gmail.com"
// firebase functions:config:set email.password="sua-senha-de-app"
// firebase deploy --only functions