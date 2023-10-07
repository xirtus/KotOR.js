/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 */

import { GameMenu, GUIControl } from ".";
import { GFFStruct } from "../resource/GFFStruct";
import * as THREE from "three";
import { TextureLoader } from "../loaders";
import { TextureType } from "../enums/loaders/TextureType";
import { GameState } from "../GameState";
import { Mouse } from "../controls/Mouse";
import { GUIControlTypeMask } from "../enums/gui/GUIControlTypeMask";
import { GUISliderDirection } from "../enums/gui/GUISliderDirection";
import { OdysseyTexture } from "../resource/OdysseyTexture";
import { ResolutionManager } from "../managers";

/* @file
 * The GUISlider class.
 */

export class GUISlider extends GUIControl{

  onValueChanged: Function;

  thumbStruct: GFFStruct;
  scrollPos: number;
  scrollMax: number;
  mouseOffset: { x: number; y: number; };
  value: number;
  thumb: { texture: string; material: THREE.SpriteMaterial; mesh: THREE.Sprite; geometry: THREE.BufferGeometry; width: number; height: number; };
  direction: GUISliderDirection = GUISliderDirection.Horizontal;

  constructor(menu: GameMenu, control: GFFStruct, parent: GUIControl, scale: boolean = false){
    super(menu, control, parent, scale);
    this.objectType |= GUIControlTypeMask.GUISlider;

    this.scrollPos = 0.5;
    this.scrollMax = 1;
    this.mouseOffset = {x: 0, y: 0};
    this.value = 0.50;

    this.thumb = {
      texture: '',
      material: undefined,
      mesh: undefined,
      geometry: undefined,
      width: 8,
      height: 32,
    };

    this.thumb.material = new THREE.SpriteMaterial( { map: null, color: new THREE.Color(0xFFFFFF) } );
    this.thumb.material.transparent = true;
    this.thumb.mesh = new THREE.Sprite( this.thumb.material );
    this.widget.add(this.thumb.mesh);

    this.thumb.mesh.addEventListener('click', (e: any) => {
      console.log('hello');
      this.mouseInside();
    });

    if(this.control.hasField('THUMB')){
      this.thumbStruct = this.control.getFieldByLabel('THUMB').getChildStructs()[0];

      this.thumb.mesh.position.z = 2;
      this.thumb.mesh.name = 'SCROLLBAR thumb';
      this.thumb.mesh.scale.x = this.thumb.width;
      this.thumb.mesh.scale.y = this.thumb.height;

      let parentPos = this.widget.getWorldPosition(new THREE.Vector3());

      this.thumb.mesh.userData.box = new THREE.Box2(
        new THREE.Vector2(
          (parentPos.x - this.extent.width/2),
          (parentPos.y - this.extent.height/2)
        ),
        new THREE.Vector2(
          (parentPos.x + this.extent.width/2),
          (parentPos.y + this.extent.height/2)
        )
      )

      if(this.thumbStruct.hasField('IMAGE')){
        TextureLoader.enQueue(this.thumbStruct.getFieldByLabel('IMAGE').getValue(), this.thumb.material, TextureType.TEXTURE, (texture: OdysseyTexture) => {
          this.thumb.material.transparent = false;
          this.thumb.material.alphaTest = 0.5;
          this.thumb.material.needsUpdate = true;
          if(texture.header){
            this.thumb.width = texture.header.width;
            this.thumb.height = texture.header.height;
            this.thumb.mesh.scale.set(texture.header.width, texture.header.height, 1);
          }
        });
        TextureLoader.LoadQueue();
      }
    }

    this.addEventListener('mouseMove', () => {
      this.mouseInside();
    })

    this.addEventListener('click', (e: any) =>{
      e.stopPropagation();
      const mouseX = Mouse.positionViewport.x - (ResolutionManager.getViewportWidthScaled() / 2);
      const mouseY = Mouse.positionViewport.y - (ResolutionManager.getViewportHeightScaled() / 2);
      const scrollLeft = ( this.thumb.mesh.position.x + (this.thumb.mesh.scale.x / 2) ) + mouseX;
      const scrollTop = ( this.thumb.mesh.position.y + (this.thumb.mesh.scale.y / 2) ) + mouseY;

      this.mouseOffset.x = scrollLeft;
      this.mouseOffset.y = scrollTop;

      this.mouseInside();
    });

    this.addEventListener('mouseDown', (e: any) => {
      e.stopPropagation();
      const mouseX = Mouse.positionViewport.x - (ResolutionManager.getViewportWidthScaled() / 2);
      const mouseY = Mouse.positionViewport.y - (ResolutionManager.getViewportHeightScaled() / 2);
      const scrollLeft = ( this.thumb.mesh.position.x + (this.thumb.mesh.scale.x / 2) ) + mouseX;
      const scrollTop = ( this.thumb.mesh.position.y + (this.thumb.mesh.scale.y / 2) ) + mouseY;

      this.mouseOffset.x = scrollLeft;
      this.mouseOffset.y = scrollTop;
    });

    this.addEventListener('mouseUp', () => {
      this.mouseInside();
    });

    this.setValue(this.value);

  }

  onINIPropertyAttached(){
    if(this.iniProperty)
      this.setValue(GameState.iniConfig.getProperty(this.iniProperty) * .01);
  }

  mouseInside(){
    if(this.disableSelection) return;

    const mouseX = Mouse.positionViewport.x - (ResolutionManager.getViewportWidthScaled() / 2);
    const mouseY = -(Mouse.positionViewport.y - (ResolutionManager.getViewportHeightScaled() / 2));
    const scrollBarWidth = this.extent.width;
    const scrollBarHeight = this.extent.height;

    let value = this.value;
    let valueChanged = false;

    if(this.direction == GUISliderDirection.Horizontal){
      this.thumb.mesh.position.x = (mouseX + 21) + this.extent.width/2;

      if(this.thumb.mesh.position.x < -((scrollBarWidth - this.thumb.mesh.scale.x))/2 ){
        this.thumb.mesh.position.x = -((scrollBarWidth - this.thumb.mesh.scale.x))/2
      }

      if(this.thumb.mesh.position.x > ((scrollBarWidth - this.thumb.mesh.scale.x))/2 ){
        this.thumb.mesh.position.x = ((scrollBarWidth - this.thumb.mesh.scale.x))/2
      }

      const maxScroll = ((scrollBarWidth - this.thumb.mesh.scale.x)/2);
      scrollX = (this.thumb.mesh.position.x + maxScroll) / (maxScroll*2);
      this.thumb.mesh.position.y = 0;
      valueChanged = (scrollX != this.value);
      value = scrollX;
    }else{
      this.thumb.mesh.position.y = (mouseY + 12.5);

      if(this.thumb.mesh.position.y < -((scrollBarHeight - this.thumb.mesh.scale.y))/2 ){
        this.thumb.mesh.position.y = -((scrollBarHeight - this.thumb.mesh.scale.y))/2
      }

      if(this.thumb.mesh.position.y > ((scrollBarHeight - this.thumb.mesh.scale.y))/2 ){
        this.thumb.mesh.position.y = ((scrollBarHeight - this.thumb.mesh.scale.y))/2
      }

      const maxScroll = ((scrollBarHeight - this.thumb.mesh.scale.y)/2);
      scrollY = (this.thumb.mesh.position.y + maxScroll) / (maxScroll*2);
      this.thumb.mesh.position.x = 0;
      valueChanged = (scrollY != this.value);
      value = scrollY;
    }

    this.value = value;

    if(this.iniProperty){
      GameState.iniConfig.setProperty(this.iniProperty, (this.value * 100) | 0);
    }

    if(valueChanged && typeof this.onValueChanged === 'function')
      this.onValueChanged(this.value);

  }

  setValue(value = 0){

    this.value = value;

    if(this.direction == GUISliderDirection.Horizontal){
      const maxWidth = (this.extent.width - this.thumb.width);
      const threshold = maxWidth/2;
      const thumbX = (maxWidth * value) - threshold;

      this.thumb.mesh.position.x = thumbX;
      this.thumb.mesh.position.y = 0;
    }else{
      const maxHeight = (this.extent.height - this.thumb.height);
      const threshold = maxHeight/2;
      const thumbY = (maxHeight * value) - threshold;

      this.thumb.mesh.position.y = thumbY;
      this.thumb.mesh.position.x = 0;
    }

    if(this.iniProperty){
      GameState.iniConfig.setProperty(this.iniProperty, (this.value * 100) | 0);
    }
    
    if(typeof this.onValueChanged === 'function')
      this.onValueChanged(this.value);

  }

  setVertical(){
    this.direction = GUISliderDirection.Vertical;
  }

  setHorizontal(){
    this.direction = GUISliderDirection.Horizontal;
  }

}
