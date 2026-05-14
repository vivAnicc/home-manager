{ inputs, pkgs, ... }:

{
  home.sessionVariables.TERMINAL = "ghostty";
  xdg.terminal-exec.settings.default = [ "com.mitchellh.ghostty.desktop" ];

  programs.ghostty = {
    enable = true;
    # package = inputs.ghostty.packages.${pkgs.stdenv.hostPlatform.system}.default;
    # systemd.enable = true;

    enableFishIntegration = true;
    installVimSyntax = true;
    settings = {
      cursor-style = "block";
      shell-integration = "fish";

      window-inherit-working-directory = false;

      theme = "Catppuccin Mocha";
      scrollbar = "never";

      focus-follows-mouse = true;

      window-padding-y = 1;
      window-padding-balance = true;
      window-decoration = false;
      gtk-tabs-location = "hidden";
      unfocused-split-opacity = 1;

      # keybind = [
      # ];
    };
  };
}
