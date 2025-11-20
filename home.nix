{ pkgs, config, inputs, ... }:

{
  imports = [
    modules/c.nix
    modules/choose-dir.nix
    modules/distrobox.nix
    modules/fish.nix
    modules/games.nix
    modules/ghostty.nix
    modules/git.nix
    modules/hypridle.nix
    modules/hyprland.nix
    modules/hyprpaper.nix
    modules/ludusavi.nix
    modules/mpv.nix
    modules/nvim.nix
    modules/qutebrowser.nix
    modules/ssh.nix
    modules/themes.nix
    modules/thunar.nix
    modules/typst.nix
    modules/vesktop.nix
    modules/waybar.nix
    modules/wofi.nix
    modules/xdg.nix
    modules/zellij.nix
    modules/zig.nix
  ];

  home.packages = [
    pkgs.file
    pkgs.tree
    pkgs.gnome-themes-extra
    pkgs.bitwarden-desktop
    pkgs.thunderbird
    pkgs.wine
    pkgs.comma
    pkgs.evince

    inputs.copy-paste.packages.x86_64-linux.default
  ];

  home.file."games".source = config.lib.file.mkOutOfStoreSymlink "${config.home.homeDirectory}/.local/share/Steam/steamapps/common";

  home.username = "nick";
  home.homeDirectory = "/home/nick";
  home.stateVersion = "25.05";
  programs.home-manager.enable = true;
}
