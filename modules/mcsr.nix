{ pkgs, ... }:

{
  home.packages = [
    pkgs.prismlauncher
    pkgs.graalvmPackages.graalvm-oracle
    pkgs.jemalloc
    pkgs.waywall
  ];
}
