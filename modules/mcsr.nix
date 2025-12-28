{ pkgs, ... }:

{
  home.packages = [
    pkgs.prismlauncher
    pkgs.graalvmPackages.graalvm-oracle_22
    pkgs.jemalloc
  ];
}
