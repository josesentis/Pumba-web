import { isMobile, isTouch } from './Basics';
import { Sizes } from './Sizes';
import { Maths } from '../utils/Maths';

const Metrics = {
  set WIDTH(n) { this._WIDTH = n; },
  get WIDTH() { return this._WIDTH; },
  set HEIGHT(n) { this._HEIGHT = n; },
  get HEIGHT() { return this._HEIGHT; },
  _WIDTH: window.innerWidth,
  _HEIGHT: window.innerHeight,
  CENTER_X: 0,
  CENTER_Y: 0,
  ASPECT: 0,
  HEIGHT_INSIDE: 0,
  HEIGHT_SCROLL: 0,
  FONT_SIZE: 16,
  _callResize: null,

  init: function(__call) {
    this._callResize = __call;
    this.ASPECT = window.innerWidth/window.innerHeight;

    window.addEventListener("resize", () => {
      clearTimeout(this._idTimer);
      this._idTimer = setTimeout(()=> {
        Metrics.update();
      }, 100);
    });

    // Solucion moderna al cambio de orientación. No funciona en iOS
    screen.orientation.addEventListener('change', (e) => { location.reload(); })
  },

  update: function(){
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.CENTER_X = this.WIDTH/2;
    this.CENTER_Y = this.HEIGHT/2;
    this.ASPECT = this.WIDTH/this.HEIGHT;

    // ORIENTATION CHANGE RELOAD
    // Buscar una mejor solucion, tiene varios problemas.
    // Dependiendo del tamaño del teclado puede creer que
    // ha cambiado de orientación.
    /*if(Math.floor(newAspect) != Math.floor(this.ASPECT) && isTouch) {
      location.reload();
    }*/

    const limit = 1400 * 900;
    const pixels =  Metrics.WIDTH * Metrics.HEIGHT;
    Sizes.RATIO_CANVAS = Math.min(window.devicePixelRatio, Math.max(1,Maths.precission((limit * window.devicePixelRatio)/pixels,1)));

    // REAL VH
    const VH = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${VH}px`);

    // CHECK BROWSER ZOOM
    // El fontsize con vw no cambia en caso de hacer zoom de accesibilidad
    // (cmmd +) Vamos a generar un var zoom que utilizaremos en CSS.
    // La unica forma optima es comparando los pixelratio (Cambia con el zoom)
    // En SIZES.RATIO almacenamos el ratio de inicio. Problema: Si iniciamos
    // con un zoom de 200% y lo bajamos a 100% (Vista normal) nos mostrara 
    // todo al 50%. Accesible pero mitad :)
    const ZOOM = window.devicePixelRatio/Sizes.RATIO;
    document.documentElement.style.setProperty('--zoom', `${ZOOM}`);

    this.FONT_SIZE = parseFloat(getComputedStyle(document.documentElement).fontSize);

    this._callResize();
  },

  parseSize(__s, __target = null) {
    if(!__s) return null;

    let size = parseFloat(__s);
    let mult = 1;

    if(!isNaN(__s)) {
      mult = 1;
    } else if(__s.indexOf("rem") > -1) {
      mult = this.FONT_SIZE;
    } else if(__s.indexOf("vw") > -1) {
      mult = Metrics.WIDTH/100;
    } else if(__s.indexOf("vh") > -1) {
      mult = Metrics.HEIGHT/100;
    } else if(__s.indexOf("fpx") > -1) {
      mult = this.FONT_SIZE;
      size = size / 16;
    } else if(__s.indexOf("px") > -1) {
      mult = 1;
    } else if(__s.indexOf("x") > -1) {
      mult = __target? __target.offsetWidth : 1;
    } else if(__s.indexOf("y") > -1) {
      mult = __target? __target.offsetHeight : 1;
    }

    return size * mult;
  }
};

export { Metrics }