const fetch = require("node-fetch");

/* Ping admin API repeatedly for the requested order until it appears, or until a desired timeout */
const await_order = async (orderID, max_tries=10) => {

    await (await fetch(`https://testing-environment-alex.myshopify.com/admin/api/2020-07/orders/${orderID}.json`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": "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"
        },
        body: {}
    })).json()

};


/* Some necessary variant ID conversion because shopify is a piece of shit! */
const variantID_admin_2_storefront = async (admin_variantID) => { 
    /* Gets the storefront variant ID using the admin variant ID */
    let storefront_variantID = await (await fetch("https://testing-environment-alex.myshopify.com/admin/api/graphql.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": "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"
        },
        body: JSON.stringify({
            query: `query {
                        productVariant (id: "gid://shopify/ProductVariant/${admin_variantID}") {
                            id
                            title
                            storefrontId
                        }
                    }`
        })
    })).json()

    // GIVE IT HERE NOW!
    return storefront_variantID.data.productVariant.storefrontId;
}


module.exports = {
    varID_admin2strfnt: (admin_variantID) => variantID_admin_2_storefront(admin_variantID)
};