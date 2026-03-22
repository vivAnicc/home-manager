{ pkgs, inputs, ... }:

{
  home.packages = [
    pkgs.lumafly
    pkgs.r2modman
    pkgs.owmods-cli
    pkgs.heroic

    inputs.dmodman.packages.${pkgs.stdenv.hostPlatform.system}.default
  ];

  xdg = {
    desktopEntries.dmodman = {
      name = "dmodman";
      genericName = "Mod Manager";
      exec = "dmodman %U";
      terminal = false;
      mimeType = [
        "x-scheme-handler/nxm-protocol"
        "x-scheme-handler/nxm"
      ];
    };
  };
}
