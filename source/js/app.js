// Load the SASS
require( "../sass/screen.scss" );


// Load the JS
// import $ from "properjs-hobo";
import router from "./router";
import * as core from "./core";
import Metrics from "./class/services/Metrics";
import intro from "./modules/intro";
import navi from "./modules/navi";


/**
 *
 * @public
 * @class App
 * @classdesc Load the App application Class to handle it ALL.
 *
 */
class App {
    constructor () {
        this.metrics = new Metrics();
        this.core = core;
        this.intro = intro;
        this.navi = navi;
        this.router = router;

        this.init();
    }


    /**
     *
     * @public
     * @instance
     * @method init
     * @memberof App
     * @description Initialize application modules.
     *
     */
    init () {
        this.core.detect.init();
        this.intro.init();
        this.navi.init();
        this.router.init();
        this.router.load().then(() => {
            this.intro.teardown();

        }).catch(( error ) => {
            this.core.log( "warn", error );
        });
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
