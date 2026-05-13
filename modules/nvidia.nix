{ inputs, ... }:

{
  targets.genericLinux = {
    enable = true;
    gpu.nvidia = {
      enable = true;
      version = "595.71.05";
      sha256 = "sha256-NiA7iWC35JyKQva6H1hjzeNKBek9KyS3mK8G3YRva4I=";
    };
    # nixGL = {
    #   packages = inputs.nixgl.packages;
    #   defaultWrapper = "mesa";
    #   offloadWrapper = "nvidiaPrime";
    #   installScripts = [ "mesa" "nvidiaPrime" ];
    # };
  };
}
