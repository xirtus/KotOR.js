import * as THREE from "three";
import type { 
  AppearanceManager, AutoPauseManager, TLKManager, CharGenManager, CheatConsoleManager, CameraShakeManager, ConfigManager, CursorManager, DialogMessageManager, 
  FadeOverlayManager, FeedbackMessageManager, GlobalVariableManager, InventoryManager, JournalManager, LightManager, MenuManager, ModuleObjectManager, PartyManager, 
  PartyTableManager, ResolutionManager, ShaderManager, TwoDAManager, FactionManager 
} from "./managers";

import type { TalentObject, TalentFeat, TalentSkill, TalentSpell } from "./talents";
import type { ModuleObject, ModuleCreature, Module } from "./module";
import type { NWScript } from "./nwscript/NWScript";
import type { SaveGame } from "./SaveGame";
import type { GameEffectFactory } from "./effects/GameEffectFactory";
import type { GameEventFactory } from "./events/GameEventFactory";

import type { ActionMenuManager } from "./ActionMenuManager";
import type { ActionFactory } from "./actions/ActionFactory";

import { AnimatedTexture } from "./AnimatedTexture";
import { IngameControls } from "./controls/IngameControls";
import { Mouse } from "./controls/Mouse";

import { INIConfig } from "./INIConfig";
import { LoadingScreen } from "./LoadingScreen";
import { VideoPlayer } from "./VideoPlayer";

import { OdysseyObject3D } from "./three/odyssey";
import { AudioEngine, AudioEmitter } from "./audio";
import { TGAObject } from "./resource/TGAObject";

import { IGameStateGroups } from "./interface/engine/IGameStateGroups";
import { ITextureLoaderQueuedRef } from "./interface/loaders/ITextureLoaderQueuedRef";

import { AudioEngineChannel } from "./enums/audio/AudioEngineChannel";
import { EngineState, EngineMode, GameEngineType, GameEngineEnv } from "./enums/engine";
import { TextureType } from "./enums/loaders/TextureType";

import { EngineContext } from "./engine/EngineContext";

import { ConfigClient } from "./utility/ConfigClient";
import { FollowerCamera } from "./engine/FollowerCamera";
import { OdysseyShaderPass } from "./shaders/pass/OdysseyShaderPass";
import { ResourceLoader, TextureLoader } from "./loaders";

//THREE.js imports
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SSAARenderPass } from "three/examples/jsm/postprocessing/SSAARenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { ColorCorrectionShader } from "three/examples/jsm/shaders/ColorCorrectionShader";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";
import Stats from 'three/examples/jsm/libs/stats.module'
import { BitWise } from "./utility/BitWise";
import { ModuleObjectType } from "./enums/module/ModuleObjectType";
import { AudioEmitterType } from "./enums/audio/AudioEmitterType";
import { GUIControlTypeMask } from "./enums/gui/GUIControlTypeMask";

export interface GameStateInitializeOptions {
  Game: GameEngineType,
  GameDirectory: string, //path to the local game install directory
  Env: GameEngineEnv,
};

export class GameState implements EngineContext {

  static eventListeners: any = {
    "init": [],
    "start": [],
    "ready": [],

    "beforeRender": [],
    "afterRender": [],
  };

  static AppearanceManager: typeof AppearanceManager;
  static AutoPauseManager: typeof AutoPauseManager;
  static CameraShakeManager: typeof CameraShakeManager;
  static CharGenManager: typeof CharGenManager;
  static CheatConsoleManager: typeof CheatConsoleManager;
  static ConfigManager: typeof ConfigManager;
  static CursorManager: typeof CursorManager;
  static DialogMessageManager: typeof DialogMessageManager;
  static FactionManager: typeof FactionManager;
  static FadeOverlayManager: typeof FadeOverlayManager;
  static FeedbackMessageManager: typeof FeedbackMessageManager;
  static GlobalVariableManager: typeof GlobalVariableManager;
  static InventoryManager: typeof InventoryManager;
  static JournalManager: typeof JournalManager;
  static LightManager: typeof LightManager;
  static MenuManager: typeof MenuManager;
  static ModuleObjectManager: typeof ModuleObjectManager;
  static PartyManager: typeof PartyManager;
  static PartyTableManager: typeof PartyTableManager;
  static ResolutionManager: typeof ResolutionManager;
  static ShaderManager: typeof ShaderManager;
  static TLKManager: typeof TLKManager;
  static TwoDAManager: typeof TwoDAManager;

  static Module: typeof Module;
  static NWScript: typeof NWScript;

  static TalentObject: typeof TalentObject;
  static TalentFeat: typeof TalentFeat;
  static TalentSkill: typeof TalentSkill;
  static TalentSpell: typeof TalentSpell;
  static ActionMenuManager: typeof ActionMenuManager;

  static ActionFactory: typeof ActionFactory;
  static GameEffectFactory: typeof GameEffectFactory;
  static GameEventFactory: typeof GameEventFactory;

  static Location: any;

  static GameKey: GameEngineType = GameEngineType.KOTOR;
  static iniConfig: INIConfig;
  static AnimatedTextures: AnimatedTexture[] = [];
  
  static OpeningMoviesComplete = false;
  static Ready = false;
  
  static CameraDebugZoom = 1;
  
  static raycaster = new THREE.Raycaster();
  static mouse = new THREE.Vector2();
  static mouseUI = new THREE.Vector2();
  static screenCenter = new THREE.Vector3();
  
  static SOLOMODE = false;
  static isLoadingSave = false;
  
  static Flags = {
    EnableAreaVIS: false,
    LogScripts: false,
    EnableOverride: false,
    WalkmeshVisible: false,
    CombatEnabled: false
  }
  
  static debug = {
    controls: false,
    selectedObject: false
  };
  
  static IsPaused = false;
  
  static Mode: EngineMode = EngineMode.GUI;
  static holdWorldFadeInForDialog = false;
  static autoRun = false;
  static AlphaTest = 0.5;
  static noClickTimer = 0;
  static maxSelectableDistance = 20;

  static delta: number = 0;
  static clampedDelta: number = 0;

  static SaveGame: SaveGame;
  
  static _emitters = {};
  
  static currentGamepad: Gamepad;
  static models: any[];
  static videoEffect: number = -1;
  static onScreenShot?: Function;
  static time: number = 0;
  static deltaTime: number = 0;
  static deltaTimeFixed: number = 0;

  static canvas: HTMLCanvasElement;
  static context: WebGLRenderingContext;
  static rendererUpscaleFactor: number;
  static renderer: THREE.WebGLRenderer;
  static depthTarget: THREE.WebGLRenderTarget;
  static clock: THREE.Clock;
  static stats: Stats;

  static lightManager: LightManager;

  static limiter: { 
    fps: number; 
    fpsInterval: number; 
    startTime: number; 
    now: number; 
    then: number; 
    elapsed: number; 
    setFPS: (fps?: number) => void; 
  };

  static visible: boolean;

  static scene: any;
  static scene_gui: any;

  //Camera properties
  static frustumMat4: any;
  static camera: THREE.PerspectiveCamera;
  static currentCamera: THREE.Camera;
  static followerCamera: THREE.PerspectiveCamera;
  static camera_dialog: THREE.PerspectiveCamera;
  static camera_animated: THREE.PerspectiveCamera;
  static camera_gui: THREE.OrthographicCamera;
  static currentCameraPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  static staticCameras: THREE.PerspectiveCamera[];
  static animatedCameras: any[];
  static staticCameraIndex: number;
  static animatedCameraIndex: number;
  static cameraMode: any;
  static viewportFrustum: THREE.Frustum;
  static viewportProjectionMatrix: THREE.Matrix4;

  //GameState properties
  static globalLight: THREE.AmbientLight;
  static player: ModuleCreature;
  static playerFeetOffset: THREE.Vector3;
  static collisionList: any[];
  static walkmeshList: any[];

  static group: IGameStateGroups = {
    creatures: new THREE.Group,
    doors: new THREE.Group,
    placeables: new THREE.Group,
    rooms: new THREE.Group,
    grass: new THREE.Group,
    sounds: new THREE.Group,
    triggers: new THREE.Group,
    waypoints: new THREE.Group,
    party: new THREE.Group,
    lights: new THREE.Group,
    light_helpers: new THREE.Group,
    shadow_lights: new THREE.Group,
    path_helpers: new THREE.Group,
    emitters: new THREE.Group,
    effects: new THREE.Group,
    stunt: new THREE.Group,
    weather_effects: new THREE.Group,
    room_walkmeshes: new THREE.Group,
    spell_instances: new THREE.Group,
  };
  static weather_effects: any[];
  static interactableObjects: any[];

  static scene_cursor_holder: THREE.Group;
  static controls: IngameControls;

  //Render pass properties
  static composer: EffectComposer;
  static renderPass: RenderPass;
  static renderPassAA: SSAARenderPass;
  static odysseyShaderPass: OdysseyShaderPass;
  static copyPass: ShaderPass;
  static renderPassGUI: any;
  static bloomPass: BloomPass;
  static bokehPass: BokehPass;
  
  static module: Module;
  static TutorialWindowTracker: any[];
  static audioEmitter: AudioEmitter;
  static guiAudioEmitter: AudioEmitter;
  static State: EngineState;
  static inMenu: boolean;
  static OnReadyCalled: boolean;
  
  static loadingTextures: boolean;

  static ConversationPaused: boolean = false;

  static addEventListener(event: string, callback: Function){
    if(GameState.eventListeners.hasOwnProperty(event)){
      const callbacks: any[] = GameState.eventListeners[event];
      if(callbacks){
        callbacks.push(callback);
      }
    }
  }

  static processEventListener(event: string, args: any[] = []){
    if(GameState.eventListeners.hasOwnProperty(event)){
      const callbacks = GameState.eventListeners[event];
      if(callbacks && callbacks.length){
        for(let i = 0, len = callbacks.length; i < len; i++){
          const cb = callbacks[i];
          if(typeof cb === 'function')
            cb(...args);
        }
      }
    }
  }

  static Init(){
    GameState.lightManager = new GameState.LightManager();
    GameState.processEventListener('init');
    
    GameState.models = [];

    GameState.videoEffect = -1;
    GameState.onScreenShot = undefined;

    GameState.time = 0;
    GameState.deltaTime = 0;
    GameState.deltaTimeFixed = 0;

    GameState.canvas = document.createElement( 'canvas' );
    //GameState.canvas = GameState.renderer.domElement;

    GameState.canvas.classList.add('noselect');
    GameState.canvas.setAttribute('tabindex', '1');
    document.getElementById('renderer-container').appendChild(GameState.canvas);
    
    //transferToOffscreen() causes issues with savegame screenshots
    //GameState.canvas = GameState.canvas.transferControlToOffscreen();

    GameState.canvas.style.setProperty('width', '0');
    GameState.canvas.style.setProperty('height', '0');
    GameState.context = GameState.canvas.getContext( 'webgl' );

    GameState.rendererUpscaleFactor = 1;
    GameState.renderer = new THREE.WebGLRenderer({
      antialias: false,
      canvas: GameState.canvas,
      context: GameState.context,
      logarithmicDepthBuffer: false,
      alpha: true,
      preserveDrawingBuffer: false
    });

    
    GameState.renderer.autoClear = false;
    GameState.renderer.setSize( GameState.ResolutionManager.getViewportWidth(), GameState.ResolutionManager.getViewportHeight() );
    GameState.renderer.setClearColor(0x000000);

    let pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
		GameState.depthTarget = new THREE.WebGLRenderTarget( GameState.ResolutionManager.getViewportWidth(), GameState.ResolutionManager.getViewportHeight(), pars );
    GameState.depthTarget.texture.generateMipmaps = false;
    GameState.depthTarget.stencilBuffer = false;
    GameState.depthTarget.depthBuffer = true;
    GameState.depthTarget.depthTexture = new THREE.DepthTexture(GameState.ResolutionManager.getViewportWidth(), GameState.ResolutionManager.getViewportHeight());
    GameState.depthTarget.depthTexture.type = THREE.UnsignedShortType;

    (window as any).renderer = GameState.renderer;

    GameState.clock = new THREE.Clock();
    GameState.stats = Stats();

    GameState.limiter = {
      fps : 30,
      fpsInterval: 1000/30,
      startTime: Date.now(),
      now: 0,
      then: 0,
      elapsed: 0,
      setFPS: function(fps = 30){
        this.fps = fps;
        this.fpsInterval = 1000 / this.fps;
      }
    };

    GameState.limiter.then = GameState.limiter.startTime;

    GameState.visible = true;

    GameState.CursorManager.selected = undefined;
    GameState.CursorManager.hovered = undefined;

    GameState.scene = new THREE.Scene();
    GameState.scene_gui = new THREE.Scene();
    GameState.frustumMat4 = new THREE.Matrix4();
    GameState.camera = FollowerCamera.camera;

    GameState.camera_dialog = new THREE.PerspectiveCamera( 55, GameState.ResolutionManager.getViewportWidth() / GameState.ResolutionManager.getViewportHeight(), 0.01, 15000 );
    GameState.camera_dialog.up = new THREE.Vector3( 0, 0, 1 );
    GameState.camera_animated = new THREE.PerspectiveCamera( 55, GameState.ResolutionManager.getViewportWidth() / GameState.ResolutionManager.getViewportHeight(), 0.01, 15000 );
    GameState.camera_animated.up = new THREE.Vector3( 0, 1, 0 );
    GameState.camera.up = new THREE.Vector3( 0, 0, 1 );
    GameState.camera.position.set( .1, 5, 1 );              // offset the camera a bit
    GameState.camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
    
    GameState.camera_gui = new THREE.OrthographicCamera(
      GameState.ResolutionManager.getViewportWidth() / -2,
      GameState.ResolutionManager.getViewportWidth() / 2,
      GameState.ResolutionManager.getViewportHeight() / 2,
      GameState.ResolutionManager.getViewportHeight() / -2,
      1, 1000
    );
    GameState.camera_gui.up = new THREE.Vector3( 0, 0, 1 );
    GameState.camera_gui.position.z = 500;
    GameState.camera_gui.updateProjectionMatrix();
    GameState.scene_gui.add(new THREE.AmbientLight(0x60534A));

    FollowerCamera.facing = Math.PI/2;
    FollowerCamera.speed = 0;

    //Static Camera's that are in the .git file of the module
    GameState.staticCameras = [];
    //Animates Camera's are MDL files that have a camera_hook and animations for use in dialog
    GameState.animatedCameras = [];

    GameState.staticCameraIndex = 0;
    GameState.animatedCameraIndex = 0;
    // GameState.cameraMode = GameState.CameraMode.EDITOR;
    GameState.currentCamera = GameState.camera;

    GameState.viewportFrustum = new THREE.Frustum();
    GameState.viewportProjectionMatrix = new THREE.Matrix4();

    //0x60534A
    GameState.globalLight = new THREE.AmbientLight(0xFFFFFF);
    GameState.globalLight.position.x = 0;
    GameState.globalLight.position.y = 0;
    GameState.globalLight.position.z = 0;
    GameState.globalLight.intensity  = 1;

    GameState.scene.add(GameState.globalLight);

    GameState.player = undefined;
    GameState.playerFeetOffset = new THREE.Vector3(0,0,1);

    GameState.collisionList = [];
    GameState.walkmeshList = [];
    const namedGroup = (name: string = 'na') => {
      const group = new THREE.Group();
      group.name = name;
      return group;
    }
    GameState.group = {
      creatures: namedGroup('creatures'),
      doors: namedGroup('doors'),
      placeables: namedGroup('placeables'),
      rooms: namedGroup('rooms'),
      grass: namedGroup('grass'),
      sounds: namedGroup('sounds'),
      triggers: namedGroup('triggers'),
      waypoints: namedGroup('waypoints'),
      party: namedGroup('party'),
      lights: namedGroup('lights'),
      light_helpers: namedGroup('light_helpers'),
      shadow_lights: namedGroup('shadow_lights'),
      path_helpers: namedGroup('path_helpers'),
      emitters: namedGroup('emitters'),
      effects: namedGroup('effects'),
      stunt: namedGroup('stunt'),
      weather_effects: namedGroup('weather_effects'),
      room_walkmeshes: namedGroup('room_walkmeshes'),
      spell_instances: namedGroup('spell_instances'),
    };

    GameState.weather_effects = [];

    GameState.scene.add(GameState.group.rooms);
    // GameState.scene.add(GameState.group.grass);
    GameState.scene.add(GameState.group.placeables);
    GameState.scene.add(GameState.group.doors);
    GameState.scene.add(GameState.group.creatures);
    // //GameState.scene.add(GameState.group.waypoints);
    // //GameState.scene.add(GameState.group.sounds);
    // GameState.scene.add(GameState.group.triggers);
    // GameState.scene.add(GameState.group.stunt);
    // GameState.scene.add(GameState.group.weather_effects);

    GameState.scene.add(GameState.group.lights);
    // GameState.scene.add(GameState.group.light_helpers);
    // GameState.scene.add(GameState.group.shadow_lights);
    // GameState.scene.add(GameState.group.path_helpers);
    // GameState.scene.add(GameState.group.emitters);
    // GameState.scene.add(GameState.group.effects);

    GameState.scene.add(GameState.group.party);
    // GameState.scene.add(GameState.group.room_walkmeshes);
    GameState.scene.add(GameState.group.spell_instances);

    GameState.group.light_helpers.visible = false;

    GameState.interactableObjects = [
      GameState.group.placeables, 
      GameState.group.doors, 
      GameState.group.creatures, 
      GameState.group.party,
      //GameState.group.rooms
      GameState.group.room_walkmeshes
    ];

    GameState.scene_cursor_holder = new THREE.Group();
    GameState.scene_gui.add(GameState.scene_cursor_holder);

    GameState.controls = new IngameControls(GameState.currentCamera, GameState.canvas);

    //BEGIN: PostProcessing
    GameState.composer = new EffectComposer(GameState.renderer);
    GameState.renderPass = new RenderPass(GameState.scene, GameState.currentCamera);
    GameState.renderPassAA = new SSAARenderPass (GameState.scene, GameState.currentCamera);
    GameState.odysseyShaderPass = new OdysseyShaderPass();
    GameState.copyPass = new ShaderPass(CopyShader);
    GameState.renderPassGUI = new RenderPass(GameState.scene_gui, GameState.camera_gui);
    
    GameState.bloomPass = new BloomPass(0.5);
    GameState.bokehPass = new BokehPass(GameState.scene, GameState.currentCamera, {
      focus: 1.0,
      aperture:	0.0001,
      maxblur:	1.0,
      // width: ResolutionManager.getViewportWidth(),
      // height: ResolutionManager.getViewportHeight()
    });

    GameState.renderPassAA.sampleLevel = 1;

    GameState.renderPass.renderToScreen = false;
    GameState.copyPass.renderToScreen = false;
    GameState.renderPassGUI.renderToScreen = false;

    GameState.renderPass.clear = true;
    GameState.bloomPass.clear = false;
    GameState.odysseyShaderPass.clear = false;
    GameState.renderPassAA.clear = false;
    GameState.copyPass.clear = false;
    GameState.renderPassGUI.clear = false;
    GameState.renderPassGUI.clearDepth = true;

    GameState.bokehPass.needsSwap = true;
    GameState.bokehPass.enabled = false;

    GameState.composer.addPass(GameState.renderPass);
    // GameState.composer.addPass(GameState.bokehPass);
    // GameState.composer.addPass(GameState.renderPassAA);
    GameState.composer.addPass(GameState.odysseyShaderPass);
    GameState.composer.addPass(GameState.bloomPass);

    GameState.composer.addPass(GameState.renderPassGUI);
    GameState.composer.addPass(GameState.copyPass);

    GameState.renderPass.clearDepth = true;
    GameState.renderPassGUI.clearDepth = true;
    GameState.renderPass.clear = true;
    GameState.renderPassGUI.clear = false;
    GameState.renderPass.needsSwap = false;
    GameState.renderPassGUI.needsSwap = false;

    GameState.FadeOverlayManager.Initialize();

    window.addEventListener('resize', () => {
      GameState.EventOnResize();
    });

    console.log('Game: Start');
    try{
      GameState.ShaderManager.Init();
      GameState.Start();
    }catch(e){
      console.error(e);
    }
  }

  static Start(){

    GameState.TutorialWindowTracker = [];

    GameState.initGUIAudio();
    GameState.lightManager.init(GameState);
    GameState.lightManager.setLightHelpersVisible(ConfigClient.get('GameState.debug.light_helpers') ? true : false);
    const audioEngine = AudioEngine.GetAudioEngine();

    GameState.audioEmitter = new AudioEmitter(audioEngine);
    GameState.audioEmitter.maxDistance = 50;
    GameState.audioEmitter.type = AudioEmitterType.GLOBAL;
    GameState.audioEmitter.load();

    //AudioEngine.Unmute()
    GameState.Mode = EngineMode.GUI;
    GameState.State = EngineState.RUNNING;
    GameState.inMenu = false;
        
    console.log('CursorManager: Init');
    GameState.CursorManager.init( () => {
      GameState.scene_cursor_holder.add( GameState.CursorManager.cursor );
      GameState.scene.add( GameState.CursorManager.reticle );
      GameState.scene.add( GameState.CursorManager.reticle2 );
      GameState.scene_gui.add( GameState.CursorManager.arrow );
      console.log('CursorManager: Complete');

      console.log('MenuLoader: Init');
      GameState.MenuManager.Init();
      GameState.MenuManager.LoadGameMenus().then( () => {
        console.log('MenuLoader: Complete');

        GameState.MenuManager.MenuJournal.childMenu = GameState.MenuManager.MenuTop;
        GameState.MenuManager.MenuInventory.childMenu = GameState.MenuManager.MenuTop;
        GameState.MenuManager.MenuEquipment.childMenu = GameState.MenuManager.MenuTop;
        GameState.MenuManager.MenuCharacter.childMenu = GameState.MenuManager.MenuTop;
        GameState.MenuManager.MenuMessages.childMenu = GameState.MenuManager.MenuTop;
        GameState.MenuManager.MenuOptions.childMenu = GameState.MenuManager.MenuTop;
        GameState.MenuManager.MenuMap.childMenu = GameState.MenuManager.MenuTop;
        GameState.MenuManager.MenuAbilities.childMenu = GameState.MenuManager.MenuTop;

        //Preload fx textures
        TextureLoader.enQueue(
          ['fx_tex_01', 'fx_tex_02', 'fx_tex_03', 'fx_tex_04', 'fx_tex_05', 'fx_tex_06', 'fx_tex_07', 'fx_tex_08',
          'fx_tex_09', 'fx_tex_10', 'fx_tex_11', 'fx_tex_12', 'fx_tex_13', 'fx_tex_14', 'fx_tex_15', 'fx_tex_16',
          'fx_tex_17', 'fx_tex_18', 'fx_tex_19', 'fx_tex_20', 'fx_tex_21', 'fx_tex_22', 'fx_tex_23', 'fx_tex_24',
          'fx_tex_25', 'fx_tex_26', 'fx_tex_stealth'],
          undefined,
          TextureType.TEXTURE
        );

        TextureLoader.LoadQueue(() => {
          GameState.Ready = true;
          LoadingScreen.main.Hide();
          if(GameState.OpeningMoviesComplete){
            GameState.OnReady();
          }
        });
      });

    });

  }

  static OnReady(){
    if(GameState.Ready && !GameState.OnReadyCalled){
      GameState.OnReadyCalled = true;
      GameState.processEventListener('ready');
      GameState.MenuManager.MainMenu.Start();
      window.dispatchEvent(new Event('resize'));
      // this.setTestingGlobals();
      //GameState.Update = GameState.Update.bind(this);
      console.log('begin');
      GameState.Update();
    }
  }

  static EventOnResize(){
    GameState.ResolutionManager.recalculate();
    let width = GameState.ResolutionManager.getViewportWidth();
    let height = GameState.ResolutionManager.getViewportHeight();

    GameState.composer.setSize(width * GameState.rendererUpscaleFactor, height * GameState.rendererUpscaleFactor);

    GameState.FadeOverlayManager.plane.scale.set(width, height, 1);
    
    GameState.camera_gui.left = width / -2;
    GameState.camera_gui.right = width / 2;
    GameState.camera_gui.top = height / 2;
    GameState.camera_gui.bottom = height / -2;

    GameState.camera_gui.updateProjectionMatrix();

    GameState.camera.aspect = width / height;
    GameState.camera.updateProjectionMatrix();

    GameState.renderer.setSize(width, height);  
    
    GameState.camera_dialog.aspect = GameState.camera.aspect;
    GameState.camera_dialog.updateProjectionMatrix();

    GameState.camera_animated.aspect = GameState.camera.aspect;
    GameState.camera_animated.updateProjectionMatrix();

    for(let i = 0; i < GameState.staticCameras.length; i++){
      GameState.staticCameras[i].aspect = GameState.camera.aspect;
      GameState.staticCameras[i].updateProjectionMatrix();
    }

    //GameState.bokehPass.renderTargetColor.setSize(width * GameState.rendererUpscaleFactor, height * GameState.rendererUpscaleFactor);

    GameState.screenCenter.x = ( (GameState.ResolutionManager.getViewportWidth()/2) / GameState.ResolutionManager.getViewportWidth() ) * 2 - 1;
    GameState.screenCenter.y = - ( (GameState.ResolutionManager.getViewportHeight()/2) / GameState.ResolutionManager.getViewportHeight() ) * 2 + 1; 

    GameState.MenuManager.Resize();

    GameState.depthTarget.setSize(GameState.ResolutionManager.getViewportWidth() * GameState.rendererUpscaleFactor, GameState.ResolutionManager.getViewportHeight() * GameState.rendererUpscaleFactor);

    if(GameState.ResolutionManager.vpScaleFactor){
      GameState.canvas.style.transform = 'scale('+GameState.ResolutionManager.vpScaleFactor+')';
    }else{
      GameState.canvas.style.transform = '';
    }

  }

  static initGUIAudio(){
    try{
      GameState.guiAudioEmitter = new AudioEmitter(AudioEngine.GetAudioEngine());
      GameState.guiAudioEmitter.maxDistance = 100;
      GameState.guiAudioEmitter.volume = 127;
      GameState.guiAudioEmitter.load();
    }catch(e){

    }
  }

  static updateRendererUpscaleFactor(){
    this.EventOnResize();
  }

  public static getCurrentPlayer(): ModuleCreature {
    if(GameState.Mode == EngineMode.MINIGAME){
      return GameState.module.area.miniGame.player as any;
    }
    let p = GameState.PartyManager.party[0];
    return p ? p : GameState.player;
  }

  public static onMouseHitInteractive( onSuccess?: Function){
    
    GameState.raycaster.setFromCamera( Mouse.position, GameState.currentCamera );
    let intersects = GameState.raycaster.intersectObjects( GameState.interactableObjects, true );

    const getNodeModuleObject = function (node: THREE.Object3D, isCurrentPlayerSelectable: boolean = false): ModuleObject|undefined {
      const moduleObject: ModuleObject = node?.userData?.moduleObject;
      if(moduleObject){
        if(moduleObject != GameState.getCurrentPlayer() || isCurrentPlayerSelectable){
          return moduleObject;
        }
      }
      return;
    }

    if(intersects.length){
      const intersection = intersects[0],
          obj = intersection.object;
      
      let searching = true;

      //Does this node contain a ModuleObject reference
      const moduleObject = getNodeModuleObject(obj);
      if(moduleObject){
        if(typeof onSuccess === 'function')
          onSuccess(moduleObject, intersection);
        return;
      }else{
        //Bubble up to try and find a ModuleObject reference
        obj.traverseAncestors( (parentNode: THREE.Object3D) => {
          if(!searching) return;
          const moduleObject = getNodeModuleObject(parentNode);
          if(moduleObject){
            searching = false;
            if(typeof onSuccess === 'function')
              onSuccess(moduleObject, intersection);
            return;
          }
        });
      }
    }
  }

  public static setReticleSelectedObject( object: ModuleObject ){
    if(object){
      GameState.CursorManager.selected = object.getReticleNode();
      if(GameState.CursorManager.selected){
        GameState.CursorManager.selected.getWorldPosition(GameState.CursorManager.reticle2.position);
        GameState.CursorManager.selectedObject = object;
      }

      if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleDoor)){      
        GameState.CursorManager.setReticle2('reticleF2');
      }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModulePlaceable)){
        if(!object.isUseable()){
          return;
        }      
        GameState.CursorManager.setReticle2('reticleF2');
      }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleCreature)){
        if(object.isHostile(GameState.getCurrentPlayer())){
          GameState.CursorManager.setReticle2('reticleH2');
        }else{
          GameState.CursorManager.setReticle2('reticleF2');
        }
      }
    }
  }

  public static setReticleHoveredObject( object: ModuleObject ){
    if(object){
      let distance = GameState.getCurrentPlayer().position.distanceTo(object.position);
      let canChangeCursor = (distance <= GameState.maxSelectableDistance) || (GameState.CursorManager.hoveredObject == GameState.CursorManager.selectedObject);

      GameState.CursorManager.hovered = object.getReticleNode();
      if(GameState.CursorManager.hovered){
        GameState.CursorManager.hovered.getWorldPosition(GameState.CursorManager.reticle.position);
        GameState.CursorManager.hoveredObject = object;
      }

      if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleDoor)){
        if(canChangeCursor)
          GameState.CursorManager.setCursor('door');
        else
          GameState.CursorManager.setCursor('select');

          GameState.CursorManager.setReticle('reticleF');
      }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModulePlaceable)){
        if(!object.isUseable()){
          return;
        }
        if(canChangeCursor)
          GameState.CursorManager.setCursor('use');
        else
          GameState.CursorManager.setCursor('select');

          GameState.CursorManager.setReticle('reticleF');
      }else if(BitWise.InstanceOf(object?.objectType, ModuleObjectType.ModuleCreature)){

        if(object.isHostile(GameState.getCurrentPlayer())){
          if(!object.isDead()){
            if(canChangeCursor)
              GameState.CursorManager.setCursor('attack');
            else
              GameState.CursorManager.setCursor('select');

            GameState.CursorManager.setReticle('reticleH');
          }else{
            if(canChangeCursor)
              GameState.CursorManager.setCursor('use');
            else
              GameState.CursorManager.setCursor('select');

            GameState.CursorManager.setReticle('reticleF');
          }
        }else{
          if(canChangeCursor)
            GameState.CursorManager.setCursor('talk');
          else
            GameState.CursorManager.setCursor('select');

          GameState.CursorManager.setReticle('reticleF');
        }

      }
    }
  }

  static updateCursorPosition(){
    GameState.CursorManager.setCursor('default');
    GameState.scene_cursor_holder.position.x = Mouse.positionViewport.x - (GameState.ResolutionManager.getViewportWidth()/2) + (32/2);
    GameState.scene_cursor_holder.position.y = (Mouse.positionViewport.y*-1) + (GameState.ResolutionManager.getViewportHeight()/2) - (32/2);
  }

  static updateCursor(){
    let cursorCaptured = false;
    let guiHoverCaptured = false;

    GameState.MenuManager.hoveredGUIElement = undefined;

    let uiControls = GameState.controls.MenuGetActiveUIElements();
    let controlCount = uiControls.length;
    for(let i = 0; i < controlCount; i++){
      let control = uiControls[i];
      if(!control.isVisible())
        continue;

      //if(control === GameState.mouse.clickItem){
      if(BitWise.InstanceOfObject(control, GUIControlTypeMask.GUIListBox) && GameState.MenuManager.hoveredGUIElement == undefined){
        GameState.MenuManager.hoveredGUIElement = control;
      }

      if(!(control.widget.parent.type === 'Scene')){
        if(!guiHoverCaptured){
          let cMenu = control.menu;
          cMenu.setWidgetHoverActive(control, true);
          guiHoverCaptured = false;
        }

        if(typeof control.isClickable == 'function'){
          if(control.isClickable()){
            GameState.CursorManager.setCursor('select');
            cursorCaptured = true;
          }
        }
      }
      //}
    }

    GameState.CursorManager.arrow.visible = false;
    if(GameState.CursorManager.selectedObject){
      if(GameState.CursorManager.selectedObject.position.distanceTo(GameState.getCurrentPlayer().position) > GameState.maxSelectableDistance){
        GameState.CursorManager.selectedObject = undefined;
      }
    }

    if(!cursorCaptured && GameState.Mode == EngineMode.INGAME){
      if(GameState.MenuManager.GetCurrentMenu() == GameState.MenuManager.InGameOverlay){
        if(GameState.scene_cursor_holder.visible){
          //console.log(GameState.scene_cursor_holder.position);
          let hoveredObject = false;
          GameState.onMouseHitInteractive( (moduleObject: ModuleObject) => {
            if(moduleObject && moduleObject.isUseable()){
              if(moduleObject != GameState.getCurrentPlayer()){
                GameState.setReticleHoveredObject(moduleObject);
              }
            }else{
              GameState.CursorManager.hovered = GameState.CursorManager.hoveredObject = undefined;
            }
          });
        }else{
          if(!GameState.CursorManager.selectedObject){
            let closest = GameState.ModuleObjectManager.GetNearestInteractableObject();
            GameState.setReticleSelectedObject(closest);
            GameState.setReticleHoveredObject(closest);
          }
        }
      }
    }

    if(GameState.Mode == EngineMode.INGAME && GameState.CursorManager.hovered instanceof OdysseyObject3D){
      GameState.CursorManager.hovered.getWorldPosition(GameState.CursorManager.reticle.position);
      GameState.CursorManager.reticle.visible = true;
    }else{
      GameState.CursorManager.reticle.visible = false;
    }

    if(GameState.Mode == EngineMode.INGAME && GameState.CursorManager.selected instanceof OdysseyObject3D && !GameState.MenuManager.MenuContainer.bVisible){
      GameState.CursorManager.selected.getWorldPosition(GameState.CursorManager.reticle2.position);
      GameState.CursorManager.reticle2.visible = true;
      if(BitWise.InstanceOf(GameState.CursorManager.selectedObject?.objectType, ModuleObjectType.ModuleDoor)){      
        GameState.CursorManager.setReticle2('reticleF2');
      }else if(BitWise.InstanceOf(GameState.CursorManager.selectedObject?.objectType, ModuleObjectType.ModulePlaceable)){
        if(!GameState.CursorManager.selectedObject.isUseable()){
          return;
        }      
        GameState.CursorManager.setReticle2('reticleF2');
      }else if(BitWise.InstanceOf(GameState.CursorManager.selectedObject?.objectType, ModuleObjectType.ModuleCreature)){
        if(GameState.CursorManager.selectedObject.isHostile(GameState.getCurrentPlayer())){
          GameState.CursorManager.setReticle2('reticleH2');
        }else{
          GameState.CursorManager.setReticle2('reticleF2');
        }
      }
    }else{
      GameState.CursorManager.reticle2.visible = false;
    }

  }

  static ResetModuleAudio(){                        
    GameState.MenuManager.InGameComputer.audioEmitter = 
    GameState.MenuManager.InGameDialog.audioEmitter = 
    this.audioEmitter = new AudioEmitter(AudioEngine.GetAudioEngine(), AudioEngineChannel.VO);
    this.audioEmitter.maxDistance = 50;
    this.audioEmitter.type = AudioEmitterType.GLOBAL;
    this.audioEmitter.load();
  }

  static LoadModule(name = '', waypoint: string = null, sMovie1 = '', sMovie2 = '', sMovie3 = '', sMovie4 = '', sMovie5 = '', sMovie6 = ''){
    GameState.Mode = EngineMode.LOADING;
    GameState.MenuManager.ClearMenus();
    GameState.UnloadModule();
    VideoPlayer.Load(sMovie1).then( () => {
      VideoPlayer.Load(sMovie2).then( () => {
        VideoPlayer.Load(sMovie3).then( () => {
          VideoPlayer.Load(sMovie4).then( () => {
            VideoPlayer.Load(sMovie5).then( () => {
              VideoPlayer.Load(sMovie6).then( async () => {
                GameState.Mode = EngineMode.LOADING;
                
                if(GameState.module){
                  try{ await GameState.module.save(); }catch(e){
                    console.error(e);
                  }
                  try{ GameState.module.dispose(); }catch(e){
                    console.error(e);
                  }
                }

                //Remove all cached scripts and kill all running instances
                GameState.NWScript.Reload();

                //Resets all keys to their default state
                GameState.controls.initKeys();

                GameState.FactionManager.Load().then( () => {
                  GameState.Module.Load(name, waypoint).then((module: Module) => {
                    GameState.module = module;
                    GameState.scene.visible = false;

                    GameState.MenuManager.LoadScreen.setProgress(0);
                    GameState.MenuManager.LoadScreen.setLoadBackground('load_'+name).then( () => {
                      GameState.MenuManager.LoadScreen.showRandomHint();
                      GameState.MenuManager.LoadScreen.open();
                      GameState.FadeOverlayManager.FadeOut(0, 0, 0, 0);

                      console.log('Module.loadScene');
                      module.loadScene().then((d: any) => {
                        TextureLoader.LoadQueue( () => {
                          module.initEventQueue();
                          console.log('Module.initScripts');
                          module.initScripts().then(() => {
                            GameState.MenuManager.LoadScreen.close();
                            window.setTimeout( ()=> {
                              //GameState.scene_gui.background = null;
                              GameState.scene.visible = true;
                              
                              AudioEngine.Unmute();

                              let runSpawnScripts = !GameState.isLoadingSave;
                              GameState.isLoadingSave = false;

                              GameState.ResetModuleAudio();

                              GameState.MenuManager.InGameOverlay.recalculatePosition();
                              GameState.MenuManager.InGameOverlay.open();

                              GameState.renderer.compile(GameState.scene, GameState.currentCamera);
                              GameState.renderer.setClearColor( new THREE.Color(GameState.module.area.sun.fogColor) );
                              
                              console.log('ModuleArea.initAreaObjects');
                              GameState.module.area
                                .initAreaObjects(runSpawnScripts)
                                .then( 
                              () => {
                                GameState.RestoreEnginePlayMode();
                                console.log('ModuleArea: ready to play');
                                GameState.module.readyToProcessEvents = true;

                                if(!GameState.holdWorldFadeInForDialog)
                                  GameState.FadeOverlayManager.FadeIn(1, 0, 0, 0);

                                if(GameState.Mode == EngineMode.INGAME){
                
                                  let anyCanLevel = false;
                                  for(let i = 0; i < GameState.PartyManager.party.length; i++){
                                    if(GameState.PartyManager.party[i].canLevelUp()){
                                      anyCanLevel = true;
                                    }
                                  }
                
                                  if(anyCanLevel){
                                    GameState.audioEmitter.playSound('gui_level');
                                  }
                
                                }
                              });
                            });
                          });
                        }, (ref: ITextureLoaderQueuedRef) => {
                          const material = ref.material as any;
                          if(material?.map){
                            GameState.renderer.initTexture(material.map);
                          }
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  static RestoreEnginePlayMode(): void {
    if(GameState.module){
      if(GameState.module.area.miniGame){
        GameState.Mode = EngineMode.MINIGAME
      }else{
        GameState.Mode = EngineMode.INGAME;
      }
    }else{
      GameState.Mode = EngineMode.GUI;
    }
  }

  static UnloadModule(){
    GameState.MenuManager.ClearMenus();
    GameState.deltaTime = 0;
    // GameState.initTimers();
    ResourceLoader.clearCache();

    GameState.scene.visible = false;
    GameState.Mode = EngineMode.LOADING;
    GameState.ModuleObjectManager.Reset();
    GameState.renderer.setClearColor(new THREE.Color(0, 0, 0));
    GameState.AlphaTest = 0;
    GameState.holdWorldFadeInForDialog = false;
    AudioEngine.GetAudioEngine().stopBackgroundMusic();
    AudioEngine.GetAudioEngine().reset();

    GameState.lightManager.clearLights();

    GameState.CursorManager.selected = undefined;
    GameState.CursorManager.selectedObject = undefined;
    GameState.CursorManager.hovered = undefined;
    GameState.CursorManager.hoveredObject = undefined;

    GameState.staticCameras = [];
    GameState.ConversationPaused = false;

    if(!AudioEngine.isMuted)
      AudioEngine.Mute();
  }

  static UpdateVideoEffect(){
    const videoEffects = GameState.TwoDAManager.datatables.get('videoeffects');
    if(GameState.videoEffect >= 0 && GameState.videoEffect < videoEffects.RowCount){
      let effect = videoEffects.rows[GameState.videoEffect];
      GameState.odysseyShaderPass.setOdysseyVideoEffect(effect);
    }else{
      GameState.odysseyShaderPass.setOdysseyVideoEffect(undefined);
    }
  }

  static ReloadTextureCache(){
    if(GameState.module && GameState.module.area){
      GameState.module.area.reloadTextures();
    }
  }

  static getCameraById(id = 0){
    for(let i = 0; i < GameState.staticCameras.length; i++){
      if(GameState.staticCameras[i].userData.ingameID == id)
        return GameState.staticCameras[i];
    }

    return GameState.currentCamera;
  }

  static Update(){
    
    requestAnimationFrame( GameState.Update );

    if(!ConfigClient.get('GameState.debug.show_fps')){
      // GameState.stats.showPanel(false);
    }

    let delta = GameState.clock.getDelta();
    GameState.processEventListener('beforeRender', [delta]);
    GameState.delta = delta;
    GameState.deltaTime += delta;
    GameState.deltaTimeFixed += (1/60);
    GameState.clampedDelta = Math.max(0, Math.min(delta, 0.016666666666666666 * 5));

    GameState.limiter.now = Date.now();
    GameState.limiter.elapsed = GameState.limiter.now - GameState.limiter.then;

    GameState.controls.Update(delta);
    GameState.UpdateVideoEffect();
    GameState.MenuManager.Update(delta);
    GameState.MenuManager.InGameAreaTransition.hide();

    if(!GameState.loadingTextures && TextureLoader.queue.length){
      GameState.loadingTextures = true;
      TextureLoader.LoadQueue( () => {
        GameState.loadingTextures = false;
      });
    } 

    GameState.scene_cursor_holder.visible = true;
    GameState.MenuManager.InGamePause.hide();

    if(
      GameState.Mode == EngineMode.MINIGAME || 
      GameState.Mode == EngineMode.DIALOG || 
      GameState.Mode == EngineMode.INGAME ||
      GameState.Mode == EngineMode.FREELOOK
    ){

      //Update Mode Camera
      if(GameState.Mode == EngineMode.INGAME){
        //Make sure we are using the follower camera while ingame
        GameState.currentCamera = GameState.camera;
        GameState.videoEffect = -1;
      }else if(GameState.Mode == EngineMode.FREELOOK){
        GameState.videoEffect = -1;
        const player = GameState.getCurrentPlayer();
        if(player){
          const appearance = player.getAppearance();
          if(appearance){
            const effectId = appearance.freelookeffect;
            if(!isNaN(effectId)){
              GameState.videoEffect = effectId;
            }
          }
        }
      }

      GameState.frustumMat4.multiplyMatrices( GameState.currentCamera.projectionMatrix, GameState.currentCamera.matrixWorldInverse )
      GameState.viewportFrustum.setFromProjectionMatrix(GameState.frustumMat4);
      GameState.currentCameraPosition.set(0, 0, 0);
      GameState.currentCameraPosition.applyMatrix4(FollowerCamera.camera.matrix);

      GameState.updateTime(delta);

      //Handle Module Tick
      if(
        GameState.State == EngineState.PAUSED ||
        GameState.MenuManager.activeModals.length
      ){
        GameState.module.tickPaused(delta);
      }else{
        GameState.module.tick(delta);
      }
      
      //TODO: Move Cursor Logic Into Global Cursor Manager
      if(GameState.Mode == EngineMode.DIALOG){
        if(
          GameState.MenuManager.InGameDialog.isVisible() && 
          !GameState.MenuManager.InGameDialog.LB_REPLIES.isVisible() && 
          GameState.scene_cursor_holder.visible
        ){
          GameState.scene_cursor_holder.visible = false;
        }
      }

      if(
        GameState.Mode == EngineMode.INGAME || 
        GameState.Mode == EngineMode.DIALOG
      ){
        GameState.FadeOverlayManager.Update(delta);
        GameState.frustumMat4.multiplyMatrices( GameState.currentCamera.projectionMatrix, GameState.currentCamera.matrixWorldInverse )
        GameState.viewportFrustum.setFromProjectionMatrix(GameState.frustumMat4);
        if(GameState.Mode == EngineMode.DIALOG){
          GameState.lightManager.update(delta, GameState.currentCamera);
        }else{
          GameState.lightManager.update(delta, GameState.getCurrentPlayer());
          GameState.currentCamera = GameState.camera;
        }
        
        //Handle the visibility of the PAUSE overlay
        if(GameState.State == EngineState.PAUSED && GameState.MenuManager.InGameOverlay.isVisible()){
          if(!GameState.MenuManager.InGamePause.isVisible())
            GameState.MenuManager.InGamePause.show();
        }else{
          if(GameState.MenuManager.InGamePause.isVisible())
            GameState.MenuManager.InGamePause.hide();
        }
      }else if(GameState.Mode == EngineMode.MINIGAME){
        GameState.FadeOverlayManager.Update(delta);
        GameState.lightManager.update(delta, GameState.getCurrentPlayer());
      }

      if(GameState.Mode == EngineMode.INGAME){
        if(GameState.MenuManager.InGameAreaTransition.transitionObject){
          GameState.MenuManager.InGameAreaTransition.show();
        }
      }

      //Handle visibility state for debug helpers
      if(GameState.Mode == EngineMode.INGAME){
        let obj: any;
        for(let i = 0, len = GameState.group.room_walkmeshes.children.length; i < len; i++){
          obj = GameState.group.room_walkmeshes.children[i];
          if(obj.type === 'Mesh'){
            obj.material.visible = true;//ConfigClient.get('GameState.debug.show_collision_meshes');
          }
        }
  
        for(let i = 0, len = GameState.walkmeshList.length; i < len; i++){
          obj = GameState.walkmeshList[i];
          if(obj.type === 'Mesh'){
            obj.material.visible = true;//ConfigClient.get('GameState.debug.show_collision_meshes');
          }
        }
    
        for(let i = 0, len = GameState.collisionList.length; i < len; i++){
          obj = GameState.collisionList[i];
          if(obj.type === 'Mesh'){
            obj.material.visible = false;
          }
        }
        
        for(let i = 0, len = GameState.group.path_helpers.children.length; i < len; i++){
          obj = GameState.group.path_helpers.children[i];
          if(obj){
            obj.visible = ConfigClient.get('GameState.debug.show_path_helpers');
          }
        }
      }

    }

    AudioEngine.GetAudioEngine().update(GameState.currentCamera.position, GameState.currentCamera.rotation);
    GameState.CameraShakeManager.update(delta, GameState.currentCamera);

    GameState.updateCursorPosition();
    GameState.renderPass.camera = GameState.currentCamera;
    //GameState.renderPassAA.camera = GameState.currentCamera;
    GameState.bokehPass.camera = GameState.currentCamera;

    GameState.composer.render(delta);

    //Handle screenshot callback
    if(typeof GameState.onScreenShot === 'function'){
      console.log('Screenshot', GameState.onScreenShot);
      
      GameState.renderer.clear();
      GameState.renderer.render(GameState.scene, GameState.currentCamera);

      let ssCallback = GameState.onScreenShot;
      let screenshot = new Image();
      screenshot.src = GameState.canvas.toDataURL('image/png');
      screenshot.onload = function() {
        let ssCanvas = new OffscreenCanvas(256, 256);
        let ctx = ssCanvas.getContext('2d');
        ctx.drawImage(screenshot, 0, 0, 256, 256);

        let tga = TGAObject.FromCanvas(ssCanvas);
        ssCallback(tga);
      };
      
      GameState.composer.render(delta);
      //Remove screenshot callback so it won't be triggered again
      GameState.onScreenShot = undefined;
    }

    //CameraShake: After Render
    GameState.CameraShakeManager.afterRender();

    //NoClickTimer: Update
    if( ((GameState.Mode == EngineMode.MINIGAME) || (GameState.Mode == EngineMode.INGAME)) && GameState.State != EngineState.PAUSED){
      if(GameState.noClickTimer){
        GameState.noClickTimer -= (1 * delta);
        if(GameState.noClickTimer < 0){
          GameState.noClickTimer = 0;
        }
      }
    }

    GameState.stats.update();
    GameState.processEventListener('afterRender', [delta]);
  }

  static updateTime(delta: number = 0){
    GameState.time += delta;

    if(GameState.deltaTime > 1000)
      GameState.deltaTime = GameState.deltaTime % 1;
  }

}
