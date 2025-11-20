{ pkgs, inputs, ... }:

{
  home.packages = [
    pkgs.lumafly
    inputs.needlelight.packages.${pkgs.stdenv.hostPlatform.system}.needlelight
  ];
}
