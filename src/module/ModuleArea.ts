import { GameState } from "../GameState";
import { GFFObject } from "../resource/GFFObject";
import { OdysseyModel3D } from "../three/odyssey";
import { AreaMap } from "./AreaMap";
import { AreaWeather } from "./AreaWeather";
import * as THREE from "three";
import { Module, ModuleAreaOfEffect, ModuleCamera, ModuleCreature, ModuleDoor, ModuleEncounter, ModuleItem, ModuleMGEnemy, ModuleMGObstacle, ModuleMGPlayer, ModuleMGTrack, ModuleMiniGame, ModuleObject, ModulePath, ModulePlaceable, ModulePlayer, ModuleRoom, ModuleSound, ModuleStore, ModuleTrigger, ModuleWaypoint } from ".";
import { AsyncLoop } from "../utility/AsyncLoop";
import { GFFField } from "../resource/GFFField";
import { GFFDataType } from "../enums/resource/GFFDataType";
import { GFFStruct } from "../resource/GFFStruct";
import { NWScriptInstance } from "../nwscript/NWScriptInstance";
import { NWScript } from "../nwscript/NWScript";
import { ResourceTypes } from "../resource/ResourceTypes";
import { LYTObject } from "../resource/LYTObject";
import { Utility } from "../utility/Utility";
import EngineLocation from "../engine/EngineLocation";
import { OdysseyWalkMesh } from "../odyssey";
import { AudioLoader } from "../audio/AudioLoader";
import { EngineMode } from "../enums/engine/EngineMode";
import { CExoLocString } from "../resource/CExoLocString";
import { VISObject } from "../resource/VISObject";
import { TextureLoaderQueuedRef } from "../interface/loaders/TextureLoaderQueuedRef";
import { FollowerCamera } from "../engine/FollowerCamera";
import { MenuManager, TwoDAManager, PartyManager, ModuleObjectManager } from "../managers";
import { ResourceLoader, TextureLoader } from "../loaders";
import { AreaAudioProperties } from "../interface/area/AreaAudioProperties";
import { AudioEngine } from "../audio";
import { ModuleObjectType } from "../enums/module/ModuleObjectType";
import { BitWise } from "../utility/BitWise";
import { AmbientSource } from "../interface/area/AmbientSource";
import { GrassProperties } from "../interface/area/GrassProperties";

type AreaScriptKeys = 'OnEnter'|'OnExit'|'OnHeartbeat'|'OnUserDefined';

/**
 * ModuleArea class.
 * 
 * Class representing an ingame area.
 * 
 * KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 * 
 * @file ModuleArea.ts
 * @author KobaltBlu <https://github.com/KobaltBlu>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 */
export class ModuleArea extends ModuleObject {

  module: Module;
  are: GFFObject;
  git: GFFObject;
  transWP: string|GFFObject;
  weather: AreaWeather = new AreaWeather(this);
  fog: THREE.Fog;
  path: ModulePath;
  visObject: VISObject;
  layout: LYTObject;
  areaMap: AreaMap;

  cameras: ModuleCamera[] = [];
  creatures: ModuleCreature[] = [];
  doorhooks: any[] = [];
  doors: ModuleDoor[] = [];
  encounters: ModuleEncounter[] = [];
  items: ModuleItem[] = [];
  placeables: ModulePlaceable[] = [];
  sounds: ModuleSound[] = [];
  stores: ModuleStore[] = [];
  triggers: ModuleTrigger[] = [];
  waypoints: ModuleWaypoint[] = [];
  areaOfEffects: ModuleAreaOfEffect[] = [];
  miniGame: ModuleMiniGame;
  walkmesh_rooms: ModuleRoom[] = [];

  scriptResRefs: Map<AreaScriptKeys, string> = new Map<AreaScriptKeys, string>();

  audio: AreaAudioProperties = {
    ambient: {
      day: 0,
      dayVolume: 0,
      night: 0,
      nightVolume: 0
    },
    music: {
      day: 0,
      battle: 0,
      night: 0,
      delay: 0
    },
    environmentAudio: 0,
  };

  alphaTest = 0.200000002980232;

  /**
   * Index into camerastyle.2da
   */
  cameraStyle = 0;

  /**
   * Module designer comments
   */
  comments = '';

  /**
   * @deprecated Deprecated: since NWN
   */
  creatorId = -1;

  /**
   * Determines if there is an active day/night cycle
   * @remarks not supported by KotOR or TSL. not sure if we will add support for this in the engine
   */
  dayNightCycle: boolean = false;

  /**
   * 
   */
  defaultEnvMap = '';

  /**
   * 
   */
  dynamicAmbientColor = 6312778;

  /**
   * @deprecated Deprecated: since NWN
   */
  expansionList: any[] = [];

  /**
   * Set of bit flags specifying area terrain type:
   * 0x0001: INTERIOR     (exterior if unset)
   * 0x0002: UNDERGROUND  (aboveground if unset)
   * 0x0004: NATURAL      (urban if unset)
   * These flags affect game behaviour with respect to ability to hear things behind walls, map exploration visibility, and whether certain feats are active, though not necessarily in that order. They do not affect how the toolset presents the area to the user.
   * @remarks currently unused
   */
  flags = 1;

  grass: GrassProperties = {
    ambient: 0,
    density: 0,
    diffuse: 0,
    probability: { 
      lowerLeft: 0.25,
      lowerRight: 0.25,
      upperLeft: 0.25,
      upperRight: 0.25
    },
    quadSize: 0,
    textureName: ''
  };

  /**
   * TRUE if the area is always night, FALSE if area is always day. Meaningful only if DayNightCycle is FALSE
   */
  isNight: boolean = false;

  lightingScheme = 0;

  /**
   * Index into loadscreens.2da. Default loading screen to use when loading this area. 
   * @remarks Note that a Door or Trigger that has an area transition can override the loading screen of the destination area
   * not supported by KotOR or TSL. not sure if we will add support for this in the engine
   */
  loadScreenId = 0;

  /**
   * Modifier to Listen akill checks made in area
   */
  modListenCheck = 0;

  /**
   * Modifier to Spot skill checks made in area
   */
  modSpotCheck = 0;

  /**
   * Moon AmbientSource properties
   */
  moon: AmbientSource = {
    ambientColor: 0,
    diffuseColor: 0,
    fogColor: 0,
    fogNear: 99,
    fogFar: 100,
    fogAmount: 1,
    fogOn: false,
    shadows: false
  };

  /**
   * Sun AmbientSource properties
   */
  sun: AmbientSource = {
    ambientColor: 0,
    diffuseColor: 0,
    fogColor: 0,
    fogNear: 1000,
    fogFar: 2000,
    fogAmount: 1,
    fogOn: false,
    shadows: false
  };

  /**
   * Name of area as seen in game. 
   * ToDo: If there is a colon (:) in the name, then the game does not show any of the text up to and including the first colon
   */
  areaName: CExoLocString;

  /**
   * @remarks unimplemented
   */
  noHangBack: boolean;

  /**
   * Determines if the player can rest
   */
  noRest: boolean;
  
  playerOnly: boolean = false;

  /**
   * Index into pvpsettings.2da. 
   * Note that the settings are actually hard-coded into the game, and pvpsettings.2da serves only to provide text descriptions of the settings
   */
  playerVsPlayer: boolean = false;
  
  /**
   * Opacity of shadows (0-100)
   */
  shadowOpacity = 0;

  /**
   * @remarks unimplemented
   */
  stealthXPEnabled = 0;

  /**
   * @remarks unimplemented
   */
  stealthXPLoss = 0;

  /**
   * @remarks unimplemented
   */
  stealthXPMax = 0;

  /**
   * Tag of the area, used for scripting
   */
  tag = '';

  /**
   * Determines if the player can escape to the hideout
   */
  unescapable: boolean = false;

  /**
   * Revision number of the area. Initially 1 when area is first saved to disk, and increments every time the ARE file is saved. Equals 2 on second save, and so on
   */
  version = 1;

  /**
   * Strength of the wind in the area. None, Weak, or Strong (0-2).
   */
  windPower = 0;

  restrictMode: number;

  constructor(resRef = '', are = new GFFObject(), git = new GFFObject()){
    super(are);
    this.objectType |= ModuleObjectType.ModuleArea;
    this.name = resRef;
    this.are = are;
    this.git = git;
    this.transWP = '';
  }

  dispose(){
    this.areaMap.dispose();

    //clear area room objects
    while (this.rooms.length){
      this.rooms[0].destroy();
    }

    //clear area areaOfEffect objects
    while (this.areaOfEffects.length){
      this.areaOfEffects[0].destroy();
    }

    //clear area creature objects
    while (this.creatures.length){
      this.creatures[0].destroy();
    }

    //clear area item objects
    while (this.items.length){
      this.items[0].destroy();
    }

    //clear area placeable objects
    while (this.placeables.length){
      this.placeables[0].destroy();
    }

    //clear area door objects
    while (this.doors.length){
      this.doors[0].destroy();
    }

    //clear area trigger objects
    while (this.triggers.length){
      this.triggers[0].destroy();
    }

    //clear area waypoint objects
    while (this.waypoints.length){
      this.waypoints[0].destroy();
    }

    //clear area sound objects
    while (this.sounds.length){
      this.sounds[0].destroy();
    }

    while (PartyManager.party.length){
      const pm = PartyManager.party.shift();
      pm.destroy();
    }

    this.weather.destroy();
  }

  update(delta: number = 0){
    let roomCount = this.rooms.length;
    let aoeCount = this.areaOfEffects.length;
    let trigCount = this.triggers.length;
    let encounterCount = this.encounters.length;
    let creatureCount = this.creatures.length;
    let placeableCount = this.placeables.length;
    let doorCount = this.doors.length;
    let partyCount = PartyManager.party.length;
    let animTexCount = GameState.AnimatedTextures.length;

    //update triggers
    for(let i = 0; i < trigCount; i++){
      this.triggers[i].update(delta);
    }

    //update encounters
    for(let i = 0; i < encounterCount; i++){
      this.encounters[i].update(delta);
    }
    
    //update aoe
    for(let i = 0; i < aoeCount; i++){
      this.areaOfEffects[i].update(delta);
    }

    //update party
    for(let i = 0; i < partyCount; i++){
      PartyManager.party[i].update(delta);
    }
    
    //update creatures
    for(let i = 0; i < creatureCount; i++){
      this.creatures[i].update(delta);
    }
    
    //update placeables
    for(let i = 0; i < placeableCount; i++){
      this.placeables[i].update(delta);
    }
    
    //update doors
    for(let i = 0; i < doorCount; i++){
      this.doors[i].update(delta);
    }

    //update animated textures
    for(let i = 0; i < animTexCount; i++){
      GameState.AnimatedTextures[i].Update(delta);
    }

    //unset party controlled
    for(let i = 0; i < partyCount; i++){
      PartyManager.party[i].controlled = false;
    }

    if(GameState.Mode == EngineMode.MINIGAME){
      this.miniGame.tick(delta);
    }

    //update rooms
    for(let i = 0; i < roomCount; i++){
      this.rooms[i].update(delta);
      this.rooms[i].hide();
    }

    this.updateRoomVisibility(delta);
    FollowerCamera.update(delta, this);

    this.weather.update(delta);
  }

  updatePaused(delta: number = 0){
    let roomCount = this.rooms.length;
    let trigCount = this.triggers.length;
    let encounterCount = this.encounters.length;
    let aoeCount = this.areaOfEffects.length;
    let creatureCount = this.creatures.length;
    let placeableCount = this.placeables.length;
    let doorCount = this.doors.length;
    let partyCount = PartyManager.party.length;

    //update triggers
    for(let i = 0; i < trigCount; i++){
      this.triggers[i].updatePaused(delta);
    }

    //update encounters
    for(let i = 0; i < encounterCount; i++){
      this.encounters[i].updatePaused(delta);
    }

    //update aoe
    for(let i = 0; i < aoeCount; i++){
      this.areaOfEffects[i].updatePaused(delta);
    }

    //update party
    for(let i = 0; i < partyCount; i++){
      PartyManager.party[i].updatePaused(delta);
    }
    
    //update creatures
    for(let i = 0; i < creatureCount; i++){
      this.creatures[i].updatePaused(delta);
    }
    
    //update placeables
    for(let i = 0; i < placeableCount; i++){
      this.placeables[i].updatePaused(delta);
    }
    
    //update doors
    for(let i = 0; i < doorCount; i++){
      this.doors[i].updatePaused(delta);
    }

    if(GameState.Mode == EngineMode.MINIGAME){
      this.miniGame.tickPaused(delta);
    }

    //update rooms
    for(let i = 0; i < roomCount; i++){
      this.rooms[i].hide();
    }

    this.updateRoomVisibility(delta);
    FollowerCamera.update(delta, this);
  }

  updateRoomVisibility(delta: number = 0){
    const roomList: ModuleRoom[] = [];
    let pos = undefined;

    switch(GameState.Mode){
      case EngineMode.DIALOG:
        pos = GameState.currentCamera.position.clone().add(GameState.playerFeetOffset);

        for(let i = 0, il = this.rooms.length; i < il; i++){
          const room = this.rooms[i];
          const inCamera = GameState.viewportFrustum.intersectsBox(room.box);
          if(!room.hasVISObject || room.box.containsPoint(pos) || inCamera){
            roomList.push(room);
          }
        }
  
        for(let i = 0; i < roomList.length; i++){
          roomList[i].show(true);
        }
      break;
      case EngineMode.MINIGAME:
        for(let i = 0, len = this.rooms.length; i < len; i++){
          let room = this.rooms[i];
          if(room) room.show(false);
        }
      break;
      case EngineMode.INGAME:
      case EngineMode.FREELOOK:
      default:
        let player = GameState.getCurrentPlayer();
        if(player && player.room){
          player.room.show(true);
        }

        //SKYBOX Fix
        if(player){
          for(let i = 0, len = this.rooms.length; i < len; i++){
            let room = this.rooms[i];
            if(!room.hasVISObject || room.box.containsPoint(player.position)){
              //Show the room, but don't recursively show it's children
              room.show(false);
            }
          }
        }
      break;
    }
  }

  reloadTextures(){
    MenuManager.LoadScreen.open();
    MenuManager.LoadScreen.LBL_HINT.setText('');
    GameState.loadingTextures = true;
    //Cleanup texture cache
    Array.from(TextureLoader.textures.keys()).forEach( (key) => {
      TextureLoader.textures.get(key).dispose();
      TextureLoader.textures.delete(key); 
    });


    for(let i = 0; i < this.rooms.length; i++){
      const room = this.rooms[i];
      //room.LoadModel();
    }

    new AsyncLoop({
      array: this.creatures,
      onLoop: (creature: ModuleCreature, asyncLoop: AsyncLoop) => {
        creature.loadModel().then(() => {
          asyncLoop.next();
        });
      }
    }).iterate(() => {
      new AsyncLoop({
        array: PartyManager.party,
        onLoop: (partyMember: ModuleCreature, asyncLoop: AsyncLoop) => {
          partyMember.loadModel().then(() => {
            asyncLoop.next();
          });
        }
      }).iterate(() => {
        new AsyncLoop({
          array: this.placeables,
          onLoop: (placeable: ModulePlaceable, asyncLoop: AsyncLoop) => {
            placeable.loadModel().then(() => {
              asyncLoop.next();
            });
          }
        }).iterate(() => {
          new AsyncLoop({
            array: this.doors,
            onLoop: (door: ModuleDoor, asyncLoop: AsyncLoop) => {
              door.loadModel().then(() => {
                asyncLoop.next();
              });
            }
          }).iterate(() => {
            new AsyncLoop({
              array: this.rooms,
              onLoop: (room: ModuleRoom, asyncLoop: AsyncLoop) => {
                room.loadModel().then(() => {
                  asyncLoop.next();
                });
              }
            }).iterate(() => {
              TextureLoader.LoadQueue(() => {
                MenuManager.LoadScreen.close();
                GameState.loadingTextures = false;
              }, (ref: TextureLoaderQueuedRef, index: number, count: number) => {
                MenuManager.LoadScreen.setProgress((index/count + 1) * 100);
                MenuManager.LoadScreen.LBL_HINT.setText('Loading: '+ref.name);
                //console.log('tex', textureName, index, count);
              });
            });
          });
        });
      });
    });
  }

  setTransitionWaypoint(sTag = ''){
    this.transWP = sTag;
  }

  async load(){

    //BEGIN AREA LOAD

    if(this.are.RootNode.hasField('ObjectId'))
      this.id = this.are.getFieldByLabel('ObjectId').getValue();

    let rooms = this.are.getFieldByLabel('Rooms');

    this.alphaTest = this.are.getFieldByLabel('AlphaTest').getValue();
    this.cameraStyle = this.are.getFieldByLabel('CameraStyle').getValue();
    this.weather.chanceLightning = this.are.getFieldByLabel('ChanceLightning').getValue();
    this.weather.chanceRain = this.are.getFieldByLabel('ChanceRain').getValue();
    this.weather.chanceSnow = this.are.getFieldByLabel('ChanceSnow').getValue();
    this.comments = this.are.getFieldByLabel('Comments').getValue();
    this.creatorId = this.are.getFieldByLabel('Creator_ID').getValue();
    this.dayNightCycle = this.are.getFieldByLabel('DayNightCycle').getValue();
    this.defaultEnvMap = this.are.getFieldByLabel('DefaultEnvMap').getValue();
    this.dynamicAmbientColor = this.are.getFieldByLabel('DynAmbientColor').getValue();
    this.expansionList = [];

    this.flags = this.are.getFieldByLabel('Flags').getValue();
    this.grass = {
      ambient: this.are.getFieldByLabel('Grass_Ambient').getValue(),
      density: this.are.getFieldByLabel('Grass_Density').getValue(),
      diffuse: this.are.getFieldByLabel('Grass_Diffuse').getValue(),
      probability: {
        lowerLeft: this.are.getFieldByLabel('Grass_Prob_LL').getValue(),
        lowerRight: this.are.getFieldByLabel('Grass_Prob_LR').getValue(),
        upperLeft: this.are.getFieldByLabel('Grass_Prob_UL').getValue(),
        upperRight: this.are.getFieldByLabel('Grass_Prob_UR').getValue()
      },
      quadSize: this.are.getFieldByLabel('Grass_QuadSize').getValue(),
      textureName: this.are.getFieldByLabel('Grass_TexName').getValue()
    };

    this.id = this.are.getFieldByLabel('ID').getValue();
    this.isNight = this.are.getFieldByLabel('IsNight').getValue();
    this.lightingScheme = this.are.getFieldByLabel('LightingScheme').getValue();
    this.loadScreenId = this.are.getFieldByLabel('LoadScreenID').getValue();

    let map = this.are.getFieldByLabel('Map').getChildStructs()[0];
    if(map){
      this.areaMap = AreaMap.FromStruct(map);
    }

    if(this.are.RootNode.hasField('MiniGame')){
      this.miniGame = new ModuleMiniGame(
        this.are.getFieldByLabel('MiniGame').getChildStructs()[0]
      );
    }

    this.modListenCheck = this.are.getFieldByLabel('ModListenCheck').getValue();
    this.modSpotCheck = this.are.getFieldByLabel('ModSpotCheck').getValue();
    this.moon.ambientColor = this.are.getFieldByLabel('MoonAmbientColor').getValue();
    this.moon.diffuseColor = this.are.getFieldByLabel('MoonDiffuseColor').getValue();
    this.moon.fogColor = this.are.getFieldByLabel('MoonFogColor').getValue();
    this.moon.fogFar = this.are.getFieldByLabel('MoonFogFar').getValue();
    this.moon.fogFar = this.are.getFieldByLabel('MoonFogNear').getValue();
    this.moon.fogOn = !!this.are.getFieldByLabel('MoonFogOn').getValue();
    this.moon.shadows = !!this.are.getFieldByLabel('MoonShadows').getValue();
    this.areaName = this.are.getFieldByLabel('Name').getCExoLocString();

    this.noHangBack = !!this.are.getFieldByLabel('NoHangBack').getValue();
    this.noRest = !!this.are.getFieldByLabel('NoRest').getValue();

    this.scriptResRefs.set('OnEnter', this.are.getFieldByLabel('OnEnter').getValue());
    this.scriptResRefs.set('OnExit', this.are.getFieldByLabel('OnExit').getValue());
    this.scriptResRefs.set('OnHeartbeat', this.are.getFieldByLabel('OnHeartbeat').getValue());
    this.scriptResRefs.set('OnUserDefined', this.are.getFieldByLabel('OnUserDefined').getValue());

    this.playerOnly = !!this.are.getFieldByLabel('PlayerOnly').getValue();
    this.playerVsPlayer = this.are.getFieldByLabel('PlayerVsPlayer').getValue();

    //Rooms
    for(let i = 0; i < rooms.childStructs.length; i++ ){
      let strt = rooms.childStructs[i];
      const room = new ModuleRoom({
        ambientScale: this.are.getFieldByLabel('AmbientScale', strt.getFields()).getValue(),
        envAudio: this.are.getFieldByLabel('EnvAudio', strt.getFields()).getValue(),
        roomName: this.are.getFieldByLabel('RoomName', strt.getFields()).getValue().toLowerCase()
      });
      room.area = this;
      this.rooms.push(room);
    }

    this.shadowOpacity = this.are.getFieldByLabel('ShadowOpacity').getValue();

    this.stealthXPEnabled = this.are.getFieldByLabel('StealthXPEnabled').getValue();
    this.stealthXPLoss = this.are.getFieldByLabel('StealthXPLoss').getValue();
    this.stealthXPMax = this.are.getFieldByLabel('StealthXPMax').getValue();

    this.sun.ambientColor = this.are.getFieldByLabel('SunAmbientColor').getValue();
    this.sun.diffuseColor = this.are.getFieldByLabel('SunDiffuseColor').getValue();
    this.sun.fogColor = this.are.getFieldByLabel('SunFogColor').getValue();
    this.sun.fogFar = this.are.getFieldByLabel('SunFogFar').getValue();
    this.sun.fogNear = this.are.getFieldByLabel('SunFogNear').getValue();
    this.sun.fogOn = this.are.getFieldByLabel('SunFogOn').getValue();
    this.sun.shadows = this.are.getFieldByLabel('SunShadows').getValue();
    this.tag = this.are.getFieldByLabel('Tag').getValue();
    this.unescapable = this.are.getFieldByLabel('Unescapable').getValue() ? true : false;
    this.version = this.are.getFieldByLabel('Version').getValue();
    this.windPower = this.are.getFieldByLabel('WindPower').getValue();

    this.fog = undefined;

    if(this.sun.fogOn){
      this.fog = new THREE.Fog(
        this.sun.fogColor,
        this.sun.fogNear,
        this.sun.fogFar
      );
    }else{
      GameState.scene.fog = undefined;
    }

    //BEGIN GIT LOAD

    const areaMap = this.git.getFieldByLabel('AreaMap');
    const areaProps = this.git.getFieldByLabel('AreaProperties');
    const areaEffects = this.git.getFieldByLabel('AreaEffectList');
    const cameras = this.git.getFieldByLabel('CameraList');
    const creatures = this.git.getFieldByLabel('Creature List');
    const doors = this.git.getFieldByLabel('Door List');
    const encounters = this.git.getFieldByLabel('Encounter List');
    const placeables = this.git.getFieldByLabel('Placeable List');
    const sounds = this.git.getFieldByLabel('SoundList');
    const stores = this.git.getFieldByLabel('StoreList');
    const triggers = this.git.getFieldByLabel('TriggerList');
    const waypoints = this.git.getFieldByLabel('WaypointList');

    const areaPropsField = areaProps.getChildStructs()[0].getFields();
    this.audio.ambient.day = this.git.getFieldByLabel('AmbientSndDay', areaPropsField).getValue();
    this.audio.ambient.dayVolume = this.git.getFieldByLabel('AmbientSndDayVol', areaPropsField).getValue();
    this.audio.ambient.night = this.git.getFieldByLabel('AmbientSndNight', areaPropsField).getValue();
    this.audio.ambient.nightVolume = this.git.getFieldByLabel('AmbientSndNitVol', areaPropsField).getValue();
    if(areaProps.getChildStructs()[0].hasField('EnvAudio')){
      this.audio.environmentAudio = this.git.getFieldByLabel('EnvAudio', areaPropsField).getValue();
    }else{
      this.audio.environmentAudio = -1;
    }
    
    this.audio.music.battle = this.git.getFieldByLabel('MusicBattle', areaPropsField).getValue();
    this.audio.music.day = this.git.getFieldByLabel('MusicDay', areaPropsField).getValue();
    this.audio.music.delay = this.git.getFieldByLabel('MusicDelay', areaPropsField).getValue();
    this.audio.music.night = this.git.getFieldByLabel('MusicNight', areaPropsField).getValue();
    AudioEngine.GetAudioEngine().setAreaAudioProperties(this.audio);

    //Cameras
    if(cameras){
      for(let i = 0; i < cameras.childStructs.length; i++){
        const strt = cameras.childStructs[i];
        const camera = new ModuleCamera(GFFObject.FromStruct(strt) );
        this.cameras.push(camera);
      }
    }

    //AreaEffects
    if(areaEffects){
      for(let i = 0; i < areaEffects.childStructs.length; i++){
        const strt = areaEffects.childStructs[i];
        this.attachObject( new ModuleAreaOfEffect(GFFObject.FromStruct(strt)) );
      }
    }

    //Creatures
    if(creatures){
      for(let i = 0; i < creatures.childStructs.length; i++){
        const strt = creatures.childStructs[i];
        this.attachObject( new ModuleCreature(GFFObject.FromStruct(strt)) );
      }
    }

    //Triggers
    if(triggers){
      for(let i = 0; i < triggers.childStructs.length; i++){
        const strt = triggers.childStructs[i];
        this.attachObject( new ModuleTrigger(GFFObject.FromStruct(strt)) );
      }
    }

    //Encounter
    if(encounters){
      for(let i = 0; i < encounters.childStructs.length; i++){
        const strt = encounters.childStructs[i];
        this.attachObject( new ModuleEncounter(GFFObject.FromStruct(strt)) );
      }
    }

    //Doors
    if(doors){
      for(let i = 0; i < doors.childStructs.length; i++ ){
        const strt = doors.childStructs[i];
        this.attachObject( new ModuleDoor(GFFObject.FromStruct(strt)) );
      }
    }

    //Placeables
    if(placeables){
      for(let i = 0; i < placeables.childStructs.length; i++ ){
        const strt = placeables.childStructs[i];
        this.attachObject( new ModulePlaceable(GFFObject.FromStruct(strt)) );
      }
    }

    //Sounds
    if(sounds){
      for(let i = 0; i < sounds.childStructs.length; i++ ){
        const strt = sounds.childStructs[i];
        this.attachObject( new ModuleSound(GFFObject.FromStruct(strt), AudioEngine.GetAudioEngine()) );
      }
    }

    //Stores
    if(stores){
      for(let i = 0; i < stores.childStructs.length; i++ ){
        const strt = stores.childStructs[i];
        this.attachObject( new ModuleStore(GFFObject.FromStruct(strt)) );
      }
    }

    //Waypoints
    if(waypoints){
      for(let i = 0; i < waypoints.childStructs.length; i++ ){
        const strt = waypoints.childStructs[i];

        if(this.transWP){
          if(typeof this.transWP === 'string'){
            if(this.transWP.toLowerCase() == strt.getFieldByLabel('Tag').getValue().toLowerCase()){
              this.transWP = GFFObject.FromStruct(strt);
            }
          }else if(this.transWP instanceof GFFObject){
            if(this.transWP.getFieldByLabel('Tag').getValue().toLowerCase() == strt.getFieldByLabel('Tag').getValue().toLowerCase()){
              this.transWP = GFFObject.FromStruct(strt);
            }
          }
        }
        
        this.attachObject( new ModuleWaypoint(GFFObject.FromStruct(strt)) );
      }
    }

    //AreaMapData
    if(areaMap){
      const areaMapStruct = areaMap.getChildStructs()[0];
      if(areaMapStruct){
        this.areaMap.loadDataStruct(areaMapStruct);
      }
    }

    if(!(this.transWP instanceof GFFObject)){
      this.transWP = null;
    }

    if(this.git.RootNode.hasField('SWVarTable')){
      console.log("SWVarTable", this.git);
      let localBools = this.git.RootNode.getFieldByLabel('SWVarTable').getChildStructs()[0].getFieldByLabel('BitArray').getChildStructs();
      //console.log(localBools);
      for(let i = 0; i < localBools.length; i++){
        let data = localBools[i].getFieldByLabel('Variable').getValue();
        for(let bit = 0; bit < 32; bit++){
          this._locals.Booleans[bit + (i*32)] = ( (data>>bit) % 2 != 0);
        }
      }
    }

    GameState.AlphaTest = this.alphaTest;

    AudioEngine.GetAudioEngine().setReverbProfile(this.audio.environmentAudio);

    FollowerCamera.setCameraStyle(this.getCameraStyle());
    if(this.miniGame){
      FollowerCamera.setCameraFOV(this.miniGame.cameraViewAngle);
    }else{
      FollowerCamera.setCameraFOV(FollowerCamera.DEFAULT_FOV);
    }

    await this.loadVis();
    await this.loadLayout();
    await this.loadPath();
    await this.loadScripts();
    GameState.scene.fog = this.fog;

  }

  getCameraStyle(){
    const cameraStyle2DA = TwoDAManager.datatables.get('camerastyle');
    if(cameraStyle2DA){
      return cameraStyle2DA.rows[this.cameraStyle];
    }
    return cameraStyle2DA.rows[0];
  }

  async loadPath(){
    console.log('ModuleArea.loadPath');
    this.path = new ModulePath(this.name);
    try{
      await this.path.load();
    }catch(e){
      console.error(e);
    }
  }

  async loadVis(){
    console.log('ModuleArea.loadVis');
    try{
      const buffer = await ResourceLoader.loadResource(ResourceTypes.vis, this.name);
      this.visObject = new VISObject(buffer, this);
      return;
    }catch(e){
      console.error(e);
    }
    this.visObject = new VISObject(null, this);
  }

  async loadLayout(){
    console.log('ModuleArea.loadLayout');
    try{
      const buffer = await ResourceLoader.loadResource(ResourceTypes.lyt, this.name);
      this.layout = new LYTObject(buffer);

      //Resort the rooms based on the LYT file because it matches the walkmesh transition index numbers
      let sortedRooms = [];
      for(let i = 0; i < this.layout.rooms.length; i++){
        let roomLYT = this.layout.rooms[i];
        for(let r = 0; r != this.rooms.length; r++ ){
          let room = this.rooms[r];
          if(room.roomName.toLowerCase() == roomLYT.name.toLowerCase()){
            room.position.copy(roomLYT.position);
            sortedRooms.push(room);
          }
        }
      }

      this.rooms = sortedRooms;

      for(let i = 0; i < this.layout.doorhooks.length; i++){
        let _doorHook = this.layout.doorhooks[i];
        this.doorhooks.push(_doorHook);
      }

      if(this.miniGame){
        for(let i = 0; i < this.layout.tracks.length; i++){
          this.miniGame.tracks.push(new ModuleMGTrack(this.layout.tracks[i]));
        }
  
        for(let i = 0; i < this.layout.obstacles.length; i++){
          this.miniGame.obstacles.push(new ModuleMGObstacle(undefined, this.layout.obstacles[i]));
        }
      }

      //Room Linking Pass 1
      for(let ri = 0; ri < this.rooms.length; ri++ ){
        let room = this.rooms[ri];
        let linked_rooms = [];
        if(this.visObject.GetRoom(room.roomName)){
          linked_rooms = this.visObject.GetRoom(room.roomName).rooms;
        }
        room.setLinkedRooms(linked_rooms);
      }
    }catch(e){
      console.error(e);
      this.layout = new LYTObject();
    }
  }

  cleanupUninitializedObjects(){

    let i = this.creatures.length
    while (i--) {
      if (!(this.creatures[i] instanceof ModuleCreature) || !this.creatures[i].initialized) { 
        this.creatures.splice(i, 1);
      } 
    }

    i = this.placeables.length
    while (i--) {
      if (!(this.placeables[i] instanceof ModulePlaceable) || !this.placeables[i].initialized) { 
        this.placeables.splice(i, 1);
      } 
    }

    i = this.doors.length
    while (i--) {
      if (!(this.doors[i] instanceof ModuleDoor) || !this.doors[i].initialized) { 
        this.doors.splice(i, 1);
      } 
    }

    i = this.sounds.length
    while (i--) {
      if (!(this.sounds[i] instanceof ModuleSound) || !this.sounds[i].initialized) { 
        this.sounds.splice(i, 1);
      } 
    }

    i = this.waypoints.length
    while (i--) {
      if (!(this.waypoints[i] instanceof ModuleWaypoint) || !this.waypoints[i].initialized) { 
        this.waypoints.splice(i, 1);
      } 
    }

    i = this.triggers.length
    while (i--) {
      if (!(this.triggers[i] instanceof ModuleTrigger) || !this.triggers[i].initialized) { 
        this.triggers.splice(i, 1);
      } 
    }

    i = this.stores.length
    while (i--) {
      if (!(this.stores[i] instanceof ModuleStore) || !this.stores[i].initialized) { 
        this.stores.splice(i, 1);
      } 
    }

  }

  async loadScene(){
    try{
      try{
        MenuManager.InGameOverlay.miniMap.setAreaMap(this.areaMap);
        MenuManager.InGameOverlay.SetMapTexture('lbl_map'+this.name);
        MenuManager.MenuMap.miniMap.setAreaMap(this.areaMap);
        MenuManager.MenuMap.SetMapTexture('lbl_map'+this.name);
      }catch(e){
        console.error(e);
      }

      try { await this.loadRooms(); } catch(e){ console.error(e); }

      MenuManager.LoadScreen.setProgress(10);
      
      try { await this.loadPlayer(); } catch(e){ console.error(e); }

      try { await this.loadCameras(); } catch(e){ console.error(e); }

      try { await this.loadPlaceables(); } catch(e){ console.error(e); }

      MenuManager.LoadScreen.setProgress(20);

      try { await this.loadWaypoints(); } catch(e){ console.error(e); }

      MenuManager.LoadScreen.setProgress(30);

      try { await this.loadAreaEffects(); } catch(e){ console.error(e); }
      try { await this.loadCreatures(); } catch(e){ console.error(e); }
      try { await this.loadParty(); } catch(e){ console.error(e); }

      MenuManager.LoadScreen.setProgress(40);

      try { await this.loadsounds(); } catch(e){ console.error(e); }

      MenuManager.LoadScreen.setProgress(50);

      try { await this.loadTriggers(); } catch(e){ console.error(e); }

      try { await this.loadEncounters(); } catch(e){ console.error(e); }

      MenuManager.LoadScreen.setProgress(60);

      if(this.miniGame){
        try { await this.miniGame.load(); } catch(e){ console.error(e); }
      }

      MenuManager.LoadScreen.setProgress(70);

      try { await this.loadDoors(); } catch(e){ console.error(e); }

      try { await this.loadStores(); } catch(e){ console.error(e); }

      MenuManager.LoadScreen.setProgress(80);

      MenuManager.LoadScreen.setProgress(90);

      try { await this.loadAmbientAudio(); } catch(e){ console.error(e); }
      try { await this.loadBackgroundMusic(); } catch(e){ console.error(e); }

      MenuManager.LoadScreen.setProgress(100);

      FollowerCamera.facing = Utility.NormalizeRadian(GameState.player.getFacing() - Math.PI/2);

      try { await this.weather.load(); } catch(e){ console.error(e); }

      this.transWP = null;

      this.cleanupUninitializedObjects();
      this.detectRoomObjects();
    }catch(e){
      console.error(e);
    }
  }

  getSpawnLocation(): EngineLocation {
    if(GameState.isLoadingSave){
      return new EngineLocation(
        PartyManager.PlayerTemplate.RootNode.getFieldByLabel('XPosition').getValue(),
        PartyManager.PlayerTemplate.RootNode.getFieldByLabel('YPosition').getValue(),
        PartyManager.PlayerTemplate.RootNode.getFieldByLabel('ZPosition').getValue(),
        PartyManager.PlayerTemplate.RootNode.getFieldByLabel('XOrientation').getValue(),
        PartyManager.PlayerTemplate.RootNode.getFieldByLabel('YOrientation').getValue(),
        0
      );
    }else if(this.transWP instanceof GFFObject){
      console.log('TransWP', this.transWP);
      return new EngineLocation(
        this.transWP.RootNode.getFieldByLabel('XPosition').getValue(),
        this.transWP.RootNode.getFieldByLabel('YPosition').getValue(),
        this.transWP.RootNode.getFieldByLabel('ZPosition').getValue(),
        this.transWP.RootNode.getFieldByLabel('XOrientation').getValue(),
        this.transWP.RootNode.getFieldByLabel('YOrientation').getValue(),
        0
      );
    }else{
      console.log('No TransWP');
      return new EngineLocation(
        this.module.entryX,
        this.module.entryY,
        this.module.entryZ,
        this.module.entryDirectionX,
        this.module.entryDirectionY,
        0
      );
    }
  }

  getPlayerTemplate(): GFFObject {
    if(PartyManager.PlayerTemplate){
      PartyManager.PlayerTemplate.RootNode.addField( new GFFField(GFFDataType.DWORD, 'ObjectId') ).setValue( ModuleObjectManager.GetNextPlayerId() );
      return PartyManager.PlayerTemplate;
    }else{
      return PartyManager.ResetPlayerTemplate();
    }
  }

  attachObject(object: ModuleObject){
    if(!object) return;
    object.area = this;

    if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleCreature)){
      this.creatures.push(object as ModuleCreature);
    }

    if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModulePlaceable)){
      this.placeables.push(object as ModulePlaceable);
    }

    if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleDoor)){
      this.doors.push(object as ModuleDoor);
    }

    if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleTrigger)){
      this.triggers.push(object as ModuleTrigger);
    }

    if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleEncounter)){
      this.encounters.push(object as ModuleEncounter);
    }

    if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleStore)){
      this.stores.push(object as ModuleStore);
    }

    if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleWaypoint)){
      this.waypoints.push(object as ModuleWaypoint);
    }

    if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleSound)){
      this.sounds.push(object as ModuleSound);
    }

    if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleAreaOfEffect)){
      this.areaOfEffects.push(object as ModuleAreaOfEffect);
    }
  }

  detachObject(object: ModuleObject){
    if(!object) return;

    object.area = undefined;

    if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleCreature)){
      const idx = this.creatures.indexOf(object as ModuleCreature);
      if(idx >= 0){
        this.creatures.splice(idx, 1);
      }
    }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModulePlaceable)){
      const idx = this.placeables.indexOf(object as ModulePlaceable);
      if(idx >= 0){
        this.placeables.splice(idx, 1);
      }
    }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleDoor)){
      const idx = this.doors.indexOf(object as ModuleDoor);
      if(idx >= 0){
        this.doors.splice(idx, 1);
      }
    }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleTrigger)){
      const idx = this.triggers.indexOf(object as ModuleTrigger);
      if(idx >= 0){
        this.triggers.splice(idx, 1);
      }
    }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleEncounter)){
      const idx = this.encounters.indexOf(object as ModuleEncounter);
      if(idx >= 0){
        this.encounters.splice(idx, 1);
      }
    }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleStore)){
      const idx = this.stores.indexOf(object as ModuleStore);
      if(idx >= 0){
        this.stores.splice(idx, 1);
      }
    }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleWaypoint)){
      const idx = this.waypoints.indexOf(object as ModuleWaypoint);
      if(idx >= 0){
        this.waypoints.splice(idx, 1);
      }
    }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleSound)){
      const idx = this.sounds.indexOf(object as ModuleSound);
      if(idx >= 0){
        this.sounds.splice(idx, 1);
      }
    }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleAreaOfEffect)){
      const idx = this.areaOfEffects.indexOf(object as ModuleAreaOfEffect);
      if(idx >= 0){
        this.areaOfEffects.splice(idx, 1);
      }
    }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleItem)){
      const idx = this.items.indexOf(object as ModuleItem);
      if(idx >= 0){
        this.items.splice(idx, 1);
      }
    }else{
      console.warn(`destroyObject: unhandled objectType, ${object.objectType}`);
    }
  }

  async loadPlayer(): Promise<void> {
    console.log('Loading Player', GameState.player)
    try{
      if(GameState.player instanceof ModuleCreature){
        GameState.player.partyID = -1;

        if(!this.miniGame){
          PartyManager.party[ PartyManager.GetCreatureStartingPartyIndex(GameState.player) ] = GameState.player;
          GameState.group.party.add( GameState.player.container );
        }

        //Reset the players actions between modules
        GameState.player.clearAllActions();
        GameState.player.force = 0;
        GameState.player.collisionData.groundFace = undefined;
        GameState.player.collisionData.lastGroundFace = undefined;
        GameState.player.load();
        try{
          const model = await GameState.player.loadModel();
          GameState.player.model = model;
          GameState.player.model.hasCollision = true;
          //let spawnLoc = this.getSpawnLocation();
          let spawnLoc = PartyManager.GetSpawnLocation(GameState.player);
          GameState.player.position.copy(spawnLoc.position);
          GameState.player.setFacing(-Math.atan2(spawnLoc.rotation.x, spawnLoc.rotation.y), true);

          GameState.player.getCurrentRoom();
          // GameState.player.computeBoundingBox(true);
        }catch(e){
          console.error(e);
        }
      }else{
        let player = new ModulePlayer( this.getPlayerTemplate() );
        player.partyID = -1;
        
        player.load();
        GameState.player = player;
      
        if(!this.miniGame){
          PartyManager.party[ PartyManager.GetCreatureStartingPartyIndex(player) ] = player;
          GameState.group.party.add( player.container );
        }

        try{
          const model = await player.loadModel();
          model.userData.moduleObject = player;
          model.hasCollision = true;

          let spawnLoc = this.getSpawnLocation();

          player.position.copy(spawnLoc.position);
          player.setFacing(-Math.atan2(spawnLoc.rotation.x, spawnLoc.rotation.y), true);
          //player.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), -Math.atan2(spawnLoc.XOrientation, spawnLoc.YOrientation));

          player.getCurrentRoom();
          player.computeBoundingBox(true);
        }catch(e){
          console.error(e);
        }
      }
    }catch(e){
      console.error(e);
    }
  }

  /**
   * Load the active party members
   */
  async loadParty(): Promise<void> {
    console.log('Loading Party Member');
    for(let i = 0; i < PartyManager.CurrentMembers.length; i++){
      await PartyManager.LoadPartyMember(i);
    }
  }

  /**
   * Load the area's static cameras
   */
  async loadCameras(){
    console.log('Loading Cameras');
    for(let i = 0; i < this.cameras.length; i++){
      const camera = this.cameras[i];
      camera.load();
      GameState.staticCameras.push(camera.perspectiveCamera);
    }
  }

  /**
   * Load the area's rooms
   */
  async loadRooms(): Promise<void> {
    console.log('Loading Rooms');
    for(let i = 0; i < this.rooms.length; i++){
      const room = this.rooms[i];
      const model = await room.loadModel();
      if(model instanceof OdysseyModel3D){
        if(room.collisionData.walkmesh instanceof OdysseyWalkMesh){
          GameState.walkmeshList.push( room.collisionData.walkmesh.mesh );
          GameState.group.room_walkmeshes.add( room.collisionData.walkmesh.mesh );
        }

        if(typeof model.walkmesh != 'undefined'){
          GameState.collisionList.push(model.walkmesh);
        }
        
        model.name = room.roomName;
        GameState.group.rooms.add(room.container);

        room.computeBoundingBox();
        room.model.updateMatrix();
      }
    }

    for(let j = 0; j < this.rooms.length; j++){
      this.rooms[j].link_rooms(this.rooms);
    }

    //Room Linking Pass 2
    for(let i = 0, iLen = this.rooms.length; i < iLen; i++ ){
      let room1 = this.rooms[i];
      //console.log(room1.linked_rooms);
      //Look for all rooms that can see this room
      for(let j = 0, jLen = this.rooms.length; j < jLen; j++){
        let room2 = this.rooms[j];
        //console.log(room2.linked_rooms);
        if(room2 instanceof ModuleRoom){
          let room2_links_to_room1 = room2.linked_rooms.indexOf(room1) >= 0;
          let room1_links_to_room2 = room1.linked_rooms.indexOf(room2) >= 0;

          let should_link = room2_links_to_room1 || room1_links_to_room2;
          //console.log('room', room1.roomName, room2.roomName, should_link);
          if(should_link && room1.linked_rooms.indexOf(room2) == -1 ){
            room1.linked_rooms.push(room2);
          }

          if(should_link && room2.linked_rooms.indexOf(room1) == -1 ){
            room2.linked_rooms.push(room1);
          }
        }
      }
      this.walkmesh_rooms = [room1].concat(room1.linked_rooms);
    }
  }

  /**
   * Load the area's doors
   */
  async loadDoors(): Promise<void> {
    console.log('Loading Doors');
    for(let i = 0; i < this.doors.length; i++){
      const door = this.doors[i];
      try{
        door.load();
        // door.position.x = door.getX();
        // door.position.y = door.getY();
        // door.position.z = door.getZ();
        door.rotation.set(0, 0, door.getBearing());
        const model = await door.loadModel();
        door.computeBoundingBox();
        const dwk = await door.loadWalkmesh(model.name);

        try{
          model.userData.walkmesh = dwk;
          door.collisionData.walkmesh = dwk;
          GameState.walkmeshList.push( dwk.mesh );

          if(dwk.mesh instanceof THREE.Object3D){
            dwk.mat4.makeRotationFromEuler(door.rotation);
            dwk.mat4.setPosition( door.position.x, door.position.y, door.position.z);
            dwk.mesh.geometry.applyMatrix4(dwk.mat4);
            dwk.updateMatrix();
            //dwk.mesh.position.copy(door.position);
            // if(!door.isOpen()){
            //   GameState.group.room_walkmeshes.add( dwk.mesh );
            // }
          }
        }catch(e){
          console.error('Failed to add dwk', model.name, dwk, e);
        }

        if(door.model instanceof OdysseyModel3D){
          door.box.setFromObject(door.model);
        }

        if(door.openState){
          door.model.playAnimation('opened1', true);
        }
        door.getCurrentRoom();
        GameState.group.doors.add( door.container );
      }catch(e){
        console.error(e);
      }
    }
  }

  /**
   * Load the area's placeables
   */
  async loadPlaceables(): Promise<void> {
    console.log('Loading Placeables');
    for(let i = 0; i < this.placeables.length; i++){
      const plc = this.placeables[i];
      plc.load();
      plc.position.set(plc.getX(), plc.getY(), plc.getZ());
      plc.rotation.set(0, 0, plc.getBearing());
      const model = await plc.loadModel();
      GameState.group.placeables.add( plc.container );
      const pwk = await plc.loadWalkmesh(model.name);
      GameState.walkmeshList.push( pwk.mesh );
      plc.computeBoundingBox();

      if(pwk.mesh instanceof THREE.Object3D){
        pwk.mat4.makeRotationFromEuler(plc.rotation);
        pwk.mat4.setPosition( plc.position.x, plc.position.y, plc.position.z + .01 );
        pwk.mesh.geometry.applyMatrix4(pwk.mat4);
        pwk.updateMatrix();
        //pwk.mesh.position.copy(plc.position);
        GameState.group.room_walkmeshes.add( pwk.mesh );
      }

      plc.getCurrentRoom();
      plc.position.set(plc.getX(), plc.getY(), plc.getZ());
      plc.computeBoundingBox();
    }
  }

  /**
   * Load the area's waypoints
   */
  async loadWaypoints(): Promise<void> {
    console.log('Loading Waypoints');
    for(let i = 0; i < this.waypoints.length; i++){
      const waypnt = this.waypoints[i];
      waypnt.load();
      const wpObj = new THREE.Object3D();
      wpObj.name = waypnt.getTag();
      wpObj.position.copy(waypnt.position);
      wpObj.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.atan2(-waypnt.getYOrientation(), -waypnt.getXOrientation()));
      waypnt.rotation.z = Math.atan2(-waypnt.getYOrientation(), -waypnt.getXOrientation()) + Math.PI/2;
      GameState.group.waypoints.add(wpObj);

      let _distance = 1000000000;
      let _currentRoom = null;
      let roomCenter = new THREE.Vector3();
      for(let i = 0; i < GameState.group.rooms.children.length; i++){
        let room = GameState.group.rooms.children[i];
        if(room instanceof OdysseyModel3D){
          if(room.box.containsPoint(wpObj.position)){
            room.box.getCenter(roomCenter);
            let distance = wpObj.position.distanceTo(roomCenter);
            if(distance < _distance){
              _distance = distance;
              _currentRoom = room;
            }
          }
        }
      }
      wpObj.userData.area = _currentRoom;
      this.areaMap.addMapNote(waypnt);
    }
  }

  /**
   * Load the area's encounters
   */
  async loadEncounters(): Promise<void> {
    console.log('Loading Encounters');
    for(let i = 0; i < this.encounters.length; i++){
      const encounter = this.encounters[i];
      try{
        encounter.load();
        let _distance = 1000000000;
        let _currentRoom = null;
        let roomCenter = new THREE.Vector3();
        for(let i = 0; i < GameState.group.rooms.children.length; i++){
          let room = GameState.group.rooms.children[i];
          if(room instanceof OdysseyModel3D){
            if(room.box.containsPoint(encounter.mesh.position)){
              room.box.getCenter(roomCenter);
              let distance = encounter.mesh.position.distanceTo(roomCenter);
              if(distance < _distance){
                _distance = distance;
                _currentRoom = room;
              }
            }
          }
        }
        encounter.mesh.userData.area = _currentRoom;
      }catch(e){
        console.error(e);
      }
    }
  }

  /**
   * Load the area's Area of Effects
   */
  async loadAreaEffects(): Promise<void> {
    console.log('Loading AreaEffects');
    for(let i = 0; i < this.areaOfEffects.length; i++){
      try{
        const aoe = this.areaOfEffects[i];
        aoe.load();
        GameState.group.effects.add( aoe.container );
      }catch(e){
        console.error(e);
      }
    }
  }

  /**
   * Load the area's triggers
   */
  async loadTriggers(): Promise<void> {
    console.log('Loading Triggers');
    for(let i = 0; i < this.triggers.length; i++){
      try{
        const trig = this.triggers[i];
        trig.load();
        let _distance = 1000000000;
        let _currentRoom = null;
        let roomCenter = new THREE.Vector3();
        for(let i = 0; i < GameState.group.rooms.children.length; i++){
          let room = GameState.group.rooms.children[i];
          if(room instanceof OdysseyModel3D){
            if(room.box.containsPoint(trig.mesh.position)){
              room.box.getCenter(roomCenter);
              let distance = trig.mesh.position.distanceTo(roomCenter);
              if(distance < _distance){
                _distance = distance;
                _currentRoom = room;
              }
            }
          }
        }
        trig.mesh.userData.area = _currentRoom;
      }catch(e){
        console.error(e);
      }
    }
  }

  /**
   * Load the area's creatures
   */
  async loadCreatures(): Promise<void> {
    console.log('Loading Creatures');
    for(let i = 0; i < this.creatures.length; i++){
      try{
        const creature = this.creatures[i];
        creature.load();
        const model = await creature.loadModel();
        creature.model.userData.moduleObject = creature;
        
        //creature.setFacing(Math.atan2(creature.getXOrientation(), creature.getYOrientation()) + Math.PI/2, true);
        creature.setFacing(-Math.atan2(creature.getXOrientation(), creature.getYOrientation()), true);

        model.hasCollision = true;
        model.name = creature.getTag();
        GameState.group.creatures.add( creature.container );

        creature.getCurrentRoom();
        creature.updateCollision(0.0000000000000000000001);
        creature.update(0.0000000000000000000001);
        creature.computeBoundingBox();
      }catch(e){
        console.error(e);
      }
    }
  }

  /**
   * Load the area's stores
   */
  async loadStores(): Promise<void> {
    console.log('Loading Stores');
    for(let i = 0; i < this.stores.length; i++){
      try{
        const store = this.stores[i];
        store.load();
      }catch(e){
        console.error(e);
      }
    }
  }

  /**
   * Load the area's sounds
   */
  async loadsounds(): Promise<void> {
    console.log('Loading Sound Emitter');
    for(let i = 0; i < this.sounds.length; i++){
      try{
        const sound = this.sounds[i];
        sound.load();
        await sound.loadSound();
      }catch(e){
        console.error(e);
      }
    }
  }

  /**
   * Load the area's ambient audio
   */
  async loadAmbientAudio(): Promise<void> {
    const ambientsound2DA = TwoDAManager.datatables.get('ambientsound');
    if(!ambientsound2DA){ return; }

    const ambientDay = ambientsound2DA.rows[this.audio.ambient.day].resource;
    try{
      const data = await AudioLoader.LoadAmbientSound(ambientDay);
      //console.log('Loaded Ambient Sound', ambientDay);
      AudioEngine.GetAudioEngine().setAmbientSound(data);
    }catch(e){
      console.error('Ambient Audio not found', ambientDay);
    }
  }

  /**
   * Load the area's background music
   */
  async loadBackgroundMusic(): Promise<void> {
    const ambientmusic2DA = TwoDAManager.datatables.get('ambientmusic');
    if(!ambientmusic2DA){ return; }

    const bgMusic = ambientmusic2DA.rows[this.audio.music.day].resource;
    try{
      const data = await AudioLoader.LoadMusic(bgMusic);
      //console.log('Loaded Background Music', bgMusic);
      AudioEngine.GetAudioEngine().setBackgroundMusic(data);
    }catch(e){
      console.log('Background Music not found', bgMusic);
      console.error(e);
    }
  }

  /**
   * Load the area's scripts
   */
  async loadScripts(){
    console.log('ModuleArea.loadScripts');

    const scriptKeys = Array.from(this.scriptResRefs.keys());
    const scriptResRefs = Array.from(this.scriptResRefs.values());
    for(let i = 0; i < scriptResRefs.length; i++){
      const resRef = scriptResRefs[i];
      if(!resRef){ continue; }

      const key = scriptKeys[i];
      const script = NWScript.Load(resRef);
      if(!script){ continue; }

      if(key == 'OnEnter'){
        this.scripts.onEnter = script;
      }else if(key == 'OnExit'){
        this.scripts.onExit = script;
      }else if(key == 'OnHeartbeat'){
        this.scripts.onHeartbeat = script;
      }else if(key == 'OnUserDefined'){
        this.scripts.onUserDefined = script;
      }
    }
  }

  async initAreaObjects(runSpawnScripts = false){
    for(let i = 0; i < this.doors.length; i++){
      if(this.doors[i] instanceof ModuleObject){
        this.doors[i].onSpawn(runSpawnScripts);
      }
    }

    for(let i = 0; i < this.placeables.length; i++){
      if(this.placeables[i] instanceof ModuleObject){
        this.placeables[i].onSpawn(runSpawnScripts);
      }
    }

    for(let i = 0; i < this.triggers.length; i++){
      if(this.triggers[i] instanceof ModuleObject){
        this.triggers[i].onSpawn(runSpawnScripts);
      }
    }

    for(let i = 0; i < this.waypoints.length; i++){
      if(this.waypoints[i] instanceof ModuleObject){
        this.waypoints[i].onSpawn(runSpawnScripts);
      }
    }

    for(let i = 0; i < this.creatures.length; i++){
      if(this.creatures[i] instanceof ModuleObject){
        this.creatures[i].onSpawn(runSpawnScripts);
      }
    }

    for(let i = 0; i < PartyManager.party.length; i++){
      if(PartyManager.party[i] instanceof ModuleObject){
        PartyManager.party[i].onSpawn(runSpawnScripts);
      }
    }

    if(this.miniGame){
      this.miniGame.initMiniGameObjects();
    }

    this.runStartScripts();
  }

  runOnEnterScripts(){
    if(this.scripts.onEnter instanceof NWScriptInstance){
      console.log('onEnter', this.scripts.onEnter, GameState.player)
      this.scripts.onEnter.enteringObject = GameState.player;
      this.scripts.onEnter.debug.action = true;
      this.scripts.onEnter.run(this, 0);
    }
  }

  async runStartScripts(){
    if(this.miniGame) this.miniGame.runMiniGameScripts();
    this.runOnEnterScripts();
  }

  detectRoomObjects(){
    for(let i = 0, len = this.rooms.length; i < len; i++){
      this.rooms[i].detectChildObjects();
    }
  }

  isPointWalkable(point: any){
    for(let i = 0, len = this.rooms.length; i < len; i++){
      if(this.rooms[i].collisionData.walkmesh && this.rooms[i].collisionData.walkmesh.isPointWalkable(point)){
        return true;
      }
    }
    return false;
  }

  getNearestWalkablePoint(point: any){
    let nearest = Infinity;
    let nearest_point = undefined;

    let p = undefined;
    let p_dist = 0;
    for(let i = 0, len = this.rooms.length; i < len; i++){
      if(this.rooms[i].collisionData.walkmesh){
        p = this.rooms[i].collisionData.walkmesh.getNearestWalkablePoint(point);
        if(p){
          p_dist = p.distanceTo(point);
          if(p_dist < nearest){
            nearest_point = p;
            nearest = p_dist;
          }
        }
      }
    }
    return nearest_point;
  }

  setRestrictMode( restrictMode = 0 ){
    this.restrictMode = restrictMode;
  }

  toolsetExportARE(){
    let are = new GFFObject();
    are.FileType = 'ARE ';
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'AlphaTest', this.alphaTest)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.INT, 'CameraStyle', this.cameraStyle)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.INT, 'ChanceLightning', this.weather.chanceLightning)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.INT, 'ChanceRain', this.weather.chanceRain)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.INT, 'ChanceSnow', this.weather.chanceSnow)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.CEXOSTRING, 'Comments', this.comments)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.INT, 'Creator_ID', this.creatorId)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'DayNightCycle', this.dayNightCycle)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.RESREF, 'DefaultEnvMap', this.defaultEnvMap)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'DynAmbientColor', this.dynamicAmbientColor)
    );

    are.RootNode.addField(
      new GFFField(GFFDataType.LIST, 'Expansion_List')
    );

    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'Flags', this.flags)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'Grass_Ambient', this.grass.ambient)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'Grass_Density', this.grass.density)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'Grass_Diffuse', this.grass.diffuse)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'Grass_Prob_LL', this.grass.probability.lowerLeft)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'Grass_Prob_LR', this.grass.probability.lowerRight)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'Grass_Prob_UL', this.grass.probability.upperLeft)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'Grass_Prob_UR', this.grass.probability.upperRight)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'Grass_QuadSize', this.grass.quadSize)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.RESREF, 'Grass_TexName', this.grass.textureName)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.INT, 'ID', this.id)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'IsNight', this.isNight)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'LightingScheme', this.lightingScheme)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.WORD, 'LoadScreenID', this.loadScreenId)
    );

    let mapField = new GFFField(GFFDataType.STRUCT, 'Map');
    mapField.addChildStruct(this.areaMap.export());
    are.RootNode.addField(mapField);


    are.RootNode.addField(
      new GFFField(GFFDataType.INT, 'ModListenCheck', this.modListenCheck)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.INT, 'ModSpotCheck', this.modSpotCheck)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'MoonAmbientColor', this.moon.ambientColor)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'MoonDiffuseColor', this.moon.diffuseColor)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'MoonFogColor', this.moon.fogColor)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'MoonFogFar', this.moon.fogFar)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'MoonFogNear', this.moon.fogNear)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'MoonFogOn', this.moon.fogOn)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'MoonShadows', this.moon.shadows)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.CEXOLOCSTRING, 'Name').setCExoLocString(this.areaName)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'NoHangBack', this.noHangBack ? 1 : 0)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'NoRest', this.noRest ? 1 : 0)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.RESREF, 'OnEnter', this.scriptResRefs.get('OnEnter'))
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.RESREF, 'OnExit', this.scriptResRefs.get('OnExit'))
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.RESREF, 'OnHeartbeat', this.scriptResRefs.get('OnHeartbeat'))
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.RESREF, 'OnUserDefined', this.scriptResRefs.get('OnUserDefined'))
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'PlayerOnly', this.playerOnly ? 1 : 0)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'PlayerVsPlayer', this.playerVsPlayer ? 1 : 0)
    );

    let roomsField = new GFFField(GFFDataType.LIST, 'Rooms');
    for(let i = 0, len = this.rooms.length; i < len; i++){
      roomsField.addChildStruct(this.rooms[i].toToolsetInstance());
    }
    are.RootNode.addField(roomsField);

    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'ShadowOpacity', this.shadowOpacity)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'StealthXPEnabled', this.stealthXPEnabled)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'StealthXPLoss', this.stealthXPLoss)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'StealthXPMax', this.stealthXPMax)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'SunAmbientColor', this.sun.ambientColor)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'SunDiffuseColor', this.sun.diffuseColor)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'SunFogColor', this.sun.fogColor)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'SunFogFar', this.sun.fogFar)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.FLOAT, 'SunFogNear', this.sun.fogNear)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'SunFogOn', this.sun.fogOn)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'SunShadows', this.sun.shadows)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.RESREF, 'Tag', this.tag)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.BYTE, 'Unescapable', this.unescapable)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.DWORD, 'Version', this.version)
    );
    are.RootNode.addField(
      new GFFField(GFFDataType.INT, 'WindPower', this.windPower)
    );

    return are;

  }

  getAreaPropertiesStruct(){
    let struct = new GFFStruct();
    struct.addField( new GFFField(GFFDataType.INT, 'AmbientSndDay') ).setValue(this.audio.ambient.day);
    struct.addField( new GFFField(GFFDataType.INT, 'AmbientSndDayVol') ).setValue(this.audio.ambient.dayVolume);
    struct.addField( new GFFField(GFFDataType.INT, 'AmbientSndNight') ).setValue(this.audio.ambient.night);
    struct.addField( new GFFField(GFFDataType.INT, 'AmbientSndNitVol') ).setValue(this.audio.ambient.nightVolume);
    struct.addField( new GFFField(GFFDataType.INT, 'EnvAudio') ).setValue(this.audio.environmentAudio);
    
    struct.addField( new GFFField(GFFDataType.INT, 'MusicBattle') ).setValue(this.audio.music.battle);
    struct.addField( new GFFField(GFFDataType.INT, 'MusicDay') ).setValue(this.audio.music.day);
    struct.addField( new GFFField(GFFDataType.INT, 'MusicDelay') ).setValue(this.audio.music.delay);
    struct.addField( new GFFField(GFFDataType.INT, 'MusicNight') ).setValue(this.audio.music.night);

    struct.addField( new GFFField(GFFDataType.BYTE, 'RestrictMode') ).setValue(this.restrictMode ? 1 : 0);
    struct.addField( new GFFField(GFFDataType.DWORD, 'StealthXPCurrent') ).setValue(0);
    struct.addField( new GFFField(GFFDataType.BYTE, 'StealthXPLoss') ).setValue(0);
    struct.addField( new GFFField(GFFDataType.DWORD, 'StealthXPMax') ).setValue(0);
    struct.addField( new GFFField(GFFDataType.DWORD, 'SunFogColor') ).setValue(0);
    
    struct.addField( new GFFField(GFFDataType.BYTE, 'TransPendCurrID') ).setValue(0);
    struct.addField( new GFFField(GFFDataType.BYTE, 'TransPendNextID') ).setValue(0);
    struct.addField( new GFFField(GFFDataType.BYTE, 'TransPending') ).setValue(0);
    struct.addField( new GFFField(GFFDataType.BYTE, 'Unescapable') ).setValue(this.unescapable);
    return struct;
  }

  saveAreaListStruct(){
    let areaStruct = new GFFStruct();
    areaStruct.addField( new GFFField(GFFDataType.RESREF, 'Area_Name') ).setValue(this.name);
    areaStruct.addField( new GFFField(GFFDataType.DWORD, 'ObjectId') ).setValue(this.id);
    //unescapable
    return areaStruct;
  }

  save(): { git: GFFObject, are: GFFObject }{
    const git = new GFFObject();
    git.FileType = 'GIT ';

    const aoeList = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'AreaEffectList') );
    for(let i = 0; i < this.areaOfEffects.length; i++){
      aoeList.addChildStruct( this.areaOfEffects[i].save().RootNode );
    }

    const areaMapField = git.RootNode.addField( new GFFField(GFFDataType.STRUCT, 'AreaMap') );
    areaMapField.addChildStruct( this.areaMap.exportData() );

    const areaPropertiesField = git.RootNode.addField( new GFFField(GFFDataType.STRUCT, 'AreaProperties') );
    areaPropertiesField.addChildStruct( this.getAreaPropertiesStruct() );

    const cameraList = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'CameraList') );
    for(let i = 0; i < this.cameras.length; i++){
      cameraList.addChildStruct( this.cameras[i].save().RootNode );
    }

    const creatureList = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'Creature List') );
    for(let i = 0; i < this.creatures.length; i++){
      creatureList.addChildStruct( this.creatures[i].save().RootNode );
    }

    git.RootNode.addField( new GFFField(GFFDataType.LIST, 'CurrentWeather') ).setValue(this.weather.currentWeather);

    const doorList = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'Door List') );
    for(let i = 0; i < this.doors.length; i++){
      doorList.addChildStruct( this.doors[i].save().RootNode );
    }

    const encounterList = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'Encounter List') );
    for(let i = 0; i < this.encounters.length; i++){
      encounterList.addChildStruct( this.encounters[i].save().RootNode );
    }

    //Area Items List
    const list = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'List') );

    const placeableList = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'Placeable List') );
    for(let i = 0; i < this.placeables.length; i++){
      placeableList.addChildStruct( this.placeables[i].save().RootNode );
    }

    //SWVarTable
    const swVarTable = git.RootNode.addField( new GFFField(GFFDataType.STRUCT, 'SWVarTable') );
    swVarTable.addChildStruct( this.getSWVarTableSaveStruct() );

    const soundList = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'SoundList') );
    for(let i = 0; i < this.sounds.length; i++){
      soundList.addChildStruct( this.sounds[i].save().RootNode );
    }

    const storeList = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'StoreList') );
    for(let i = 0; i < this.stores.length; i++){
      storeList.addChildStruct( this.stores[i].save().RootNode );
    }
    
    git.RootNode.addField( new GFFField(GFFDataType.BYTE, 'TransPendCurrID') ).setValue(0);
    git.RootNode.addField( new GFFField(GFFDataType.BYTE, 'TransPendNextID') ).setValue(0);
    git.RootNode.addField( new GFFField(GFFDataType.BYTE, 'TransPending') ).setValue(0);

    const triggerList = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'TriggerList') );
    for(let i = 0; i < this.triggers.length; i++){
      triggerList.addChildStruct( this.triggers[i].save().RootNode );
    }

    git.RootNode.addField( new GFFField(GFFDataType.LIST, 'VarTable') );

    const waypointList = git.RootNode.addField( new GFFField(GFFDataType.LIST, 'WaypointList') );
    for(let i = 0; i < this.waypoints.length; i++){
      waypointList.addChildStruct( this.waypoints[i].save().RootNode );
    }
    
    git.RootNode.addField( new GFFField(GFFDataType.BYTE, 'WeatherStarted') ).setValue(this.weather.started ? 1 : 0);

    this.git = git;

    this.are.FileType = 'ARE ';

    return {git: git, are: this.are};
  }
  
  toolsetExportGIT(){
    let git = new GFFObject();
    git.FileType = 'GIT ';

    let areaPropertiesStruct = new GFFStruct(14);
    areaPropertiesStruct.addField( new GFFField(GFFDataType.INT, 'AmbientSndDay') ).setValue(this.audio.ambient.day);
    areaPropertiesStruct.addField( new GFFField(GFFDataType.INT, 'AmbientSndDayVol') ).setValue(this.audio.ambient.dayVolume);
    areaPropertiesStruct.addField( new GFFField(GFFDataType.INT, 'AmbientSndNight') ).setValue(this.audio.ambient.night);
    areaPropertiesStruct.addField( new GFFField(GFFDataType.INT, 'AmbientSndNitVol') ).setValue(this.audio.ambient.nightVolume);
    areaPropertiesStruct.addField( new GFFField(GFFDataType.INT, 'EnvAudio') ).setValue(this.audio.environmentAudio);
    areaPropertiesStruct.addField( new GFFField(GFFDataType.INT, 'MusicBattle') ).setValue(this.audio.music.battle);
    areaPropertiesStruct.addField( new GFFField(GFFDataType.INT, 'MusicDay') ).setValue(this.audio.music.day);
    areaPropertiesStruct.addField( new GFFField(GFFDataType.INT, 'MusicDelay') ).setValue(this.audio.music.delay);
    areaPropertiesStruct.addField( new GFFField(GFFDataType.INT, 'MusicNight') ).setValue(this.audio.music.night);

    let areaPropertiesField = new GFFField(GFFDataType.STRUCT, 'AreaProperties');
    areaPropertiesField.addChildStruct(areaPropertiesStruct);
    git.RootNode.addField(areaPropertiesField);

    let camerasField = new GFFField(GFFDataType.LIST, 'CameraList');
    for(let i = 0, len = this.cameras.length; i < len; i++){
      camerasField.addChildStruct(this.cameras[i].toToolsetInstance());
    }
    git.RootNode.addField(camerasField);

    let creaturesField = new GFFField(GFFDataType.LIST, 'Creature List');
    for(let i = 0, len = this.creatures.length; i < len; i++){
      creaturesField.addChildStruct(this.creatures[i].toToolsetInstance());
    }
    git.RootNode.addField(creaturesField);

    let doorsField = new GFFField(GFFDataType.LIST, 'Door List');
    for(let i = 0, len = this.doors.length; i < len; i++){
      doorsField.addChildStruct(this.doors[i].toToolsetInstance());
    }
    git.RootNode.addField(doorsField);

    let encountersField = new GFFField(GFFDataType.LIST, 'Encounter List');
    for(let i = 0, len = this.encounters.length; i < len; i++){
      encountersField.addChildStruct(this.encounters[i].toToolsetInstance());
    }
    git.RootNode.addField(encountersField);

    let listField = new GFFField(GFFDataType.LIST, 'List');
    git.RootNode.addField(listField);

    let placeablesField = new GFFField(GFFDataType.LIST, 'Placeable List');
    for(let i = 0, len = this.placeables.length; i < len; i++){
      placeablesField.addChildStruct(this.placeables[i].toToolsetInstance());
    }
    git.RootNode.addField(placeablesField);

    let soundsField = new GFFField(GFFDataType.LIST, 'SoundList');
    for(let i = 0, len = this.sounds.length; i < len; i++){
      soundsField.addChildStruct(this.sounds[i].toToolsetInstance());
    }
    git.RootNode.addField(soundsField);

    let storesField = new GFFField(GFFDataType.LIST, 'StoreList');
    for(let i = 0, len = this.stores.length; i < len; i++){
      storesField.addChildStruct(this.stores[i].toToolsetInstance());
    }
    git.RootNode.addField(storesField);

    let triggersField = new GFFField(GFFDataType.LIST, 'TriggerList');
    for(let i = 0, len = this.triggers.length; i < len; i++){
      triggersField.addChildStruct(this.triggers[i].toToolsetInstance());
    }
    git.RootNode.addField(triggersField);

    git.RootNode.addField(new GFFField(GFFDataType.BYTE, 'UseTemplates')).setValue(1);

    let waypointsField = new GFFField(GFFDataType.LIST, 'WaypointList');
    for(let i = 0, len = this.waypoints.length; i < len; i++){
      waypointsField.addChildStruct(this.waypoints[i].toToolsetInstance());
    }
    git.RootNode.addField(waypointsField);

    return git;
  }

}
