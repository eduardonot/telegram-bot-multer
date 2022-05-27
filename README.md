# TELEGRAM UPLOAD BOT

### Objetivo
  Este projeto faz integração com o Bot API do Telegram. O objetivo deste é prover um compartilhamento único de arquivos de maneira anônima entre usuários do Telegram, precisando apenas de um link ou hash que pode ser compartilhado em diversos outros meios.
  
 ### Funcionalidades
  Uma vez que configurado, o usuário poderá enviar arquivos de imagem, vídeo ou documentos para seu Bot e determinará se o armazenamento será Local* ou em Nuvem (AWS S3).
   Após feito o envio do arquivo, um hash será gerado e o Bot pedirá confirmação do usuário a respeito do compartilhamento deste via hash ou link. Uma vez que compartilhado e baixado, será impossível baixar o arquivo novamente a menos que o upload seja refeito. 
   O usuário que realizou o upload receberá uma notificação de que o arquivo foi baixado. O link de compartilhamento não funcionará mais.

 * Será preciso criar o diretório tmp
