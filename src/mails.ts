import config from "config";
import nodemailer, { Transporter } from "nodemailer"
import { Message, NotificationTransport } from "./types/notification-types";

export class MailTransport implements NotificationTransport {
    private transporter: Transporter
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.get("mail.host"),
            port: config.get("mail.port"),
            secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
            auth: {
                user: config.get("mail.auth.user"),
                pass: config.get("mail.auth.pass"),
            },
        });
    }
    async send(message: Message): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: config.get("mail.from"),
                to: message.to, 
                subject: message.subject,
                text: message.text,
                html: message.html
            });

            console.log("Message sent: %s", info.messageId);
            // Preview URL is only available when using an Ethereal test account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        } catch (err) {
            console.error("Error while sending mail:", err);
        }
    }
}
// const generateTestCreds =  async () =>{
//     const testAccount = await nodemailer.createTestAccount();
//     console.log(" Test creds ", testAccount)
// }

// generateTestCreds()

//private test
// const mailer = new MailTransport();
// //@ts-ignore
// mailer.send({})