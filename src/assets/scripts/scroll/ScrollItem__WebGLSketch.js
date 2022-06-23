import gsap from 'gsap';

import { Scroll } from '../_app/cuchillo/scroll/Scroll';
import VScroll_Item from '../_app/cuchillo/scroll/VScroll_Item';
import Scene from '../3D/Scene';

class ScrollItem__WebGLSketch extends VScroll_Item {
  _scene;

  //==================================================================================================================
  //          CONSTRUCTOR
  //==================================================================================================================
  constructor(__link, __index, __scroller) {
    super(__link, __index, __scroller);

    this._scene = new Scene();

    this._call = () => {
      this.loop();
    }

    this.onShow = () => {
      this._scene.start();
      gsap.ticker.add(this._call);
    };
    this.onHide = () => {
      this._scene.stop();
      gsap.ticker.remove(this._call);
    };
    this.onMove = () => {}
  }

  loop () {
    this._scene.loop();
  }

  dispose () {
    this._scene.dispose();

    super.dispose();
  }

  resize (__w,__h) {
    this._scene.resize();

    super.resize(__w,__h);
  }
}

Scroll._registerClass('webgl-sketch', ScrollItem__WebGLSketch);