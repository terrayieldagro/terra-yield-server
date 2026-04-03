import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendContactEmail(dto: ContactDto) {
    try {
      await this.transporter.sendMail({
        from: `"${dto.fullName}" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: dto.email,
        subject: dto.subject,
        html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background-color: #f5f8f2;">
            
            <!-- Header -->
            <div style="background-color: #2d6a35; padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Terra Yield</h1>
            <p style="color: #7ab648; margin: 6px 0 0; font-size: 13px; letter-spacing: 1px;">New Contact Message</p>
            </div>

            <!-- Gold divider -->
            <div style="height: 4px; background: linear-gradient(to right, #2d6a35, #c8972a, #2d6a35);"></div>

            <!-- Body -->
            <div style="padding: 40px; background-color: #ffffff;">
            <p style="color: #6b7b6b; font-size: 13px; margin: 0 0 24px; text-transform: uppercase; letter-spacing: 1px;">You have received a new message</p>

            <!-- Sender Info -->
            <div style="background-color: #f5f8f2; border-left: 4px solid #c8972a; padding: 20px 24px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px;"><span style="color: #6b7b6b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">From</span></p>
                <p style="margin: 0; color: #141f14; font-size: 18px; font-weight: bold;">${dto.fullName}</p>
                <p style="margin: 4px 0 0;"><a href="mailto:${dto.email}" style="color: #2d6a35; font-size: 14px; text-decoration: none;">${dto.email}</a></p>
            </div>

            <!-- Subject -->
            <div style="margin-bottom: 24px;">
                <p style="margin: 0 0 6px; color: #6b7b6b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Subject</p>
                <p style="margin: 0; color: #141f14; font-size: 16px; font-weight: bold;">${dto.subject}</p>
            </div>

            <!-- Divider -->
            <div style="height: 1px; background-color: #e8f0e8; margin-bottom: 24px;"></div>

            <!-- Message -->
            <div style="margin-bottom: 32px;">
                <p style="margin: 0 0 12px; color: #6b7b6b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                <p style="margin: 0; color: #3b4a3b; font-size: 15px; line-height: 1.8;">${dto.message}</p>
            </div>

            <!-- Reply CTA -->
            <div style="text-align: center;">
                <a href="mailto:${dto.email}?subject=Re: ${dto.subject}" 
                style="display: inline-block; background-color: #2d6a35; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                Reply to ${dto.fullName}
                </a>
            </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #141f14; padding: 24px 40px; text-align: center;">
            <p style="color: #6b7b6b; font-size: 12px; margin: 0; letter-spacing: 1px;">TERRA YIELD AGRO INVESTMENT</p>
            <p style="color: #3b4a3b; font-size: 11px; margin: 8px 0 0;">This message was sent via the Terra Yield contact form</p>
            </div>

        </div>
        `,
      });

      return { message: 'Message sent successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to send message');
    }
  }
}
