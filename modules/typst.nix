{ pkgs, ... }:

{
  home.packages = [
    pkgs.typst
    pkgs.tinymist
  ];

	programs.nixvim.lsp.servers.tinymist.enable = true;
}
