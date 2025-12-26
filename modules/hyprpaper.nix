{ config, ... }:

let
  fileName = name: "${config.home.homeDirectory}/Wallpapers/" + name;
  # pool = fileName "oo8dehbnf3ae1.jpeg";
  # bed = fileName "4o4uaw69k6vf1.jpeg";
  # bath = fileName "qy128h3jhh9e1.jpeg";
  # carpet = fileName "qqcc1q1x6axe1.jpeg";
  # collage-big = fileName "d172qww3485d1.png";
  # collage-small = fileName "tqwj8joa6c8d1.png";
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
      preload = [
        # pool
        # bed
        # bath
        # carpet
        # collage-big
        # collage-small
        silksong
      ];

      wallpaper = [
        ", ${silksong}"
      ];
    };
  };
}
