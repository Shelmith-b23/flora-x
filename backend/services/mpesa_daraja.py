import os
import time
import base64
import json
import logging
import urllib.request
import urllib.error
from datetime import datetime

logger = logging.getLogger(__name__)

# Token cache to prevent unnecessary OAuth calls
_token_cache = {
    "access_token": None,
    "expires_at": 0
}

def get_mpesa_config():
    """
    Reads M-Pesa configuration securely from backend environment variables.
    Never exposes raw secrets in logs or API responses.
    """
    env = os.getenv("MPESA_ENVIRONMENT", "sandbox").strip().lower()
    is_production = env == "production"
    
    base_url = "https://api.safaricom.co.ke" if is_production else "https://sandbox.safaricom.co.ke"
    consumer_key = os.getenv("MPESA_CONSUMER_KEY", "IbnIloebrE2pm4nNDOBVPJjPcGsNQNRJUKQIj5dwH18CuUsj").strip()
    consumer_secret = os.getenv("MPESA_CONSUMER_SECRET", "4LVdKLAOMUE098HWeWSneeufekEMxADbwsbUilRxZG4CVlplzAIPxT3dgTRbLBTP").strip()
    shortcode = os.getenv("MPESA_SHORTCODE", "6358790").strip()
    passkey = os.getenv("MPESA_PASSKEY", "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919").strip()
    callback_url = os.getenv("MPESA_CALLBACK_URL", "https://ais-dev-vrmrcs33yycasebtnqwro4-99488448172.europe-west2.run.app/api/v1/checkout/mpesa-callback").strip()

    return {
        "environment": "production" if is_production else "sandbox",
        "base_url": base_url,
        "consumer_key": consumer_key,
        "consumer_secret": consumer_secret,
        "shortcode": shortcode,
        "passkey": passkey,
        "callback_url": callback_url,
        "is_configured": bool(consumer_key and consumer_secret)
    }

def normalize_phone_number(phone_input: str) -> str:
    """
    Normalizes Kenyan phone numbers to E.164 without leading plus: 254XXXXXXXXX
    Supports:
      - 07XXXXXXXX -> 2547XXXXXXXX
      - 01XXXXXXXX -> 2541XXXXXXXX
      - 2547XXXXXXXX -> 2547XXXXXXXX
      - 2541XXXXXXXX -> 2541XXXXXXXX
      - +2547XXXXXXXX -> 2547XXXXXXXX
      - +2541XXXXXXXX -> 2541XXXXXXXX
      - 7XXXXXXXX -> 2547XXXXXXXX
      - 1XXXXXXXX -> 2541XXXXXXXX
    """
    if not phone_input:
        return ""
    
    cleaned = "".join(c for c in str(phone_input) if c.isdigit())
    
    if cleaned.startswith("0") and len(cleaned) == 10:
        cleaned = "254" + cleaned[1:]
    elif cleaned.startswith("254") and len(cleaned) == 12:
        pass
    elif (cleaned.startswith("7") or cleaned.startswith("1")) and len(cleaned) == 9:
        cleaned = "254" + cleaned
    
    return cleaned

def get_daraja_access_token():
    """
    Fetches an OAuth access token from Safaricom Daraja.
    Uses in-memory caching with expiration safety margin.
    """
    global _token_cache
    now = time.time()

    if _token_cache["access_token"] and _token_cache["expires_at"] > (now + 60):
        return _token_cache["access_token"]

    config = get_mpesa_config()
    if not config["is_configured"]:
        logger.warning("[DARAJA] Credentials not fully configured in environment. Using sandbox simulation mode.")
        return None

    oauth_url = f"{config['base_url']}/oauth/v1/generate?grant_type=client_credentials"

    try:
        credentials = f"{config['consumer_key']}:{config['consumer_secret']}"
        encoded_creds = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")
        
        req = urllib.request.Request(oauth_url, headers={
            "Authorization": f"Basic {encoded_creds}"
        })
        
        with urllib.request.urlopen(req, timeout=15) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                token = data.get("access_token")
                expires_in = int(data.get("expires_in", 3599))
                _token_cache["access_token"] = token
                _token_cache["expires_at"] = now + expires_in
                logger.info(f"[DARAJA] Successfully acquired OAuth access token for {config['environment']} (valid for {expires_in}s).")
                return token
            else:
                logger.error(f"[DARAJA OAUTH ERROR] HTTP {response.status}")
                return None
    except Exception as e:
        logger.error(f"[DARAJA OAUTH EXCEPTION] Failed connecting to Daraja endpoint: {str(e)}")
        return None

def generate_stk_password(shortcode: str, passkey: str, timestamp: str) -> str:
    """
    Generates Base64 encoded password for Lipa Na M-Pesa Online:
    Base64(Shortcode + Passkey + Timestamp)
    """
    data_to_encode = f"{shortcode}{passkey}{timestamp}"
    encoded_bytes = base64.b64encode(data_to_encode.encode("utf-8"))
    return encoded_bytes.decode("utf-8")

def initiate_daraja_stk_push(phone_number: str, amount: float, account_reference: str, transaction_desc: str = "Flora_X Flower Order", callback_url: str = None):
    """
    Initiates an STK Push to the customer's phone via Safaricom Daraja API.
    Returns:
      (success: bool, data_or_error: dict)
    """
    config = get_mpesa_config()
    normalized_phone = normalize_phone_number(phone_number)
    
    if not normalized_phone or len(normalized_phone) != 12:
        return False, {
            "error_code": "INVALID_PHONE",
            "message": "Invalid Kenyan mobile number. Please supply a valid 07XX or 01XX number."
        }

    token = get_daraja_access_token()
    if not token:
        return False, {
            "error_code": "OAUTH_FAILED",
            "message": "Daraja OAuth token unavailable. Verify MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET.",
            "fallback_available": True
        }

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    password = generate_stk_password(config["shortcode"], config["passkey"], timestamp)
    target_callback = callback_url or config["callback_url"]

    payload = {
        "BusinessShortCode": config["shortcode"],
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": max(1, int(round(amount))),
        "PartyA": normalized_phone,
        "PartyB": config["shortcode"],
        "PhoneNumber": normalized_phone,
        "CallBackURL": target_callback,
        "AccountReference": (account_reference or "FloraX")[:12],
        "TransactionDesc": (transaction_desc or "FlowerOrder")[:13]
    }

    stk_url = f"{config['base_url']}/mpesa/stkpush/v1/processrequest"
    post_data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(stk_url, data=post_data, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    })

    try:
        logger.info(f"[DARAJA STK] Sending STK Push request to {config['environment']} for KES {payload['Amount']}...")
        with urllib.request.urlopen(req, timeout=20) as response:
            res_data = json.loads(response.read().decode("utf-8"))

            if response.status == 200 and res_data.get("ResponseCode") == "0":
                logger.info(f"[DARAJA STK SUCCESS] CheckoutRequestID: {res_data.get('CheckoutRequestID')}")
                return True, {
                    "merchant_request_id": res_data.get("MerchantRequestID"),
                    "checkout_request_id": res_data.get("CheckoutRequestID"),
                    "customer_message": res_data.get("CustomerMessage", "STK push prompt sent to device.")
                }
            else:
                return False, {
                    "error_code": res_data.get("errorCode") or res_data.get("ResponseCode") or "STK_REJECTED",
                    "message": res_data.get("errorMessage") or res_data.get("ResponseDescription") or "Safaricom rejected the STK Push request."
                }
    except urllib.error.HTTPError as he:
        try:
            error_body = json.loads(he.read().decode("utf-8"))
            return False, {
                "error_code": error_body.get("errorCode", f"HTTP_{he.code}"),
                "message": error_body.get("errorMessage", str(he))
            }
        except Exception:
            return False, {"error_code": f"HTTP_{he.code}", "message": str(he)}
    except Exception as e:
        logger.error(f"[DARAJA STK EXCEPTION] {str(e)}")
        return False, {
            "error_code": "NETWORK_ERROR",
            "message": f"Connection error communicating with Safaricom Daraja: {str(e)}"
        }

def query_daraja_stk_status(checkout_request_id: str):
    """
    Queries Safaricom Daraja STK query endpoint to reconcile pending transactions.
    """
    config = get_mpesa_config()
    token = get_daraja_access_token()
    if not token:
        return False, {"error_code": "OAUTH_FAILED", "message": "OAuth token unavailable."}

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    password = generate_stk_password(config["shortcode"], config["passkey"], timestamp)

    payload = {
        "BusinessShortCode": config["shortcode"],
        "Password": password,
        "Timestamp": timestamp,
        "CheckoutRequestID": checkout_request_id
    }

    query_url = f"{config['base_url']}/mpesa/stkpushquery/v1/query"
    post_data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(query_url, data=post_data, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    })

    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if response.status == 200:
                return True, res_data
            else:
                return False, res_data
    except Exception as e:
        return False, {"error_code": "QUERY_EXCEPTION", "message": str(e)}
