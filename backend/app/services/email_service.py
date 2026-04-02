from typing import List, Optional
from config import settings
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class EmailService:
    """Email service using SendGrid or SMTP"""
    
    @staticmethod
    async def send_appointment_reminder(
        recipient_email: str,
        recipient_name: str,
        appointment_title: str,
        appointment_time: str,
        provider_name: str
    ):
        """Send appointment reminder email"""
        
        subject = f"Appointment Reminder: {appointment_title}"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2>Appointment Reminder</h2>
                <p>Hi {recipient_name},</p>
                <p>This is a reminder about your upcoming appointment:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Title:</strong> {appointment_title}</p>
                    <p><strong>Time:</strong> {appointment_time}</p>
                    <p><strong>Provider:</strong> {provider_name}</p>
                </div>
                <p>Please log in to ALERA to confirm or reschedule if needed.</p>
                <p>If you have any questions, contact our support team.</p>
                <hr>
                <p style="font-size: 12px; color: #999;">ALERA Healthcare Platform</p>
            </body>
        </html>
        """
        
        await EmailService._send_email(recipient_email, subject, html_body)
    
    
    @staticmethod
    async def send_prescription_notification(
        recipient_email: str,
        recipient_name: str,
        medication_name: str,
        provider_name: str
    ):
        """Send prescription created notification"""
        
        subject = f"New Prescription: {medication_name}"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2>New Prescription</h2>
                <p>Hi {recipient_name},</p>
                <p>You have received a new prescription from {provider_name}:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Medication:</strong> {medication_name}</p>
                    <p><strong>Prescribed by:</strong> {provider_name}</p>
                </div>
                <p>Log in to ALERA to view full prescription details and arrange pickup at your pharmacy.</p>
                <p>Questions? Contact {provider_name} or our support team.</p>
                <hr>
                <p style="font-size: 12px; color: #999;">ALERA Healthcare Platform</p>
            </body>
        </html>
        """
        
        await EmailService._send_email(recipient_email, subject, html_body)
    
    
    @staticmethod
    async def send_allergy_alert(
        recipient_email: str,
        recipient_name: str,
        allergen: str,
        severity: str
    ):
        """Send allergy alert notification"""
        
        subject = f"Alert: Allergy Recorded - {allergen}"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2>Allergy Alert</h2>
                <p>Hi {recipient_name},</p>
                <p>A new allergy has been recorded in your ALERA profile:</p>
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <p><strong>Allergen:</strong> {allergen.upper()}</p>
                    <p><strong>Severity:</strong> {severity}</p>
                </div>
                <p><strong>Important:</strong> Please verify this information is correct. Allergies are critical for your safety.</p>
                <p>Log in to ALERA to review or edit this allergy record.</p>
                <hr>
                <p style="font-size: 12px; color: #999;">ALERA Healthcare Platform</p>
            </body>
        </html>
        """
        
        await EmailService._send_email(recipient_email, subject, html_body)
    
    
    @staticmethod
    async def send_password_reset(
        recipient_email: str,
        recipient_name: str,
        reset_link: str
    ):
        """Send password reset email"""
        
        subject = "ALERA - Reset Your Password"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Hi {recipient_name},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="{reset_link}" style="background-color: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #0ea5e9;">{reset_link}</p>
                <p><strong>Note:</strong> This link expires in 24 hours.</p>
                <p>If you didn't request a password reset, please ignore this email or contact support.</p>
                <hr>
                <p style="font-size: 12px; color: #999;">ALERA Healthcare Platform</p>
            </body>
        </html>
        """
        
        await EmailService._send_email(recipient_email, subject, html_body)
    
    
    @staticmethod
    async def send_verification_email(
        recipient_email: str,
        recipient_name: str,
        verification_link: str
    ):
        """Send email verification link"""
        
        subject = "ALERA - Verify Your Email"
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2>Welcome to ALERA!</h2>
                <p>Hi {recipient_name},</p>
                <p>Thank you for signing up. Please verify your email address to complete your registration:</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="{verification_link}" style="background-color: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                </div>
                <p>Or copy and paste this link:</p>
                <p style="word-break: break-all; color: #0ea5e9;">{verification_link}</p>
                <p>Welcome to the ALERA healthcare platform. Your health, our priority.</p>
                <hr>
                <p style="font-size: 12px; color: #999;">ALERA Healthcare Platform</p>
            </body>
        </html>
        """
        
        await EmailService._send_email(recipient_email, subject, html_body)
    
    
    @staticmethod
    async def _send_email(recipient_email: str, subject: str, html_body: str):
        """Internal method to send email via SendGrid or SMTP"""
        
        try:
            if settings.SENDGRID_API_KEY:
                # Use SendGrid API
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail
                
                message = Mail(
                    from_email=settings.SENDGRID_FROM_EMAIL,
                    to_emails=recipient_email,
                    subject=subject,
                    html_content=html_body
                )
                
                sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
                await sg.send(message)
            else:
                # Fallback to SMTP (for development)
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = settings.SENDGRID_FROM_EMAIL
                msg["To"] = recipient_email
                msg.attach(MIMEText(html_body, "html"))
                
                # In production, configure SMTP server
                # This is just a placeholder
                if settings.DEBUG:
                    print(f"[DEV] Email to {recipient_email}: {subject}")
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            # Log error but don't fail request
            pass
