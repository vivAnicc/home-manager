{ pkgs, inputs, ... }:

{
  imports = [
    modules/scripts.nix

    modules/c.nix
    modules/fish.nix
    modules/git.nix
    modules/nvim.nix
    modules/ssh.nix
    modules/typst.nix
    modules/zellij.nix
    modules/nh.nix
  ];

  home.packages = [
    pkgs.file
    pkgs.tree
    pkgs.comma
    pkgs.yt-dlp
    pkgs.less
    pkgs.wget

    inputs.copy-paste.packages.${pkgs.stdenv.hostPlatform.system}.default
 #   inputs.clip.packages.${pkgs.stdenv.hostPlatform.system}.default
  ];

  home.username = "droid";
  home.homeDirectory = "/home/droid";
  home.stateVersion = "25.11";
  programs.home-manager.enable = true;
}
