{ pkgs, ... }:

{
  home.packages = [
    pkgs.lumafly
    pkgs.r2modman
  ];
}
