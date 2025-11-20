{ pkgs, ... }:

{
  home.packages = [
    pkgs.gcc
    pkgs.ccls
    pkgs.gnumake
    pkgs.cmake
  ];
}
