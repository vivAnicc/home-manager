{ pkgs, inputs, ... }:

{
  home.packages = [
    pkgs.lumafly
    pkgs.r2modman
    pkgs.owmods-cli
    pkgs.heroic

    inputs.amethyst.packages.${pkgs.stdenv.hostPlatform.system}.default
  ];
}
