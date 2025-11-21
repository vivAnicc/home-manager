{ lib, pkgs, ... }:

{
  qt = {
    enable = true;
    platformTheme.name = "adwaita";
  };

  home.pointerCursor = {
    gtk.enable = true;
    package = pkgs.gnome-themes-extra;
    name = "Adwaita";
    size = 24;
  };

  gtk = {
    enable = true;
    colorScheme = "dark";
    theme = {
      name = "Adwaita-dark";
      package = pkgs.gnome-themes-extra;
    };
    cursorTheme = {
      package = pkgs.gnome-themes-extra;
      name = "Adwaita";
      size = 24;
    };
    iconTheme = {
      package = pkgs.adwaita-icon-theme;
      name = "Adwaita-dark";
    };
  };

  # xdg.portal = {
  #   enable = lib.mkForce true;
  #   extraPortals = [
  #     pkgs.xdg-desktop-portal-gtk
  #   ];
  #   config.common.default = "*";
  # };

  dbus.packages = [
    pkgs.dconf
  ];

  home.sessionVariables.GTK_THEME = "Adwaita-dark";
  home.packages = [
    pkgs.gnome-themes-extra
  ];
}
