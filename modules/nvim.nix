{ pkgs, utils, ... }:

let
  nvim = utils.lib.mkNeovim {
    system = pkgs.stdenv.hostPlatform.system;
    extraPkgs = [
      pkgs.nixd
      pkgs.tinymist
    ];
    lsp = [ "nixd" "tinymist" ];
  };
in {
  xdg.mimeApps.defaultApplicationPackages = [ pkgs.neovim ];

	home.sessionVariables = {
		EDITOR = "${nvim}/bin/nvim";
		MANPAGER = "${nvim}/bin/nvim +Man!";
	};

  home.packages = [
    nvim
  ];
}
