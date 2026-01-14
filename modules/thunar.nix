{ pkgs, ... }:

{
  home.packages = [
    (pkgs.thunar.override {
      thunarPlugins = [
        pkgs.thunar-volman
        pkgs.thunar-archive-plugin
      ];
    })
  ];

  xdg.mimeApps.defaultApplications."inode/directory" = [ "thunar.desktop" ];
}
