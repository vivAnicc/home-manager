{ lib, ... }:

{
  programs.wofi = {
    enable = true;
    style = lib.fileContents ../dotfiles/wofi/style.css;
  };
}
