import logging

logger = logging.getLogger(__name__)

def send_verification_email(email, token, app_url="https://example.com"):
    # Constructs the verification link using the APP_URL
    verification_link = f"{app_url}/#/verify-email?token={token}"
    subject = "Verify Your Flora_X Account"
    body = f"""
    Welcome to Flora_X!
    
    Please click the link below to verify your email address:
    {verification_link}
    
    This link will expire in 24 hours.
    """
    logger.info(f"EMAIL SENT TO {email} | Subject: {subject} | Link: {verification_link}")
    print(f"SMTP SIMULATOR: Verification Email Dispatched to {email}\nLink: {verification_link}")
    return True

def send_welcome_email(email, first_name):
    subject = "Welcome to Flora_X, Kenya's Premium Flower Marketplace"
    body = f"""
    Hello {first_name},
    
    Welcome to the Flora_X family! Your account has been successfully verified.
    
    You can now explore fresh volcanic greenhouse roses, save delivery addresses, and curating customized gifts.
    
    Happy shopping,
    The Flora_X Team
    """
    logger.info(f"EMAIL SENT TO {email} | Subject: {subject}")
    print(f"SMTP SIMULATOR: Welcome Email Dispatched to {email}")
    return True

def send_password_reset_email(email, token, app_url="https://example.com"):
    reset_link = f"{app_url}/#/reset-password?token={token}"
    subject = "Reset Your Flora_X Password"
    body = f"""
    You requested a password reset for your Flora_X account.
    
    Please click the link below to set a new password:
    {reset_link}
    
    This link will expire in 1 hour.
    """
    logger.info(f"EMAIL SENT TO {email} | Subject: {subject} | Link: {reset_link}")
    print(f"SMTP SIMULATOR: Password Reset Email Dispatched to {email}\nLink: {reset_link}")
    return True
