{ inputs, ... }:

{
  targets.genericLinux = {
    enable = true;
    gpu.nvidia = {
      enable = true;
      version = "595.71.05";
      sha256 = "sha256-jA1Plnt5MsSrVxQnKu6BAzkrCnAskq+lVRdtNiBYKfk=";
    };
    # nixGL = {
    #   packages = inputs.nixgl.packages;
    #   defaultWrapper = "mesa";
    #   offloadWrapper = "nvidiaPrime";
    #   installScripts = [ "mesa" "nvidiaPrime" ];
    # };
  };
}
