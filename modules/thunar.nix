{ pkgs, ... }:

{
  home.packages = [
    (pkgs.xfce.thunar.override {
      thunarPlugins = [
        pkgs.xfce.thunar-volman
        pkgs.xfce.thunar-archive-plugin
      ];
    })
  ];

  xdg.mimeApps.defaultApplications."inode/directory" = [ "thunar.desktop" ];
}
