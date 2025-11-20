{ pkgs, ... }:

let
  script = #fish
  ''
#!/usr/bin/env fish
    if test (count $argv) != 1
      echo "Incorrect usage" 1>&2
      echo "Correct usage: $(status filename) <dir>" 1>&2
      exit 1
    end

    set -l dir $argv[1]
    set -l choosen (find -L $dir -nowarn -type d -maxdepth 5 -printf "%P\n" 2>/dev/null | wofi --matching=fuzzy --show dmenu)
    printf $choosen
  '';
  package = pkgs.stdenvNoCC.mkDerivation {
    name = "choose-dir";
    version = "1.0";

    src = builtins.toFile "choose-dir.fish" script;

    buildInputs = [
      pkgs.fish
      pkgs.coreutils
      pkgs.wofi
    ];

    dontUnpack = true;

    installPhase = ''
      mkdir -p $out/bin
      cp $src $out/bin/choose-dir
      chmod a+x $out/bin/choose-dir
    '';
  };
in {
  home.packages = [ package ];
}
