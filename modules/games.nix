{ pkgs, inputs, ... }:

{
  home.packages = [
    pkgs.lumafly
    pkgs.r2modman
    pkgs.owmods-cli
    pkgs.heroic
    pkgs.protontricks
    pkgs.olympus

    inputs.amethyst.packages.${pkgs.stdenv.hostPlatform.system}.default
  ];

  xdg.desktopEntries = {
    amethystmodmanager = {
      type = "Application";
      name = "Amethyst Mod Manager";
      exec = "amethyst %U";
      terminal = false;
      mimeType = [
        "x-scheme-handler/nxm"
      ];
    };

    amethystmodmanager-nxm = {
      type = "Application";
      name = "Amethyst Mod Manager (NXM Handler)";
      exec = "amethyst --nxm %U";
      terminal = false;
      noDisplay = true;
      mimeType = [
        "x-scheme-handler/nxm"
      ];
    };
  };
}
