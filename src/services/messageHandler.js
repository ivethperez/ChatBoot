import whatsappService from './whatsappService.js';
class MessageHandler {
    async handleIncomingMessage(message, senderInfo) {
        const cleanPhoneNumber = (number) => { return number.startsWith('521') ? number.replace("521", "52") : number; }

        if (message?.type === 'text') {
            const incomingMessage = message.text.body.toLowerCase().trim();

            if (this.isGreeting(incomingMessage)) {
                await this.sendWelcomeMessage(cleanPhoneNumber(message.from), message.id, senderInfo);
            }
            else {
                const response = `Echo: ${message.text.body}`;
                await whatsappService.sendMessage(cleanPhoneNumber(message.from), response, message.id);
            }

            await whatsappService.markAsRead(message.id);
        }
    }
    isGreeting(message) {
        const greetings = ["hola", "hello", "hi", "buenas tardes"];
        return greetings.includes(message);
    }
    getSenderName(senderInfo) {
        return senderInfo.profile?.name || senderInfo.wa_id;
    }
    async sendWelcomeMessage(to, messageId, senderInfo) {
        const name = this.getSenderName(senderInfo).match(/^(\w+)/)?.[1];// || "Rombo"; para cuando no hay nombre mas que emogis
        const welcomeMessage = `Hola ${name}, Bienvenido a MEDPET, Tu tienda de mascotas en línea. ¿En qué puedo ayudarte hoy?`;
        await whatsappService.sendMessage(to, welcomeMessage, messageId);
    }



}
export default new MessageHandler();