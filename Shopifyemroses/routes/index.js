var express = require('express');
const db = require('../db/db');
const { response } = require('express');
const fetch = require("node-fetch");
// const { v4: uuid } = require('uuid');
const v4 = require('uuid');
// const { uuid } = require('uuidv4');
var router = express.Router();

router.get("/db-test", async (req, res) => {
    res.send(await db.get_test());
});

router.get("/shop-info", async (req, res) => {
    
    let checkout_data = await (await fetch("https://testing-environment-alex.myshopify.com/admin/api/2020-07/checkouts.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": "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"
        },
        body: JSON.stringify({
            query: `mutation checkoutCreate($input: CheckoutCreateInput!) {
                        checkoutCreate(input: $input) {
                            checkout {
                                id
                                linesItems: [
                                    quantity: 5,
                                    variantId: 3
                                ]
                            }
                            checkoutUserErrors {
                                code
                                field
                                message
                            }
                        }
                    }`
        })
    })).json()

    console.log(checkout_data);
    console.log("THE URL", checkout_data.checkout.web_url);
    res.send(checkout_data.checkout.web_url);
});


// Webhook when order is created (payment came through)
router.post("/order-submitted", async (req, res) => {
    // OrderID
    // CustomerID
    // Line Items>
    //      Title
    //      productID
    //      variantID
    console.log(req.body);
    res.sendStatus(200);

});


// Called when someone presses the text completion button in cart
router.post("/ajax/generate-checkout", async(req, res) => {
    // Gets cart from request body
    let cart = req.body;

    // Creates a list of cart items with only their variantId and quantity
    let payload = (new Array(parseInt(cart.item_count))).fill(0).map((item, idx) => {return {
        "variantId": cart[`items[${idx}][variant_id]`], 
        "quantity": cart[`items[${idx}][quantity]`]
    }});

    // Creates checkout via API using the cart items as line item input
    let checkout_data = await (await fetch("https://testing-environment-alex.myshopify.com/admin/api/2020-07/checkouts.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": "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"
        },
        body: JSON.stringify({
            query: `mutation checkoutCreate($input: CheckoutCreateInput!) {
                        checkoutCreate(input: $input) {
                            checkout {
                                id
                                webUrl
                            }
                            checkoutUserErrors {
                                code
                                field
                                message
                            }
                        }
                    }
                    
                    {
                        "input": {
                          "lineItems": ${payload}
                        }
                    }
                    `
        })
    })).json()

    // Set header to allow cross origin ajax
    res.header("Access-Control-Allow-Origin", "*");
    
    // If an error occurred on the whole mutation (i.e API perms not set for app)
    if (checkout_data.errors) {
        // Send null for link and error
        res.json({
            link: null,
            error: checkout_data.errors
        });
    } 
    
    else {
        // Gets link
        let checkout_link = checkout_data.checkout.web_url;
        // Gets ID
        let checkout_id = checkout_data.checkout.id;
        // Gets Errors
        let errors = checkout_data.checkoutUserErrors;

        // Uploads ID to database
        db.upload_checkoutID(checkout_id);

        // Returns json with link and code
        res.json({
            link: checkout_link,
            error: errors
        });
    };
});

module.exports = router;
