{ pkgs, inputs, ... }:

{
  imports = [
    modules/mcsr.nix

    modules/fish.nix
    modules/ghostty.nix
    modules/git.nix
    modules/mpv.nix
    modules/nvim.nix
    modules/qutebrowser.nix
    modules/ssh.nix
    modules/themes.nix
    modules/thunar.nix
  ];

  # targets.genericLinux.enable = true;
  targets.genericLinux = {
    enable = true;
    gpu.nvidia = {
      enable = true;
      version = "590.48.01";
      sha256 = "sha256-ueL4BpN4FDHMh/TNKRCeEz3Oy1ClDWto1LO/LWlr1ok=";
    };
  };

  home.packages = [
    pkgs.file
    pkgs.tree
    pkgs.gnome-themes-extra
    pkgs.bitwarden-desktop
    pkgs.thunderbird
    pkgs.wine
    pkgs.comma
    pkgs.evince
    pkgs.yt-dlp
    pkgs.nix

    inputs.copy-paste.packages.${pkgs.stdenv.hostPlatform.system}.default
  ];

  home.username = "mcsr";
  home.homeDirectory = "/home/mcsr";
  home.stateVersion = "25.11";
  programs.home-manager.enable = true;
}
