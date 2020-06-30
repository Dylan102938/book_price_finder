from flask import Flask, request, jsonify
from flask_cors import CORS

import requests
import time
import json
from funcs import *
barcode = "9781409590309"

app = Flask(__name__)
CORS(app)


@app.route("/get_item", methods=["GET", "POST"])
def get_item():
    if request.method == "GET":
        barcode = request.args["barcode"]

        zapper = get_zapper(barcode)
        ziffit = get_ziffit(barcode)
        sellitback = get_sellitback(barcode)
        momox = get_momox(barcode)

        all_sites = {
            "sites": [zapper, ziffit, sellitback, momox]
        }

        return all_sites


def get_zapper(barcode):
    try:
        url = "https://api.zapper.co.uk/"
        identifier = gen_identifier()
        curr_time = str(int(time.time()))
        payload = "{" \
                  "\"Version\":\"2017-08\"," \
                  "\"PricingData\":\"\"," \
                  "\"Action\":\"AddItemToActiveList\"," \
                  "\"ApiKey\":\"wnWfu432ys6wd3wQ5Xr9ekEVBdRGGm\"," \
                  "\"DeviceRef\":\"" + identifier + "\"," \
                  "\"Identifier\":\"" + barcode + "\"," \
                  "\"Ref\":\"" + identifier + "\"," \
                  "\"PHPSESSID\":\"" + identifier + "-" + curr_time + "\"}"
        headers = {
          'Content-Type': 'text/plain',
          'Cookie': 'PHPSESSID=zap-' + identifier + '-'+ curr_time
        }

        response = requests.request("POST", url, headers=headers, data=payload)

        response = json.loads(response.text)

        title = response["ZapperApiResponse"]["ResponseData"]["AddItemToActiveListResponse"]["Title"]
        offer = str(response["ZapperApiResponse"]["ResponseData"]["AddItemToActiveListResponse"]["Offer"])
    except:
        title = "N/A"
        offer = "0"

    obj = {
        "site":"Zapper",
        "title":title,
        "offer":offer,
        "url": "https://zapper.co.uk/list-page"
    }

    return obj


def get_ziffit(barcode):
    try:
        url = "https://api.ziffit.com/basket/items"
        auth_url = "https://api.ziffit.com/authorization-token"
        s = requests.session()
        response = s.get(auth_url)
        auth_token = json.loads(response.text)["token"]

        payload = "{" \
                  "\"ean\":\"" + barcode + "\", " \
                  "\"scanOrigin\":\"ZIFFIT\"}"


        headers = {
            'Authorization': 'Bearer ' + auth_token,
            'Content-Type': 'application/json;charset=UTF-8',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
            'x-region-id': 'GB'
        }
        response = requests.request("POST", url, headers=headers, data=payload)
        response = json.loads(response.text)

        title = response["item"]["title"]
        offer = str(response["item"]["offerPrice"])
    except:
        title = "N/A"
        offer = "0"

    obj = {
        "site": "Ziffit",
        "title": title,
        "offer": offer,
        "url": "https://www.ziffit.com/en-gb"
    }

    return obj


def get_sellitback(barcode):
    try:
        url = "https://sellitback.com/Sellitback.svc/SearchItem?UserID=&CartID=&EAN=" + barcode
        response = requests.get(url)
        response = json.loads(response.text)

        offer = str(response["Price"])
        title = response["Title"]
    except:
        offer = "0"
        title = "N/A"

    obj = {
        "site": "Sell It Back",
        "title": title,
        "offer": offer,
        "url": "https://sellitback.com/"
    }

    return obj


def get_momox(barcode):
    title = "N/A"
    offer = "0"

    try:
        cfduid = gen_cfduid()
        mx_ec = gen_mxec()
        ser_cookies = "__cfduid=" + cfduid + "; django_language=de; " + "mx_ec=" + mx_ec
        url = "https://api.momox.co.uk/api/v4/offer/?ean=" + barcode
        headers = {
            'x-api-token': '2231443b8fb511c7b6a0eb25a62577320bac69b6',
            'x-client-version': 'r3188-a5caf8b',
            'x-marketplace-id': 'momox_uk',
            'Cookie': ser_cookies
        }

        response = requests.get(url, headers=headers)
        response = json.loads(response.text)

        if response["status"] == "offer":
            title = response["product"]["title"]
            offer = str(response["price"])
    except:
        title = "N/A"
        offer = "0"

    obj = {
        "site": "Momox",
        "title": title,
        "offer": offer,
        "url": "https://www.momox.co.uk/"
    }

    return obj


if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5000,debug=True)