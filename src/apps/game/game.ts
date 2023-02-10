import { ApplicationEnvironment } from "../../enums/ApplicationEnvironment";
// import { ConfigClient } from "../../utility/ConfigClient";

const query = new URLSearchParams(window.location.search);
let env: ApplicationEnvironment;
let app_profile: any;
let _Game: any;
let GameKey: any;

const Games = {
  KOTOR: 1,
  TSL: 2
}

if(window.location.origin === 'file://'){
  env = ApplicationEnvironment.ELECTRON;
}else{
  env = ApplicationEnvironment.BROWSER;
}

async function getProfile(){
  await KotOR.ConfigClient.Init();
  return KotOR.ConfigClient.get(`Profiles.${query.get('key')}`);
}

declare const KotOR: any;

const initializeApp = function(){
  KotOR.ApplicationProfile.ENV = env;
  if(env == ApplicationEnvironment.ELECTRON){
    KotOR.ApplicationProfile.directory = KotOR.GameFileSystem.rootDirectoryPath = app_profile.directory;
  }else{
    KotOR.GameFileSystem.rootDirectoryHandle = app_profile.directory_handle;
  }
  console.log('loading game...')
  KotOR.LoadingScreen.main.SetLogo(app_profile.logo);
  KotOR.LoadingScreen.main.SetBackgroundImage(app_profile.background);
  KotOR.LoadingScreen.main.Show();
  KotOR.GameState.GameKey = GameKey;
  KotOR.GameInitializer.Init({
    game: GameKey,
    onLoad: () => {
      console.log('loaded')
      KotOR.GameState.OpeningMoviesComplete = true;
      KotOR.GUIListBox.InitTextures();
      KotOR.OdysseyWalkMesh.Init();
      KotOR.GameState.Init();
      KotOR.GameState.audioEngine.musicGain.gain.value = 0;
      document.body.append(KotOR.GameState.stats.domElement)
    }
  });
};

async function showRequestDirectoryDialog(){
  let handle = await window.showDirectoryPicker({
    mode: "readwrite"
  });
  if(handle){
    if ((await handle.requestPermission({ mode: 'readwrite' })) === 'granted') {
      return handle;
    }
  }
  return;
}

async function spawnRequestDirectory(){
  let modal = document.getElementById('modal-grant-access');
  let btnGrant = document.getElementById('btn-grant-access');
  let btnQuit = document.getElementById('btn-quit');
  if(modal){
    modal?.classList.remove('show');
    modal?.classList.add('show');

    btnGrant?.addEventListener('click', async function(e: any) {
      let handle = await showRequestDirectoryDialog();
      if(handle){
        KotOR.GameFileSystem.rootDirectoryHandle = handle;
        KotOR.ConfigClient.set(`Profiles.${app_profile.key}.directory_handle`, handle);
        modal?.classList.remove('show');
        initializeApp();
      }
    });

    btnQuit?.addEventListener('click', async function(e: any) {
      window.close();
    });
  }
}

async function validateDirectoryHandle(handle: FileSystemDirectoryHandle){
  try{
    if ((await handle.requestPermission({ mode: 'readwrite' })) === 'granted') {
      return true;
    }
    return false;
  }catch(e){
    console.error(e);
    return false;
  }
}

( async () => {

  app_profile = await getProfile();
  KotOR.ApplicationProfile.InitEnvironment(app_profile);
  
  switch(app_profile.launch.args.gameChoice){
    case 2:
      _Game = Games.TSL;
      GameKey = 'TSL';
    break;
    default:
      _Game = Games.KOTOR;
      GameKey = 'KOTOR';
    break;
  }
  
  KotOR.LoadingScreen.main.SetLogo(app_profile.logo);
  KotOR.LoadingScreen.main.SetBackgroundImage(app_profile.background);
  KotOR.LoadingScreen.main.Show();

  if(env == ApplicationEnvironment.ELECTRON){
    if(await KotOR.GameFileSystem.exists('chitin.key')){
      initializeApp();
    }else{
      (window as any).electron.locate_game_directory(app_profile).then( (directory: string) => {
        console.log('directory', directory);
        if(directory){
          KotOR.ConfigClient.set(`Profiles.${app_profile.key}.directory`, directory);
          app_profile.directory = directory;
        }
      }).catch( (e: any) => {
        KotOR.ConfigClient.set(`Profiles.${app_profile.key}.directory`, '');
        console.error(e);
        window.location.reload();
      });
    }
  }else{
    if(KotOR.GameFileSystem.rootDirectoryHandle){
      let validated = await validateDirectoryHandle(KotOR.GameFileSystem.rootDirectoryHandle);
      if(validated){
        initializeApp();
      }else{
        spawnRequestDirectory();
      }
    }else{
      spawnRequestDirectory();
    }
  }

})();
