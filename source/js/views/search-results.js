import * as core from "../core";



export default ( json ) => {
    const items = json.items;
    const story = core.dom.main.find( ".js-story" );

    return items.length ? `<div class="grid js-search-grid">${items.map(( item ) => {
        return (story.length && story.data().itemId !== item.id) ? `
            <div class="grid__item">
                <a class="grid__link" href="${item.itemUrl || item.fullUrl}">
                    <img class="grid__image image js-lazy-image" data-img-src="${item.imageUrl || item.assetUrl}" />
                    <div class="grid__info">
                        <div class="grid__title">${item.title}</div>
                    </div>
                </a>
            </div>
        `: ``;

    }).join( "" )}</div>` : `<div class="grid js-search-grid"><div class="grid__item"><p class="-grey">no results</p></div></div>`;
};
