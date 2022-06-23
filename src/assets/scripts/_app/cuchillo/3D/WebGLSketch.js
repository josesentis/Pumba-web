import { Vector3 } from "three";
import { Clock, OrthographicCamera, PerspectiveCamera, Scene, Vector2, WebGLRenderer } from "three";

import { GetBy } from "../core/Element";
import { Metrics } from "../core/Metrics";

export default class WebGLSketch {
	_started = false;
	_paused = false;
	renderer;
	scene;
	camera;
	// clock;
	size;
	// controls;
	// raycaster;
  	// mouse = new THREE.Vector2();
	defaults = {
		container: 'scene',
		antialias: true,
		alpha: true,
		ortho: false,
		fov: 60,
		cameraPos: new Vector3(),
		near: .1,
		far: 10000,
		clearColor: '#000000'
	}

	constructor (opts = {}) {
		// this.mouse = new Vector2();
		this.size = new Vector2();
		this.scene = new Scene();

		this.defaults = {
			...this.defaults,
			...opts
		};

		if (this.defaults.ortho) {
			this.camera = new OrthographicCamera(
				-Metrics.WIDTH / 2,
				Metrics.WIDTH / 2,
				Metrics.HEIGHT / 2,
				-Metrics.HEIGHT / 2,
				this.defaults.near,
				this.defaults.far,
			);
		}
		else {
			this.camera = new PerspectiveCamera(
				this.defaults.fov,
				Metrics.WIDTH / Metrics.HEIGHT,
				this.defaults.near,
				this.defaults.far
			);
		}
		this.camera.position.copy(this.defaults.cameraPos);
		this.scene.add(this.camera);

		const container = GetBy.id(this.defaults.container)
		this.renderer = new WebGLRenderer({
			canvas: container,
			antialias: this.defaults.antialias,
			alpha: this.defaults.alpha
		});

		this.size.set(Metrics.WIDTH, Metrics.HEIGHT);
		this.renderer.setSize(this.size.x, this.size.y);

		this.renderer.setClearColor(this.defaults.clearColor, 1);
		this.renderer.setSize(this.size.x, this.size.y);
		this.renderer.setPixelRatio(window.devicePixelRatio);

		// this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    	// this.controls.enabled = true;

		// this.raycaster = new THREE.Raycaster();

        if (opts.debug) {
			const axesHelper = new AxesHelper(2000);
			this.scene.add(axesHelper);
		}
	}

	get domElement () {
		return this.renderer.domElement;
	}

	start() {
		if(this._started) return;
		this._started = true;

		// this.clock = new Clock(true);

		this.addEventListeners();
	}

	pause() {
		if(!this._started) return;
		if(this._paused) return;
		this._paused = true;
	}

	resume() {
		if(!this._started) return;
		if(!this._paused) return;
		this._paused = false;
	}

	addEventListeners() {}

	update() {}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	loop () {
        if (!this._started || this._paused) return;

        this.update();
        this.render();
    }

	resize() {
		if (Metrics.WIDTH === this.size.x && Metrics.HEIGHT === this.size.y) return;

		this.size.set(Metrics.WIDTH, Metrics.HEIGHT);
		this.renderer.setSize(this.size.x, this.size.y);
		
		if (this.camera.type == "PerspectiveCamera") {
			this.camera.aspect = this.size.x / this.size.y;
		} else {
			this.camera.left = -Metrics.WIDTH / 2;
			this.camera.right = Metrics.WIDTH / 2;
			this.camera.top = Metrics.HEIGHT / 2;
			this.camera.bottom = -Metrics.HEIGHT / 2;
		}

		this.camera.updateProjectionMatrix();
	}

	dispose () {}
}
