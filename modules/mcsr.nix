{ pkgs, ... }:

{
  home.packages = [
    pkgs.prismlauncher
    pkgs.graalvmPackages.graalvm-oracle
    pkgs.jemalloc
  ];

  imports = [
    ./waywall.nix
  ];
}
