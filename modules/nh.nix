{ config, ... }:

{
  programs.nh = {
    enable = true;
    homeFlake = config.xdg.configHome + "/home-manager";
  };
}
