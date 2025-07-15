# 📤 Tutorial de Upload - Sistema de Eventos Tecnológicos

## ✅ Sistema de Upload Funcionando!

O sistema de upload **já está totalmente funcional** e pode ser usado de várias formas. Veja como:

## 🚀 Como Usar o Upload

### 1. Através das Configurações (Recomendado)
1. Faça login na aplicação
2. Clique em **"Configurações"** no menu
3. Vá para a aba **"Arquivos"**
4. Você verá a interface completa de upload com:
   - Área de arrastar e soltar
   - Botão para selecionar arquivos
   - Lista de arquivos enviados
   - Opções para deletar arquivos

### 2. Através de Eventos (Documentos)
1. Crie ou edite um evento
2. Clique em **"Documentos"** no evento
3. Use a área de upload para adicionar documentos relacionados ao evento

### 3. Através do Profile (Foto de Perfil)
1. Vá para o **"Profile"**
2. Clique no ícone de câmera na foto de perfil
3. Selecione uma nova imagem

## 📁 Tipos de Arquivos Suportados

### ✅ Arquivos Aceitos:
- **Imagens**: JPG, PNG, GIF
- **Documentos**: PDF, TXT
- **Tamanho máximo**: 10MB por arquivo

### ❌ Arquivos Rejeitados:
- Arquivos executáveis (.exe, .zip, .rar)
- Vídeos (.mp4, .avi, .mov)
- Arquivos muito grandes (>10MB)

## 🔧 Funcionalidades Disponíveis

### Upload Simples
```javascript
// Código usado internamente
const { uploadFile, uploading, progress } = useFirebaseStorage();

const handleUpload = async (file) => {
  const result = await uploadFile(file, 'minha-pasta');
  console.log('Arquivo enviado:', result.url);
};
```

### Upload Múltiplo
```javascript
const { uploadMultipleFiles } = useFirebaseStorage();

const handleMultipleUpload = async (files) => {
  const results = await uploadMultipleFiles(files, 'documentos');
  console.log('Arquivos enviados:', results);
};
```

### Deletar Arquivos
```javascript
const { deleteFile } = useFirebaseStorage();

const handleDelete = async (filePath) => {
  const success = await deleteFile(filePath);
  if (success) {
    console.log('Arquivo deletado!');
  }
};
```

## 📂 Organização dos Arquivos

### Estrutura no Firebase Storage:
```
/uploads/
  /{user-id}/
    /1705593600000-documento.pdf
    /1705593700000-imagem.jpg

/events/
  /{event-id}/
    /documents/
      /1705593800000-relatorio.pdf

/profile-pictures/
  /{user-id}/
    /1705593900000-perfil.jpg
```

## 🎯 Exemplo Prático

### Para Upload de Documentos:
1. Vá para **Configurações > Arquivos**
2. Arraste um arquivo PDF para a área de upload
3. Aguarde o upload (verá o progresso)
4. O arquivo aparecerá na lista abaixo
5. Clique no ícone de lixeira para deletar se necessário

### Para Upload em Eventos:
1. Abra um evento
2. Clique em **"Documentos"**
3. Clique em **"Clique para enviar um documento"**
4. Selecione o arquivo
5. O documento ficará vinculado ao evento

## 🔍 Verificação de Funcionamento

### Se o upload não estiver funcionando:
1. **Verifique se está logado** - O upload só funciona para usuários autenticados
2. **Confirme o tamanho do arquivo** - Máximo 10MB
3. **Verifique o tipo do arquivo** - Apenas JPG, PNG, GIF, PDF, TXT
4. **Confira o console do navegador** - Pressione F12 para ver erros
5. **Verifique sua conexão com a internet**

## 📱 Recursos Adicionais

### Validações Automáticas:
- ✅ Verificação de tipo de arquivo
- ✅ Verificação de tamanho
- ✅ Verificação de autenticação
- ✅ Nomes únicos com timestamp
- ✅ Organização por usuário

### Feedback Visual:
- ✅ Barra de progresso durante upload
- ✅ Mensagens de sucesso/erro
- ✅ Lista de arquivos enviados
- ✅ Informações do arquivo (tamanho, data)

## 💡 Dicas Importantes

1. **Sempre verifique se está logado** antes de tentar fazer upload
2. **Use nomes de arquivo descritivos** para facilitar organização
3. **Mantenha arquivos organizados** usando as pastas apropriadas
4. **Teste com arquivos pequenos** primeiro (< 1MB)
5. **Verifique o Firebase Storage** se configurado corretamente

## 🆘 Solução de Problemas

### Se aparecer erro de "Usuário não autenticado":
- Faça logout e login novamente
- Verifique se o Firebase Auth está funcionando

### Se o upload falhar:
- Verifique sua conexão com a internet
- Tente com um arquivo menor
- Verifique se o Firebase Storage está configurado

### Se não conseguir deletar arquivos:
- Verifique se você é o proprietário do arquivo
- Confirme se tem permissões adequadas

---

**🎉 O sistema de upload está 100% funcional e pronto para uso!**