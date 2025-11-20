{ config, pkgs, ... }:

{
  home.packages = [
    pkgs.hypridle
    pkgs.killall
  ];

  home.file."${config.home.homeDirectory}/.config/hypr/hypridle.conf".source = ../dotfiles/hypridle.conf;
}
