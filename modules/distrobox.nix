{ ... }:

{
  programs.distrobox = {
    enable = true;

    containers = {
      alpine = {
        entry = true;
        image = "alpine:latest";
      };
    };
  };
}
