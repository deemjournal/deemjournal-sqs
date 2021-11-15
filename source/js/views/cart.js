export default ( shopJSON, cartJSON, cartResponse ) => {
    const svgDown = require( `../../../blocks/svg-down.block` );
    const getAttributes = ( item ) => {
        const attrs = [];

        for ( const i in item.structuredContent.variants[ 0 ].attributes ) {
            if ( item.structuredContent.variants[ 0 ].attributes.hasOwnProperty( i ) ) {
                attrs.push( `<div class="m">${item.structuredContent.variants[ 0 ].attributes[ i ]}</div>` );
            }
        }

        return attrs.join( "" );
    };

    return `
        <div class="cart">
            ${cartResponse.message ? `
                <p>${cartResponse.message}</p>
            ` : `
                <div class="cart__tabular">
                    <div>ITEM</div>
                    <div>QTY</div>
                    <div>PRICE</div>
                </div>
                ${cartJSON.items.map(( cartItem ) => {
                    const shopItem = shopJSON.items.find(( item ) => {
                        return (item.id === cartItem.productId);
                    });

                    return `
                        <div class="cart__entry js-cart-entry" data-item-id="${cartItem.productId}" data-entry-id="${cartItem.id}">
                            <div class="cart__item">
                                <div class="cart__thumb">
                                    <div class="media js-media">
                                        <div class="media__wrap">
                                            <img class="media__node image js-lazy-image" data-img-src="${shopItem.assetUrl}" data-variants="${shopItem.systemDataVariants}" data-original-size="${shopItem.originalSize}" />
                                        </div>
                                    </div>
                                </div>
                                <div class="cart__desc">
                                    <div class="cart__title">${cartItem.productName}</div>
                                    <div class="cart__attrs">
                                        ${getAttributes( shopItem )}
                                    </div>
                                </div>
                            </div>
                            <div class="cart__qty js-cart-qty">
                                <div class="min js-cart-qty-min">${svgDown}</div>
                                <div class="h6 js-cart-qty-val">${cartItem.quantity}</div>
                                <div class="add js-cart-qty-add">${svgDown}</div>
                            </div>
                            <div class="cart__price">
                                <h6 class="js-cart-price">${window.Y.Squarespace.Commerce.moneyString( cartItem.itemTotal.value )}</h6>
                            </div>
                        </div>
                    `;

                }).join( "" )}
                <div class="cart__subtotal">
                    <div class="_button js-cart-checkout">Checkout</div>
                    <h6>Subtotal <span class="js-cart-subtotal">${window.Y.Squarespace.Commerce.moneyString( cartJSON.subtotal.value )}</span></h6>
                </div>
            `}
        </div>
    `;
};
