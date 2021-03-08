var express = require('express');
const db = require('../db/db');
const utils = require('../shopify-utils/utils');
const { response, query } = require('express');
const fetch = require("node-fetch");
const axios = require("axios");
const { resolveInclude } = require('ejs');

var router = express.Router();

// Default route
router.get("/", async (req, res) => {
    // Gets query parameters
    let query_params = utils.get_query_object(req.url);

    
    if ( ("shop" in query_params) && // If request includes shop query parameter
         (!(await db.is_store_exist(query_params["shop"]))) && // if the requested store doesn't exists in database (to initiate oauth installation)
         (utils.verify_hmac(query_params)) ) { // Verifies HMAC

            // Touches a random string into the session object to be used as oauth state verificaton
            let state_string = utils.get_state_string();
            req.session.oauth_state_string = state_string;

            // Redirects to oauth url
            res.redirect(`https://${query_params["shop"]}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SHOPIFY_API_SCOPES}&redirect_uri=${process.env.SHOPIFY_APP_URL}auth/callback&state=${state_string}`);

    } else {
        res.send("Welcome to MassGift");
    }
})


// Redirect url after oauth request is sent
router.get("/auth/callback", async (req, res) => {

    console.log("URL:");
    console.log(req.url);

    // Gets query parameters  code, hmac, shop, nonce
    let query_params = utils.get_query_object(req.url);

    // DEBUG
    /*console.log("HMAC VERIFY");
    console.log(utils.verify_hmac(query_params));

    console.log("NONCE VERIFY");
    console.log(query_params.state);
    console.log(req.session.oauth_state_string);

    console.log("SHOPNAME");
    console.log(query_params.shop);
    console.log(!!query_params.shop.match(/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/));
    console.log(!!query_params.shop.match(/\A(https|http)\:\/\/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com\//));*/

    
    if ( (utils.verify_hmac(query_params)) && // Verify HMAC
         (!!query_params.state && query_params.state == req.session.oauth_state_string) && // Veryify oauth state parameter
         (!!query_params.shop.match(/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/)) /* Validates shop name  (ie exampleshop.myshopify.com) */ ) {

            console.log("VERIFIED SUCCESSFULLY")

            // Makes post to request the permanent access token (passes temporary code and API key/secret)
            axios.post(`https://${query_params.shop}/admin/oauth/access_token`, {
                client_id: process.env.SHOPIFY_API_KEY,
                client_secret: process.env.SHOPIFY_API_SECRET,
                code: query_params.code
            })
            .then((response) => {
                
                //TODO: Create DB Entry for store with token
                console.log("OMG TOKEN!")
                console.log(response.data.access_token);

                // Run API Installation procedure (utils function)
                res.sendStatus(200);

            })
            .catch((error) => {
                console.log("You dunn fucked")
                console.error(error)
            })
    }

})


router.get("/:path", async (req, res) => {
    // Prints the requested URL
    console.log(req.params.path);

    // Redirects to default
    res.send(req.params.path);
})



/* ------ PLACE AJAX BALOW ------- */



module.exports = router;
