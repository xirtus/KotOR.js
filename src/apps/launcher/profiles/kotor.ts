export const LauncherConfig: any = {
  "name": "KotOR",
  "full_name": "Star Wars: Knights of the Old Republic",
  "icon": "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/32370/0bb8aed2de4ae751637ddb5ac7edb0b786698f14.ico",
  "logo": "https://steamcdn-a.akamaihd.net/steam/apps/32370/logo.png",
  "background": "https://img.wallpapersafari.com/desktop/1920/1080/72/33/uBjXWl.jpg",
  "background_fallback": "./images/uBjXWl.jpg",
  "category": "game",
  "directory": null,
  "locate_required": true,
  "isForgeCompatible": true,
  "steam_id" : 32370,
  "width": 1200,
  "height": 600,
  "executable": {
    "win": "swkotor.exe",
    "mac": "KOTOR.app"
  },
  "launch": {
    "type": "electron",
    "path": "game/index.html",
    "backgroundColor": "#000000",
    "args": { "gameChoice": 1 },
    "fullscreen": true
  },
  "verify_install_dir": true,
  "elements" : [
    {
      "type": "video",
      "url": "https://steamcdn-a.akamaihd.net/steam/apps/256671298/movie_max.webm"
    }
  ],
  "settings" : {
    "fullscreen": {
      "name": "Fullscreen at launch?",
      "type": "boolean",
      "defaultValue": true
    },
    "devtools": {
      "name": "Open Devtools at launch?",
      "type": "boolean",
      "defaultValue": false
    }
  }
}