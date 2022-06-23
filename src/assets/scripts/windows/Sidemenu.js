import Win from '../_app/cuchillo/windows/Window';
import { gsap, Power3 } from "gsap";
import { GetBy } from '../_app/cuchillo/core/Element';

export default class Sidemenu extends Win {
    constructor(__container) {
        super(__container, "sidemenu");
    }
    
    show__effect(__d = 0) {
        gsap.to(this.container,{alpha:1, ease:Power3.easeOut, onComplete:()=>{this.afterShow()}});
    }

    afterShow() {
        super.afterShow();
    }

    hide__effect(__d = 0) {
        gsap.to(this.container,{alpha:0, duration:.4, ease:Power3.easeOut, onComplete:()=>{this.afterHide();}});
    }

    afterHide() {
        super.afterHide();
    }

    directHide() {
        gsap.set(this.container,{alpha:0});
        super.directHide();
    }

    resize() {
        super.resize();
    }
}

export const WinSidemenu = new Sidemenu(GetBy.id("Sidemenu"));