{ pkgs, lib, inputs, ... }:

{
  home.packages = [
    pkgs.fish
    pkgs.fzf
    pkgs.bitwarden-cli
    pkgs.jp
    inputs.nix-your-shell.packages."${pkgs.stdenv.hostPlatform.system}".nix-your-shell
    (
     pkgs.writeShellScriptBin "lights-off" #bash
     ''
      systemctl hibernate
     ''
    )
  ];

  programs.fish = {
    enable = true;
    generateCompletions = true;

    shellAbbrs = {
      v = "nvim";
      m = "${pkgs.bc}/bin/bc -q";

      la = "ls -A";
			"-" = "cd -";

      nd = "cd /etc/nixos";
      ngc = "sudo nix-collect-garbage -d";
      nbs = "nixos-rebuild switch --sudo";
			nbr = "nixos-rebuild repl";

      hd = "cd ~/.config/home-manager";
      hm = "home-manager";

      ga = "git add .";
      gc = {
        setCursor = "%";
        expansion = "git commit -m '%'";
      };
      gca = "git commit --amend --no-edit";

			tc = "rm -rvf /home/nick/temp; mkdir -vp /home/nick/temp";
			td = "cd /home/nick/temp";
    };
    functions = {
      d = # fish
      ''
        mkdir $argv && cd $argv
      '';

      bwa = lib.fileContents ../dotfiles/fish/functions/bwa.fish;
      bwu = lib.fileContents ../dotfiles/fish/functions/bwu.fish;
      bwp = lib.fileContents ../dotfiles/fish/functions/bwp.fish;
      bwup = lib.fileContents ../dotfiles/fish/functions/bwup.fish;

      term = # fish
      ''
        if test (count $argv) -gt 0
            $TERMINAL -e fish -c "cd $HOME; $argv"
        else
            $TERMINAL -e fish -C "cd $HOME"
        end
      '';

      y = # fish
      ''
        set tmp (mktemp -t "yazi-cwd.XXXXXX")
        yazi $argv --cwd-file="$tmp"
        if set cwd (command cat -- "$tmp"); and [ -n "$cwd" ]; and [ "$cwd" != "$PWD" ]
          cd -- "$cwd"
        end
        rm -f -- "$tmp"
      '';

      explorer = # fish
      ''
        set tmp (mktemp -t "yazi-cdw.XXXXXX")
        yazi $argv --cwd-file="$tmp"
        if set cwd (command cat -- "$tmp"); and [ -n "$cwd" ]
            rm -f -- "$tmp"
            cd -- $cwd
            fish
        else
            rm -f -- "$tmp"
        end
      '';

      fish_greeting = "";
      fish_command_not_found = "";

      fish_prompt = # fish
      ''
        set -l last_status $status

        set -l stat
        if test $last_status -ne 0
            set -l msg (fish_status_to_signal $last_status)
            if test $msg = 127
        	set msg NOTFOUND
            end
            set stat (set_color -o brred)"[$msg]"(set_color normal)
        end

        string join "" -- (set_color -o 87FF00) (whoami) (set_color -o C3CBE9) ':' \
            (set_color -o AFFFFF) (prompt_pwd --full-length-dirs 2) (set_color C3CBE9) \
            '$' $stat (set_color normal) ' '
      '';

      fish_user_key_bindings = # fish
      ''
        fish_default_key_bindings -M insert
        fish_vi_key_bindings --no-erase insert
      '';

      fish_right_prompt = # fish
      ''
        if not test -z "$IN_NIX_SHELL"
        	string join "" -- (set_color -o blue) '(N)' (set_color normal)
        end
      '';
    };

    shellAliases = {
      py = "${pkgs.python3}/bin/python3";
    };

    shellInit = # fish
    ''
      set fish_cursor_default block blink
      set fish_cursor_insert line blink
      set fish_cursor_replace_one underscore
      set fish_cursor_replace underscore

      set fish_vi_force_cursor

      set -e fish_features

      fish_config theme choose "Catppuccin Mocha"

      if test -z "$CONTAINER_ID"
        nix-your-shell fish | source
      else
        set OLD_PATH $PATH
        set PATH /usr/local/sbin /usr/local/bin /usr/sbin /usr/bin /sbin /bin /usr/local/sbin /usr/local/bin /usr/sbin /usr/bin /sbin /bin
      end
    '';
  };

  home.file.".config/fish/themes/Catppuccin Mocha.theme".source = ../dotfiles/fish/themes + "/Catppuccin Mocha.theme";
}
