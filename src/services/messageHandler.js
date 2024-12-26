import whatsappService from './whatsappService.js';

class MessageHandler {

  constructor() {
    this.appointmentState = {};
    this.assistandState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    const cleanPhoneNumber = (number) => { return number.startsWith('521') ? number.replace("521", "52") : number; }

    console.log(message?.type);
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();
      console.log(incomingMessage);
      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(cleanPhoneNumber(message.from), message.id, senderInfo);
        await this.sendWelcomeMenu(cleanPhoneNumber(message.from));
      }
      else if (this.isResponseTransfer(incomingMessage)) {
        await this.sendMedia(cleanPhoneNumber(message.from), 'option_0');
      }
      else if (this.isResponseCash(incomingMessage)) {
        await this.mesaggeExit(cleanPhoneNumber(message.from));
      }
      else {
        await this.sendWelcomeMessage(cleanPhoneNumber(message.from), message.id, senderInfo);
        await this.sendOtherOption(cleanPhoneNumber(message.from));
      }

      await whatsappService.markAsRead(message.id);
    }
    else if (message?.type === 'image') {
      await this.mesaggeExit(cleanPhoneNumber(message.from));
    }
    else if (message?.type === 'interactive') {
      const option = message?.interactive?.button_reply?.id;
      await this.handleMenuOption(cleanPhoneNumber(message.from), option);
      await whatsappService.markAsRead(message.id);
    }
  }
  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas tardes", "holi", "buenos días", "buenas noches", "quiero ordenar a domicilio o para recoger", "menu", "ubicación"];
    return greetings.includes(message);
  }
  isResponseTransfer(message) {
    const responseTransfer = ["transferencia", "solicita los datos para transferir","tarjeta de crédito"];
    return responseTransfer.every(x => message.includes(x.toLowerCase()));
  }
  isResponseCash(message) {
    const responseCash = ["efectivo", "vuelto"];
    return responseCash.every(x => message.includes(x.toLowerCase()));
  }
  getSenderName(senderInfo) {
    return senderInfo.profile?.name || senderInfo.wa_id;
  }
  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo).match(/^(\w+)/)?.[1];// || "Rombo"; para cuando no hay nombre mas que emogis
    const welcomeMessage = `Hola ${name}, *¡Bienvenid@ a Korat Oriental Food!* 🍜✨
Korat no es solo un restaurante; es una puerta a nuevos mundos culinarios. Cada bocado te lleva a un viaje por distintas regiones de Asia, gracias a su selección de platillos que destacan por su autenticidad y calidad.
¡Gracias por elegirnos!🥢🫰🏼`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "¿Es la primera vez que realizas un pedido con nosotros? 🥢✨"
    const buttons = [
      {
        type: 'reply', reply: { id: 'option_1', title: 'Si' }
      },
      {
        type: 'reply', reply: { id: 'option_2', title: 'No' }
      }
    ];
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  async sendForMenuOrOrder(to) {
    const menuMessage = "¿Deseas ordenar o ? 🥢✨"
    const buttons = [
      {
        type: 'reply', reply: { id: 'option_3', title: 'Ordenar' }
      },
      {
        type: 'reply', reply: { id: 'option_4', title: 'Ver menú' }
      }
    ];
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }
  async sendForOrder(to) {
    const menuMessage = "¿Deseas ordenar ahora? 🥢✨"
    const buttons = [
      {
        type: 'reply', reply: { id: 'option_5', title: 'Sí' }
      },
      {
        type: 'reply', reply: { id: 'option_6', title: 'No' }
      }
    ];
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }
  async sendOtherOption(to) {
    const menuMessage = "Aquí tienes algunas opciones que pueden interesarte:"
    const buttons = [
      {
        type: 'reply', reply: { id: 'option_7', title: 'Ordenar' }
      },
      {
        type: 'reply', reply: { id: 'option_8', title: 'Ubicación' }
      },
      {
        type: 'reply', reply: { id: 'option_9', title: 'Contacto' }
      }
    ];
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }
  async handleMenuOption(to, option) {
    switch (option) {
      case 'option_1':
        await whatsappService.sendMessage(to, "🎉Te regalamos el siguiente código de descuento para tu primera compra: *KORAT1*");
        // await this.sendMedia(to, option);
        await this.sendForOrder(to);
        break;
      case 'option_2':
        await this.sendOtherOption(to);
        // await this.mesaggeOrder(to);
        break
      case 'option_3':
        await this.mesaggeOrder(to);
        break
      case 'option_4':
        await this.sendMedia(to, option);
        await this.sendForOrder(to);
        break
      case 'option_5':
        await this.mesaggeOrder(to);
        break
      case 'option_6':
        await this.sendOtherOption(to);
        break
      case 'option_7':
        await this.mesaggeOrder(to);
        break
      case 'option_8':
        await this.sendLocation(to);
        await this.sendForOrder(to);
        break
      case 'option_9':
        await this.sendContact(to);
        await this.sendForOrder(to);
        break
    
      default:
        await whatsappService.sendMessage(to, "Lo siento, no entendí tu selección, Por Favor, elige una de las opciones del menú.");
    }
  }

  async sendMedia(to, option) {
    let mediaUrl;
    let caption;
    let type;
    switch (option) {
      case 'option_1':
        mediaUrl = 'https://drive.google.com/file/d/1oOJ-EXISLlyVWGJT4npmUhiCxggud-tC/view?usp=sharing';
        caption = 'Nuestro menú';
        type = 'document';
        break;
      case 'option_0':
        mediaUrl = 'https://storage.googleapis.com/headers-appio/pages/small_bua_37ac3fe3fa/small_bua_37ac3fe3fa.jpg';
        caption = 'Realiza la transferencia al siguiente número de tarjeta y compartenos tu comprobante';
        type = 'image';
        break
      default:
        await whatsappService.sendMessage(to, "Lo siento, no entendí tu selección, Por Favor, elige una de las opciones del menú.");
    }
    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';
    // const caption = 'Bienvenida';
    // const type = 'audio';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';
    // const caption = '¡Esto es una Imagen!';
    // const type = 'image';

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
    // const caption = '¡Esto es una video!';
    // const type = 'video';



    await whatsappService.sendMediaMessage(to, type, mediaUrl, caption);
  }
  async sendContact(to) {
    const contact = {
      addresses: [
        {
          street: "Av. Kohunlich Sm 045 Lt , Plaza Tucanes",
          city: "Cancún",
          state: "Q.R",
          zip: "77506",
          country: "México",
          country_code: "PA",
          type: "WORK"
        }
      ],
      emails: [
        {
          email: "Korat.orientalfood@gmail.com",
          type: "WORK"
        }
      ],
      name: {
        formatted_name: "Korat Contacto",
        first_name: "Korat",
        last_name: "Contacto",
        middle_name: "",
        suffix: "",
        prefix: ""
      },
      org: {
        company: "Korat",
        department: "Atención al Cliente",
        title: "Representante"
      },
      phones: [
        {
          phone: "+1234567890",
          wa_id: "1234567890",
          type: "WORK"
        }
      ],
      urls: [
        {
          url: "https://www.koratcocinaoriental.com/",
          type: "WORK"
        }
      ]
    };

    await whatsappService.sendContactMessage(to, contact);
  }
  async sendLocation(to) {
    const latitude = 21.147654693861647;
    const longitude = -86.84941866308826;
    const name = 'Korat Cocina Oriental';
    const address = 'Plaza Tucanes, Av. Kohunlich Sm 045 Lt , Plaza Tucanes, Cancún, Konhulich Supermanzana 45, 77506 México, Q.R.'

    await whatsappService.sendLocationMessage(to, latitude, longitude, name, address);
  }
  async mesaggeExit(to) {
    await whatsappService.sendMessage(to, "Tu pedido ha sido confirmado.🎊");
  }
  async mesaggeOrder(to) {
    await whatsappService.sendMessageWithURL(to, 'Ve nuestro menú y crea tu pedio en el siguiente link y regresa para continuar... https://koratcocinaoriental.ola.click/products');
  }

}
export default new MessageHandler();