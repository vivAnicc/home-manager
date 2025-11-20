{ pkgs, ... }:

{
  programs.waybar = {
    enable = true;
    style = ../dotfiles/waybar/style.css;
    settings = [
      {
        name = "topbar";
        position = "top";
        height = 30;
        modules-left = [ "hyprland/workspaces" ];
        modules-center = [ "hyprland/window" ];
        modules-right = [ "pulseaudio" "network" "cpu" "clock" "tray" ];
        tray = {
          icon-size = 21;
          spacing = 10;
        };
        clock.format-alt = "{:%d-%m-%Y}";
        cpu.format = "{usage}% ";
        memory.format = "{}% ";
        network = {
          format-wifi = "{essid} ({signalStrength}%) ";
          format-ethernet = "{ifname}: {ipaddr}/{cidr} ";
          format-disconnected = "Disconnected ⚠";
        };
        pulseaudio = {
          format = "{volume}% {icon}";
          format-bluetooth = "{volume}% {icon}";
          format-muted = "";
          format-icons = {
              headphones = "";
              handsfree = "";
              headset = "";
              phone = "";
              portable = "";
              car = "";
              default = [ "" "" ];
          };
          on-click = "${pkgs.pavucontrol}/bin/pavucontrol";
        };
      }
    ];
  };
}
