{ pkgs, ... }:

{
  xdg = {
    enable = true;
    terminal-exec.enable = true;
    mimeApps = {
      enable = true;

      defaultApplicationPackages = [
        pkgs.thunderbird
        pkgs.evince
        pkgs.protontricks
      ];
    };
  };
}
