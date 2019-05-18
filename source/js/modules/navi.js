import * as core from "../core";
import $ from "properjs-hobo";
import { TweenLite, Power3 } from "gsap/TweenMax";
import ResizeController from "properjs-resizecontroller";


/**
 *
 * @public
 * @namespace navi
 * @description Open tray, activate links.
 * @memberof menus
 *
 */
const navi = {
    init () {
        this.time = 500;
        this.isOpen = false;
        this.isSearch = false;
        this.nav = core.dom.body.find( ".js-navi" );
        this.navItems = this.nav.find( ".js-navi-a" );
        this.navTrigger = core.dom.body.find( ".js-navi-meni" );
        this.menu = core.dom.body.find( ".js-meni" );
        this.menuItems = this.menu.find( ".js-meni-a" );
        this.menuAnims = this.menu.find( ".js-meni-search, .js-meni-a, .js-meni-footer" );
        this.menuSearch = this.menu.find( ".js-meni-search" );
        this.menuClose = this.menu.find( ".js-meni-close" );
        this.search = this.menu.find( ".js-search" );
        this.main = core.dom.main;
        this.header = core.dom.body.find( ".js-header" );
        this.resizer = new ResizeController();
        this.bind();
        this.onResize();
        this.animMenuItems( 0 );
        this.animMenuSearch( 0 );
        this.animMenuClose( 0 );
    },


    bind () {
        this.navTrigger.on( "click", () => {
            this.toggleMenu();
        });

        this.menuSearch.on( "click", () => {
            this.toggleSearch();
        });

        this.menuClose.on( "click", () => {
            this.closeSearch();
        });

        core.dom.doc.on( "click", ( e ) => {
            const target = $( e.target );

            if ( this.isOpen && !this.isSearch ) {
                if ( !target.is( ".js-navi-meni" ) && !target.is( ".js-meni-a" ) && !target.is( ".js-meni-search" ) && !target.is( ".js-meni-ext" ) && !target.is( ".js-meni-close" ) ) {
                    this.closeMenu();
                }

            } else {
                // console.log( "do nothing" );
            }
        });

        this.resizer.on( "resize", this.onResize.bind( this ) );
    },


    onResize () {
        const rect = this.header[ 0 ].getBoundingClientRect();

        this.main[ 0 ].style.paddingTop = `${rect.height}px`;
    },


    animMenuItems ( binary ) {
        this.tweenMenu = new TweenLite.to( this.menuAnims, (this.time / 1000), {
            opacity: binary,
            y: binary ? 0 : 16,
            ease: Power3.ease
        });
    },


    animMenuSearch ( binary ) {
        this.tweenSearch = new TweenLite.to( this.search[ 0 ], (this.time / 1000), {
            opacity: binary,
            y: binary ? 0 : 16,
            delay: binary ? (this.time / 1000) : 0,
            ease: Power3.ease
        });
    },


    animMenuClose ( binary ) {
        this.tweenClose = new TweenLite.to( this.menuClose[ 0 ], (this.time / 1000), {
            opacity: binary,
            y: binary ? 0 : 16,
            delay: binary ? (this.time / 1000) : 0,
            ease: Power3.ease
        });
    },


    show () {
        return new Promise(( resolve ) => {
            this.menu[ 0 ].style.display = "block";
            setTimeout(() => {
                resolve();

            }, 1 );
        });
    },


    hide () {
        setTimeout(() => {
            this.menu[ 0 ].style.display = "none";

        }, 1 );
    },


    openMenu () {
        return new Promise(( resolve ) => {
            this.isOpen = true;
            this.show().then(() => {
                this.menu.addClass( "is-active" );
                core.dom.html.addClass( "is-menu-open" );
                this.animMenuItems( 1 );
                setTimeout(() => {
                    this.menu.addClass( "is-static" );
                    resolve();

                }, this.time );
            });
        });
    },


    closeMenu () {
        return new Promise(( resolve ) => {
            this.isOpen = false;
            this.menu.removeClass( "is-static" );
            this.menu.addClass( "is-closing" );
            core.dom.html.removeClass( "is-menu-open" );
            this.animMenuItems( 0 );
            setTimeout(() => {
                this.menu.removeClass( "is-static is-active is-closing" );
                this.hide();
                resolve();

            }, this.time );
        });
    },


    openSearch () {
        return new Promise(( resolve ) => {
            const searchInstance = this.search.data( "instance" );

            this.isSearch = true;
            this.menu.addClass( "is-search" );
            core.dom.html.addClass( "is-menu-search" );
            searchInstance.clear();
            this.animMenuSearch( 1 );
            this.animMenuItems( 0 );
            this.animMenuClose( 1 );
            setTimeout(() => {
                resolve();

            }, this.time );
        });
    },


    closeSearch () {
        return new Promise(( resolve ) => {
            const searchInstance = this.search.data( "instance" );

            this.isSearch = false;
            this.menu.removeClass( "is-search" );
            core.dom.html.removeClass( "is-menu-search" );
            searchInstance.reset();
            this.animMenuSearch( 0 );
            this.animMenuItems( 1 );
            this.animMenuClose( 0 );
            setTimeout(() => {
                resolve();

            }, this.time );
        });
    },


    closeAll () {
        if ( this.isSearch ) {
            this.closeSearch();
            this.closeMenu();

        } else {
            this.closeMenu();
        }
    },


    setActive ( view ) {
        this.navItems.removeClass( "is-active" );
        this.navItems.filter( `.js-navi--${view}` ).addClass( "is-active" );
        this.menuItems.removeClass( "is-active" );
        this.menuItems.filter( `.js-meni--${view}` ).addClass( "is-active" );
    },


    toggleMenu () {
        if ( this.isOpen ) {
            this.closeMenu();

        } else {
            this.openMenu();
        }
    },


    toggleSearch () {
        if ( this.isSearch ) {
            this.closeSearch();

        } else {
            this.openSearch();
        }
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default navi;
