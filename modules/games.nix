{ pkgs, ... }:

{
  home.packages = [
    pkgs.lumafly
    pkgs.r2modman
    pkgs.owmods-cli
  ];
}
