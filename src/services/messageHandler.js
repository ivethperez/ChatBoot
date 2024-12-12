import whatsappService from './whatsappService.js';
class MessageHandler {
    async handleIncomingMessage(message, senderInfo) {
        const cleanPhoneNumber = (number) => { return number.startsWith('521') ? number.replace("521", "52") : number; }

        if (message?.type === 'text') {
            const incomingMessage = message.text.body.toLowerCase().trim();

            if (this.isGreeting(incomingMessage)) {
                await this.sendWelcomeMessage(cleanPhoneNumber(message.from), message.id, senderInfo);
                await this.sendWelcomeMenu(cleanPhoneNumber(message.from));
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
        const welcomeMessage = `Hola ${name}, *¡Bienvenido a Korat Oriental Food!* 🍜✨
Sumérgete en un viaje culinario único donde los sabores de Oriente cobran vida en cada plato. Ya sea que anheles un clásico pad thai, unos rollitos primavera crujientes o un ramen lleno de sabor, estamos aquí para ofrecerte una experiencia gastronómica inolvidable.
Siéntete como en casa y prepárate para disfrutar de la frescura, la autenticidad y la pasión que ponemos en cada bocado. ¡Gracias por elegir Korat Oriental Food!🥢🌸`;
        await whatsappService.sendMessage(to, welcomeMessage, messageId);
    }

    async sendWelcomeMenu(to) {
        const menuMessage = "Elige una Opción"
        const buttons = [
          {
            type: 'reply', reply: { id: 'option_1', title: 'Agendar' }
          },
          {
            type: 'reply', reply: { id: 'option_2', title: 'Consultar'}
          },
          {
            type: 'reply', reply: { id: 'option_3', title: 'Ubicación'}
          }
        ];
    
        await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
      }
    

}
export default new MessageHandler();