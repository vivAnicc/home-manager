{ pkgs, ... }:

{
  home.packages = [
    pkgs.typst
  ];
  
  # The lsp is installed in nvim.nix
}
