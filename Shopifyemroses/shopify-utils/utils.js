const fetch = require("node-fetch");
const crypto = require("crypto");

/* Use this to house any shopify utility functions */
const get_query_object = (url) => {
    // Query object to be populated
    query_object = {}

    // Remove /?, Splits by &, Splits each list item by =, populates object with key value pairs
    url.slice(url.indexOf("?") + 1).split("&").map((p) => {itm = p.split("="); query_object[itm[0]] = itm[1]});

    // Returns object
    return query_object
}

/* Generate a random string for oauth state security parameter */
const get_state_string = () => {
    return crypto.createHash("sha256").update(crypto.randomBytes(1024)).digest("hex");
}

/* Given the parameters from a shopify redirect, returns whether its a valid signature */
const verify_hmac = (params) => {
    let HMAC_query_parameter = params.hmac;

    // This string combined all the parameters except hmac. This will be used with the API secret to verify via HMAC
    let param_string = "";

    // Appends all parameters that aren't HMAC
    for (const [key, value] of Object.entries(params)) {
        if (!(key == "hmac")) {
            param_string = param_string.concat(`${key}=${value}&`);
        }
    }

    // Removes trailing "&" symbol
    param_string = param_string.slice(0, param_string.length - 1);

    // Generates the HMAC
    HMAC_generator = crypto.createHmac("sha256", process.env.SHOPIFY_API_SECRET);
    HMAC_generator.update(param_string);
    let HMAC_string = HMAC_generator.digest("hex");

    // Compares the generated HMAC with the one given in the query parameter
    return crypto.timingSafeEqual(Buffer.from(HMAC_string), Buffer.from(HMAC_query_parameter));
}

module.exports = {
    get_query_object: (url) => get_query_object(url),
    get_state_string: () => get_state_string(),
    verify_hmac: (params) => verify_hmac(params)
};