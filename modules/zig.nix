{ pkgs, lib, config, inputs, ... }:

{
	home.packages = [
		inputs.zig.packages."${pkgs.stdenv.hostPlatform.system}".master
		inputs.zls.packages."${pkgs.stdenv.hostPlatform.system}".zls
	];

	programs.nixvim.lsp.servers.zls = {
    enable = true;
    config.settings.zig_lib_path = lib.mkIf config.programs.nixvim.enable "${inputs.zig.packages."${pkgs.stdenv.hostPlatform.system}".master}/lib";
  };
}
