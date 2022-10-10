/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 */

import * as THREE from "three";
import { GameState } from "../GameState";
import { OdysseyModel3D } from "../three/odyssey";
import { GUIControl } from "./GUIControl";

/* @file
 * The LBL_3DView class.
 */

export class LBL_3DView {
  width: number;
  height: number;
  visible: boolean;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  texture: THREE.WebGLRenderTarget;
  tDepth: THREE.WebGLRenderTarget;
  clearColor: THREE.Color;
  currentCamera: THREE.Camera;
  globalLight: THREE.AmbientLight;
  emitters: any = {};
  _emitters: any = {};
  group: { emitters: THREE.Group; lights: THREE.Group; light_helpers: THREE.Group; shadow_lights: THREE.Group; creatures: THREE.Group; };
  control: any;

  constructor(width: number = 800, height: number = 600){

    this.width = width;//window.innerWidth;
    this.height = height;//window.innerHeight;
    this.visible = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 22.5, this.width/this.height, 0.1, 15000 );
    this.texture = new THREE.WebGLRenderTarget( this.width, this.height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
		this.tDepth = new THREE.WebGLRenderTarget( this.width, this.height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat } );
    this.clearColor = new THREE.Color(0x000000);

    this.currentCamera = this.camera;

    this.globalLight = new THREE.AmbientLight(0x7F7F7F);
    this.globalLight.position.x = 0;
    this.globalLight.position.y = 0;
    this.globalLight.position.z = 0;
    this.globalLight.intensity  = 1;

    //this.scene.add(this.globalLight);
    this.camera.up = new THREE.Vector3( 0, 0, 1 );
    this.camera.updateProjectionMatrix();

    this.emitters = {};
    this._emitters = {};
    this.group = {
      emitters: new THREE.Group(),
      lights: new THREE.Group(),
      light_helpers: new THREE.Group(),
      shadow_lights: new THREE.Group(),
      creatures: new THREE.Group()
    }

    this.scene.add(this.group.emitters);
    this.scene.add(this.group.lights);
    this.scene.add(this.group.shadow_lights);
    this.scene.add(this.group.creatures);

  }

  setControl(control: GUIControl){
    this.control = control;
    this.control.getFill().material.uniforms.map.value = this.texture.texture;
    this.control.getFill().material.uniforms.diffuse.value.setHex(0xFFFFFF);
  }

  getCamera(){
    return this.camera;
  }

  getTexture(){
    return this.texture.texture;
  }

  addModel(model: THREE.Object3D){
    if(model instanceof THREE.Object3D){
      this.scene.add(model);
    }
  }

  setVisible(bVisible: boolean){
    this.visible = bVisible;
  }

  setSize(width = 0, height = 0){
    this.width = width;
    this.height = height;
    this.tDepth.setSize(this.width, this.height);
    this.updateRatio();
  }

  updateRatio(){
    this.texture.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  render(delta = 0){

    if(!this.visible)
      return;

    for(let emitter in this.emitters){
      this.emitters[emitter].tick(delta);
    }

    for(let i = 0; i < this.scene.children.length; i++){
      let element = this.scene.children[i];
      if(element instanceof OdysseyModel3D){
        element.update(delta);
      }
    }

    //let oldClearColor = GameState.renderer.getClearColor();
    //GameState.renderer.setClearColor(this.clearColor, 1);
    GameState.renderer.setRenderTarget(this.texture);
    GameState.renderer.clear(this.texture);
    GameState.renderer.render(this.scene, this.camera);
    // @ts-expect-error
    this.texture.needsUpdate = true;
    GameState.renderer.setRenderTarget(null);
    //GameState.renderer.setClearColor(oldClearColor, 1);

    if(this.control instanceof GUIControl){
      let material = this.control.getFill().material;
      if(material instanceof THREE.ShaderMaterial){
        material.uniforms.map.value = this.texture.texture;
        material.transparent = true;
        material.needsUpdate = true;
      }
    }

  }


}
