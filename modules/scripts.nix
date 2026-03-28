{ pkgs, lib, ... }:

let
  scripts = {
    "suspend" = "systemctl suspend";
  };
in {
  home.packages = lib.mapAttrsToList pkgs.writeShellScriptBin scripts;
}
