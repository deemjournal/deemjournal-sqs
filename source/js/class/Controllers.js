import * as core from "../core";
import BaseController from "./controllers/BaseController";
import ImageController from "./controllers/ImageController";
import Newsletter from "./components/Newsletter";
import Search from "./components/Search";
import Video from "./components/Video";
import Annotation from "./components/Annotation";
import Audio from "./components/Audio";
import Story from "./components/Story";
import CTA from "./components/CTA";
import Slider from "./components/Slider";
import Commerce from "./components/Commerce";


/**
 *
 * @public
 * @global
 * @class Controllers
 * @classdesc Handle controller functions.
 * @param {object} options Optional config
 *
 */
class Controllers {
    constructor ( options ) {
        this.element = options.el;
        this.callback = options.cb;
        this.controllers = [];
    }


    push ( id, elements, controller, component ) {
        this.controllers.push({
            id,
            elements,
            instance: null,
            Controller: controller,
            component
        });
    }


    init () {
        this.controllers.forEach(( controller ) => {
            if ( controller.elements.length ) {
                controller.instance = new controller.Controller(
                    controller.elements,
                    controller.component
                );
            }
        });
    }


    kill () {
        this.controllers.forEach(( controller ) => {
            if ( controller.instance ) {
                controller.instance.destroy();
            }
        });

        this.controllers = [];
    }


    exec () {
        this.controllers = [];

        this.push( "newsletter", this.element.find( ".js-newsletter" ), BaseController, Newsletter );
        this.push( "search", this.element.find( ".js-search" ), BaseController, Search );
        this.push( "audio", this.element.find( ".js-audio" ), BaseController, Audio );
        this.push( "story", this.element.find( ".js-story" ), BaseController, Story );
        this.push( "cta", this.element.find( ".js-button_" ), BaseController, CTA );
        this.push( "slider", this.element.find( ".js-slider" ), BaseController, Slider );
        this.push( "commerce", this.element.find( ".js-shop, .js-product, #sqs-cart-root" ), BaseController, Commerce );

        // Hinge on Squarespace selectors...
        this.push( "video", this.element.find( ".sqs-block-video" ), BaseController, Video );
        this.push( "annotation", this.element.find( ".sqs-layout > .sqs-row > .col > .sqs-row > .col:nth-child(1) > .sqs-block-html:nth-child(1) > .sqs-block-content > blockquote:nth-child(1)" ), BaseController, Annotation );

        this.init();

        this.images = this.element.find( core.config.lazyImageSelector );
        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            if ( this.callback ) {
                this.callback();
            }
        });
    }


    destroy () {
        if ( this.imageController ) {
            this.imageController.destroy();
        }

        this.kill();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
