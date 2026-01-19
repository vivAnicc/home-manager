{ config, ... }:

let
  fileName = name: "${config.home.homeDirectory}/Wallpapers/" + name;
  silksong = fileName "silksong";

  # set-wallpaper = pkgs.writeShellScriptBin "set-wallpaper" ''
  #   hyprctl hyprpaper reload , ${fileName "$@"}
  # '';
  #
  # cycle-wallpaper = pkgs.writeShellScriptBin "cycle-wallpaper" ''
  #   WALLPAPER_DIR="${config.home.homeDirectory}/Wallpapers/"
  #   CURRENT_WALL=$(hyprctl hyprpaper listloaded)
  #
  #   # Get a random wallpaper that is not the current one
  #   WALLPAPER=$(find "$WALLPAPER_DIR" -type f ! -name "$(basename "$CURRENT_WALL")" | shuf -n 1)
  #
  #   # Apply the selected wallpaper
  #   hyprctl hyprpaper reload ,"$WALLPAPER"
  # '';
in {
  # home.packages = [
  #   set-wallpaper
  #   cycle-wallpaper
  # ];

  services.hyprpaper = {
    enable = true;
    settings = {
      wallpaper = {
        monitor = "";
        path = silksong;
      };
    };
  };
}
