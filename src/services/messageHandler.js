import whatsappService from './whatsappService.js';

class MessageHandler {

  constructor() {
    this.appointmentState = {};
    this.assistandState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    const cleanPhoneNumber = (number) => { return number.startsWith('521') ? number.replace("521", "52") : number; }

    // console.log(message?.type);
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim();
      // console.log(incomingMessage);
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
        await this.sendMenuPrincipal(cleanPhoneNumber(message.from));
      }

      await whatsappService.markAsRead(message.id);
    }
    else if (message?.type === 'image') {
      await this.mesaggeExit(cleanPhoneNumber(message.from));
    }
    else if (message?.type === 'interactive') {
      const option = message?.interactive?.button_reply?.id;
      const optionlist = message?.interactive?.list_reply?.id;
      if (optionlist !== undefined) {
        await this.handleMenuOption(cleanPhoneNumber(message.from), optionlist);
      }
      if (option !== undefined) {
        await this.handleMenuOption(cleanPhoneNumber(message.from), option);
      }
      await whatsappService.markAsRead(message.id);
    }
  }
  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas tardes", "holi", "buenos días", "buenas noches", "quiero ordenar a domicilio o para recoger", "menu", "ubicación"];
    return greetings.includes(message);
  }
  isResponseTransfer(message) {
    const responseTransfer = ["transferencia", "solicita los datos para transferir", "tarjeta de crédito"];
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
    const menuMessage = "¿Deseas ordenar o volver al menú principal ? 🥢✨"
    const buttons = [
      {
        type: 'reply', reply: { id: 'option_10', title: 'Ordenar' }
      },
      {
        type: 'reply', reply: { id: 'option_11', title: 'Menú principal' }
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

  async sendMenuPrincipal(to) {
    const menuMessage = "Te mostramos nuestro menú de opciones:"
    const sections = [
      {
        title: '¿Cómo podemos ayudarte?',
        rows: [
          { id: 'option_16', title: 'Ordenar', description: '' },
          {
            id: 'option_3', title: 'Promociones vigentes', description: 'Promoción cumpleaños, promoción semanal,cupón de descuento'
          },
          {
            id: 'option_4', title: 'Ver menú', description: 'Promocion cumpleaños'
          }, {
            id: 'option_5', title: 'Horarios de atención', description: 'Te compartimos nuestros horarios'
          },
          { id: 'option_6', title: 'Ubicación', description: 'Te compartimos nuestra ubicaión, visitanos en...' },
          {
            id: 'option_7', title: 'Servicio a domicilio', description: 'Contamos con servicio a domicilio, selecciona para ver más información'
          },
          {
            id: 'option_8', title: 'Preguntas frecuentes', description: '¿Te podemos ayudar con otra duda?'
          },
          {
            id: 'option_9', title: 'Contacto', description: 'Para dudas especificas o aclaraciones, ¡contactanos!'
          }
        ]

      }
    ];
    await whatsappService.sendtolistMessage(to, menuMessage, sections);
  }
  async handleMenuOption(to, option) {
    switch (option) {
      // ----------------------Bienvenida --------------------
      case 'option_1':
        await whatsappService.sendMessage(to, "🎉Te regalamos el siguiente código de descuento para tu primera compra: *KORAT1*");
        await this.sendMenuPrincipal(to);
        break;
      case 'option_2':
        await this.sendMenuPrincipal(to);
        break

      // ----------------------Menú principal --------------------
      case 'option_3':
        await this.sendMedia(to, option);
        await this.sendForMenuOrOrder(to);
        break
      case 'option_4':
        await this.sendMedia(to, option);
        await this.sendForMenuOrOrder(to);
        break
      case 'option_5':
        await whatsappService.sendMessageWithURL(to, 'https://www.google.com/search?sa=X&sca_esv=6c31e4139d9f0bec&rlz=1C1ALOY_esMX973MX974&sxsrf=ADLYWILFsq443HdAmORvt66tR_NZ51Qk4Q:1735586099631&q=korat+cocina+oriental+horario&ludocid=3964308768138710697&ved=2ahUKEwjrg8iHmtCKAxW-QjABHZ2sFLcQ6BN6BAhMEBg&biw=1280&bih=593&dpr=1.5#loh=true');
        await this.sendForMenuOrOrder(to);
        break
      case 'option_6':
        await this.sendLocation(to);
        await this.sendForMenuOrOrder(to);
        break
      case 'option_7':
        await this.messageServiceDom(to);
        await this.sendForMenuOrOrder(to);
        break
      case 'option_8':
        await this.sendMenuPreguntasFrecuentes(to);
        await this.sendForMenuOrOrder(to);
        break
      case 'option_9':
        await this.sendContact(to);
        await this.sendForMenuOrOrder(to);
        break

      // ---------------Volver ---------------------------------------
      case 'option_10':
        await this.mesaggeOrder(to);
        break

      case 'option_11':
        await this.sendMenuPrincipal(to);
        break
      // ---------------Preguntas frecuentes---------------------------


      case 'option_12':
        await this.sendForMenuOrOrder(to);
        break

      case 'option_13':
        await this.sendLocation(to);
        await this.sendForMenuOrOrder(to);
        break

      case 'option_14':
        await this.sendForMenuOrOrder(to);
        break

      case 'option_15':
        await whatsappService.sendMessage(to, `-Servicio a domicilio únicamente tenemos pagos con efectivo y transferencia. -Compras para llevar o en restaurante contamos con terminal aceptamos todas las tarjetas`);
        await this.sendForMenuOrOrder(to);
        break

      case 'option_16':
        await this.mesaggeOrder(to);
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
      case 'option_3':
        mediaUrl = 'https://snacksleier.com/ImagenesKorat/15.jpg';
        caption = 'promoción semanal';
        type = 'image';
        break
      case 'option_4':
        mediaUrl = 'https://snacksleier.com/ImagenesKorat/MenúKorat.pdf';
        caption = 'Nuestro menú';
        type = 'document';
        break;

      default:
        await whatsappService.sendMessage(to, "Lo siento, no entendí tu selección");
    }

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
  async sendMenuPreguntasFrecuentes(to) {
    const menuMessage = "Preguntas frecuentes:"
    const sections = [
      {
        title: 'Preguntas',
        rows: [
          {
            id: 'option_12', title: '¿Realizan reservaciones?', description: 'Sí ,Selecciona para reservar'
          },
          {
            id: 'option_13', title: '¿Área para mascotas?', description: 'Si ,fuera del restaurante contamos con área para mascotas'
          }, {
            id: 'option_14', title: 'Tiempo de entrega', description: 'De 30 a 45minutos'
          },
          { id: 'option_15', title: 'Metodos de pago', description: 'Selecciona para ver más información' }
        ]

      }
    ];
    await whatsappService.sendlistMessage(to, menuMessage, sections);
  }
  async mesaggeExit(to) {
    await whatsappService.sendMessage(to, "Tu pedido ha sido confirmado.🎊");
  }
  async mesaggeOrder(to) {
    await whatsappService.sendMessageWithURL(to, 'Crea tu pedio en el siguiente link y regresa para continuar... https://koratcocinaoriental.ola.click/products');
  }
  async messageServiceDom(to) {
    await whatsappService.sendMessage(to, `Si contamos con el servicio , es un costo adicional dependiendo la distancia del restaurante a su Domicilio ! 
- [ ] Tarifa de envíos 
🚨$40 de 0 a 3 km
🚨$50 de 3.1 a 5 km
🚨$60 de 5.1 a 7km
🚨$70 de 7.1 a 9 km
🚨$80 de 9.1 a 11 km
🚨$10 por km extra despues de los 11
`);
  }
}
export default new MessageHandler();