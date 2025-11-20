{ pkgs, ... }:

{
  home.packages = [
    pkgs.zellij
  ];

  home.file.".config/zellij/".source = ../dotfiles/zellij;
}
