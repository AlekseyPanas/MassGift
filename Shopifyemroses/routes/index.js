var express = require('express');
const db = require('../db/db');
const shoputils = require('../shopify-utils/utils');
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
    let storefrontID = await shoputils.varID_admin2strfnt("36376681709726");

    let checkout_data = await (await fetch("https://testing-environment-alex.myshopify.com/api/2020-07/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": "ad049bfe34b5635e318bbb5c74277dd0"
        },
        body: JSON.stringify({
            query: `mutation {
                        checkoutCreate(input: {
                            lineItems: [
                                { variantId: "${storefrontID}", quantity: 1 }
                            ]  
                        }) {
                            checkout {
                                id
                                webUrl
                            }
                        }
                    }
                    `
        })
    })).json()

    /*,
                    
                    {
                        "input": {
                            lineItems: [
                                { variantId: '36376681709726', quantity: '1' },
                                { variantId: '36180779729054', quantity: '1' }
                            ]                  
                        }
                    }*/

    console.log(checkout_data.data.checkoutCreate.checkout);
    console.log("THE URL", checkout_data.data.checkoutCreate.checkout.webUrl);
    res.send(checkout_data.data.checkoutCreate.checkout.webUrl);
});


// Webhook when order is created (payment came through)
router.post("/order-submitted", async (req, res) => {
    // OrderID
    // CustomerID
    // Line Items>
    //      Title
    //      productID
    //      variantID
    let orderID = req.body.id;


    console.log(req.body);
    res.sendStatus(200);

});


// Called when someone presses the text completion button in cart
router.post("/ajax/generate-checkout", async (req, res) => {
    // Gets cart from request body
    let cart = req.body;

    console.log(cart);

    // Creates a list of cart items with only their variantId and quantity
    let payload = await Promise.all((new Array(parseInt(cart.item_count))).fill(0).map(async (item, idx) => {return {
        "variantId": await shoputils.varID_admin2strfnt(cart[`items[${idx}][variant_id]`]), 
        "quantity": parseInt(cart[`items[${idx}][quantity]`])
    }}));

    console.log(`mutation {
        checkoutCreate(input: {
            lineItems: ${JSON.stringify(payload).replace(/"([^"]+)":/g, '$1:')} 
        }) {
            checkout {
                id
                webUrl
            }
        }
    }
    `)
    console.log();

    // Creates checkout via Storefront API using the cart items as line item input
    let checkout_data = await (await fetch("https://testing-environment-alex.myshopify.com/api/2020-07/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": "ad049bfe34b5635e318bbb5c74277dd0"
        },
        body: JSON.stringify({
            query: `mutation {
                        checkoutCreate(input: {
                            lineItems: ${JSON.stringify(payload).replace(/"([^"]+)":/g, '$1:')} 
                        }) {
                            checkout {
                                id
                                webUrl
                            }
                        }
                    }
                    `
        })
    })).json()

    // Set header to allow cross origin ajax
    res.header("Access-Control-Allow-Origin", "*");
    
    // If an error occurred on the whole mutation (i.e API perms not set for app)
    if (checkout_data.errors) {
        console.log(checkout_data.errors);

        // Send null for link and error
        res.json({
            link: null,
            error: checkout_data.errors
        });
    } 
    
    else {
        // Gets link
        let checkout_link = checkout_data.data.checkoutCreate.checkout.webUrl;
        // Gets ID
        let checkout_id = checkout_data.data.checkoutCreate.checkout.id;

        // Uploads ID to database
        //db.upload_checkoutID(checkout_id);

        // Returns json with link and code
        res.json({
            link: checkout_link,
            error: null
        });
    };
});

module.exports = router;
