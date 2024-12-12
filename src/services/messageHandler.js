import whatsappService from './whatsappService.js';
class MessageHandler {
  async handleIncomingMessage(message) {
    const cleanPhoneNumber = (number) => {return number.startsWith('521') ? number.replace("521", "52") : number; }
        
    if (message?.type === 'text') {
      const response = `Echo: ${message.text.body}`;
      await whatsappService.sendMessage(cleanPhoneNumber(message.from), response, message.id);
      await whatsappService.markAsRead(message.id);
    }
  }
}
export default new MessageHandler();