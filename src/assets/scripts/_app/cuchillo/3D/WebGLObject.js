import { Mesh, Object3D, Vector3 } from "three";

export default class WebGLObject extends Object3D {
  _active = false;
//   _lookAt;
//   _lookAtTarget;
  rot;
  mesh;
  material;
  geometry;
  
  constructor(geo, mat, opts = {}) {
    super();
    
    this.visible = this._active;
    
    this.geometry = geo;
    this.material = mat;
    this.mesh = new Mesh(geo, mat);
    
    this.add(this.mesh);

    if (opts.size) this.mesh.scale.set(opts.size.x, opts.size.y, opts.size.z);
    
    this.rot = new Vector3();

    // this.lookAt = new Vector3(this.position);
    // this.lookAtTarget = new Vector3(this.position);
  }

  get active () {
    return this._active;
  }

  set active (value) {
    this._active = value;
    this.visible = this._active;
  }

  update () {
    if (!this._active) return;

    // this._lookAt.lerp(this._lookAtTarget, .1);
    // this.lookAt(this._lookAt);

    this.rotation.x = Maths.lerp(this.rotation.x, this.rot.x, .1);
    this.rotation.y = Maths.lerp(this.rotation.y, this.rot.y, .1);
    this.rotation.z = Maths.lerp(this.rotation.z, this.rot.z, .1);
  }

  resize(x, y, z) {
    this.mesh.scale.set(x, y, z);
  }
    
  domPositionTo3D(__x, __y) {
    const x = -1 * Metrics.WIDTH * 0.5 + __x;
    const y = Metrics.HEIGHT * 0.5 - __y;

    return {
      x,
      y,
      z: 0
    };
  }
}
