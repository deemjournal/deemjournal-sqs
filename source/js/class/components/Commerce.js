import * as core from "../../core";
import $ from "properjs-hobo";
import cartView from "../../views/cart";
import shopView from "../../views/shop";
import productView from "../../views/product";
import Controllers from "../Controllers";
import Store from "../../core/Store";
import Stack from "./Stack";


/*
Y.Squarespace.Commerce:
    COMMERCE_DATE_TIME_FORMAT: "lllLT"
    capitalizeFirst: ƒ (t)
    destroyCommerce: ƒ ()
    dimensionUnit: ƒ ()
    fromPrice: ƒ (t)
    generateSKU: ƒ ()
    generateVariantId: ƒ ()
    getLabelForWorkflowState: ƒ (e)
    getTotalStockRemaining: ƒ (e)
    goToCheckoutPage: ƒ ()
    goToDonatePage: ƒ (t)
    goToGiftCardPage: ƒ (t,n)
    goToSubscriptionPage: ƒ (e)
    hasVariants: ƒ (e)
    initializeCommerce: ƒ ()
    isExpressCheckout: ƒ ()
    isFiniteSubscriptionPlan: ƒ (e)
    isValidUSZip: ƒ (e)
    maxes: ƒ ()
    measurementStandard: ƒ ()
    merchantSubscriptionDetailsString: ƒ (e)
    moneyString: ƒ (e,t)
    normalPrice: ƒ (t)
    onSale: ƒ (e)
    priceString: ƒ (e)
    salePrice: ƒ (t)
    soldOut: ƒ (e)
    summaryFormFieldString: ƒ (t)
    variantFormat: ƒ (t,n)
    variedPrices: ƒ (e)
    weightUnit: ƒ ()
*/


/**
 *
 * @public
 * @global
 * @class Commerce
 * @param {Element} element The element to work with
 * @classdesc Handle sqs Commerce.
 *
 */
class Commerce {
    constructor ( element ) {
        this.element = element;
        this.script = this.element.find( "script" ).detach();
        this.parsed = this.script.length ? JSON.parse( this.script[ 0 ].textContent ) : {};
        this.shop = this.element.is( ".js-shop" ) ? this.element : [];
        this.product = this.element.is( ".js-product" ) ? this.element : [];
        this.cart = this.element.is( "#sqs-cart-root" ) ? this.element : [];
        this.view = this.shop.length ? shopView : productView;
        this.data = this.shop.length ? { items: this.parsed } : { item: this.parsed };
        this.cartBox = $( ".absolute-cart-box" );

        this.init();
        this.exec();
        this.bind();
    }


    bind () {
        this.element.on( "click", ".js-button_", () => {
            const payload = {
                sku: this.data.item.structuredContent.variants[ 0 ].sku,
                itemId: this.data.item.id,
                quantity: 1,
                additionalFields: null
            };

            this.addCart( payload, ( /*response*/ ) => {
                if ( window.Y.Squarespace.Commerce.isExpressCheckout() ) {
                    window.Y.Squarespace.Commerce.goToCheckoutPage();

                } else {
                    this.goToCartPage();
                }
            });
        });
    }


    bindCart () {
        this.cart.on( "click", ".js-cart-qty-min, .js-cart-qty-add", ( e ) => {
            const target = $( e.target );
            const entry = target.closest( ".js-cart-entry" );
            const value = target.is( ".js-cart-qty-min" ) ? target.next( ".js-cart-qty-val" ) : target.prev( ".js-cart-qty-val" );
            const price = entry.find( ".js-cart-price" );
            const total = this.cart.find( ".js-cart-subtotal" );
            const entryData = entry.data();
            const item = this.shopJSON.items.find(( itm ) => {
                return (itm.id === entryData.itemId);
            });
            const qtyMath = target.is( ".js-cart-qty-min" ) ? -1 : 1;
            let qty = parseInt( value[ 0 ].innerText, 10 );

            qty += qtyMath;

            value[ 0 ].innerText = qty;
            price[ 0 ].innerText = window.Y.Squarespace.Commerce.moneyString( item.structuredContent.variants[ 0 ].price * qty );

            this.qtyCart( qty, entryData.entryId ).then(( response ) => {
                total[ 0 ].innerText = window.Y.Squarespace.Commerce.moneyString( response.subtotal.value );

                if ( qty === 0 ) {
                    entry.remove();
                }
            });
        });

        this.cart.on( "click", ".js-cart-checkout", () => {
            window.Y.Squarespace.Commerce.goToCheckoutPage();
        });
    }


    exec () {
        this.controllers = new Controllers({
            el: this.element
        });
        this.controllers.exec();
    }


    init () {
        if ( this.cart.length ) {
            window.Squarespace.initializeCartPage( window.Y );
            this.fetchShop().then(( shopResponse ) => {
                this.shopJSON = shopResponse;
                this.cartJSON = this.data.item.cart;

                this.fetchCart().then(( cartResponse ) => {
                    this.cart[ 0 ].innerHTML = cartView( this.shopJSON, this.cartJSON, cartResponse );
                    core.util.loadImages( this.cart.find( core.config.lazyImageSelector ), core.util.noop );
                    this.bindCart();
                });
            });

        } else {
            window.Squarespace.initializeCommerce( window.Y );
            this.element[ 0 ].innerHTML = this.view( this );
            this.stack = new Stack( this.element.find( ".js-stack" ) );
        }
    }


    goToCartPage () {
        window.location.href = `${window.location.protocol}//${window.location.host}/cart/`;
    }


    fetchShop () {
        return new Promise(( resolve, reject ) => {
            $.ajax({
                url: "/shop/",
                method: "GET",
                dataType: "json",
                data: {
                    format: "json"
                }
            }).then(( response ) => {
                resolve( response );

            }).catch(( error ) => {
                reject( error );
            });
        });
    }


    fetchCart () {
        return $.ajax({
            url: `/api/commerce/shopping-cart/?crumb=${Store.crumb}`,
            method: "GET",
            dataType: "json"
        });
    }


    addCart ( payload, callback ) {
        $.ajax({
            url: `/api/commerce/shopping-cart/entries/?crumb=${Store.crumb}`,
            payload: payload,
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            dataType: "json"
        })
        .then(( response ) => {
            if ( response.crumbFail ) {
                Store.crumb = response.crumb;
                core.log( "warn", "Crumb fail. Trying again." );
                this.addCart( payload, callback );

            } else if ( callback ) {
                callback( response );
            }
        })
        .catch(( response ) => {
            try {
                response = JSON.parse( response );

            } catch ( parseError ) {
                core.log( "warn", parseError );
            }

            if ( (typeof response === "object") && response.message ) {
                this.alert = new window.Y.Squarespace.Widgets.Alert({
                    "strings.title": "Deem Journal",
                    "strings.message": response.message
                });
            }
        });
    }


    qtyCart ( qty, id ) {
        return $.ajax({
            url: `/api/commerce/cart/items/${id}?crumb=${Store.crumb}`,
            payload: {
                quantity: qty
            },
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            dataType: "json"
        });
    }


    destroy () {
        this.controllers.destroy();

        if ( this.stack ) {
            this.stack.destroy();
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Commerce;
