{ inputs, ... }:

{
  home.sessionVariables.TERMINAL = "ghostty";
  xdg.terminal-exec.settings.default = [ "com.mitchellh.ghostty.desktop" ];

  programs.ghostty = {
    enable = true;
    package = inputs.ghostty.packages.x86_64-linux.default;
    # systemd.enable = true;

    enableFishIntegration = true;
    settings = {
      cursor-style = "block";
      shell-integration = "fish";

      theme = "Catppuccin Mocha";

      focus-follows-mouse = true;

      window-padding-y = 1;
      window-padding-balance = true;
      window-decoration = false;
      gtk-tabs-location = "hidden";
      unfocused-split-opacity = 1;

      keybind = [
        "ctrl+a>ctrl+r=reload_config"
        "ctrl+a>ctrl+a=text:"
        "ctrl+a>r=reset"

        "ctrl+a>shift+h=toggle_window_decorations"
        "ctrl+a>d=close_surface"

        "ctrl+a>s>h=new_split:left"
        "ctrl+a>s>j=new_split:down"
        "ctrl+a>s>k=new_split:up"
        "ctrl+a>s>l=new_split:right"

        "ctrl+a>h=goto_split:left"
        "ctrl+a>j=goto_split:bottom"
        "ctrl+a>k=goto_split:top"
        "ctrl+a>l=goto_split:right"

        "ctrl+a>t=toggle_tab_overview"
        "ctrl+a>c=new_tab"
        "ctrl+a>0=goto_tab:1"
        "ctrl+a>1=goto_tab:2"
        "ctrl+a>2=goto_tab:3"
        "ctrl+a>4=goto_tab:4"
      ];
    };
  };
}
