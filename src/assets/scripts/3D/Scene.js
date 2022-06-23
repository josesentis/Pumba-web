import { Vector3 } from 'three';
import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import WebGLObject from '../_app/cuchillo/3D/WebGLObject';
import WebGLSketch from "../_app/cuchillo/3D/WebGLSketch";
import { Metrics } from '../_app/cuchillo/core/Metrics';

export default class Scene extends WebGLSketch {
    cube; 

    constructor () {
        super({
            clearColor: '#1A1A1A',
            cameraPos: new Vector3(0, 0, 1500)
        });

        const size = Metrics.WIDTH * .25;

        const geometry = new BoxGeometry();
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        this.cube = new WebGLObject(geometry, material, {
            size: new Vector3(size, size, size)
        });
        this.cube.active = true;

        this.scene.add(this.cube);
    }

    update () {
        const rot = {
            x: this.cube.rotation.x += .002,
            y: this.cube.rotation.y += .002,
            z: 0
        }
        this.cube.rot = rot;
    }

    resize () {
        super.resize();

        const size = Metrics.WIDTH * .25;
        this.cube.resize(size, size, size);
    }
}