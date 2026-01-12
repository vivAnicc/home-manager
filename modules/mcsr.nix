{ pkgs, ... }:

{
  home.packages = [
    pkgs.prismlauncher
    pkgs.jemalloc
    pkgs.grim
  ];
}
