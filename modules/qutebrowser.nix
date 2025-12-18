{ pkgs, ... }:

{
  home.packages = [
    pkgs.keyutils
  ];

  xdg.configFile."qutebrowser/catppuccin".source = pkgs.fetchFromGitHub {
    owner = "catppuccin";
    repo = "qutebrowser";
    rev = "715ebccaf8131eddaef3ef6960580735e4525244";
    hash = "sha256-0QPssOh87pl55tV+6zLVtT3toUrZac+RAcEZKDcSdKE=";
  };

  programs.rofi = {
    enable = true;
    theme = "Arc-Dark";
  };

  programs.qutebrowser = {
    enable = true;
    package = pkgs.qutebrowser.overrideAttrs {
      postInstall = # bash
      ''
        rm $out/share/applications/org.qutebrowser.qutebrowser.desktop
      '';
    };

    extraConfig = #python
    ''
      import catppuccin

      catppuccin.setup(c, 'mocha', True)

      # config.set('colors.webpage.darkmode.enabled', True);
      # config.set('colors.webpage.darkmode.enabled', False, 'about:blank');
    '';

    keyBindings.normal = {
      "<Ctrl+Shift+Tab>" = "tab-prev";
      "<Ctrl+Tab>" = "tab-next";
      "<Ctrl+e>" = "edit-text";
      "<Alt+e>" = "edit.url";
      "cc" = "spawn --userscript qute-bitwarden";
      "gd" = "config-cycle colors.webpage.darkmode.enabled";
    };

    settings = {
      colors.webpage = {
        darkmode = {
          algorithm = "lightness-cielab";
          enabled = true;
        };
        preferred_color_scheme = "dark";
      };
      content = {
        autoplay = false;
        blocking = {
          adblock.lists = [
            "https://easylist.to/easylist/easylist.txt"
            "https://easylist.to/easylist/easyprivacy.txt"
          ];
          enabled = true;
          method = "both";
          whitelist = null;
        };
      };
      editor.command = [ "${pkgs.fish}/bin/fish" "-c" "term nvim '{file}'" ];
      input.insert_mode.auto_load = false;
      scrolling.smooth = true;

      tabs = {
        last_close = "close";
        position = "top";
        show = "switching";
      };

      statusbar.show = "in-mode";

      url = {
        start_pages = "about:blank";
        default_page = "about:blank";
      };
    };

    perDomainSettings = {
      "git.suyu.dev".content.javascript.clipboard = "access-paste";
      "github.com".content.javascript.clipboard = "access-paste";

      "www.youtube.com".content.notifications.enabled = false;
      "about:blank".colors.webpage.darkmode.enabled = false;
    };
  };
}
