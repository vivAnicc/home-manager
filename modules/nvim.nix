{ lib, pkgs, inputs, ... }:

let
	parsers = lib.mapAttrsToList
		(_: a: a) 
		pkgs.vimPlugins.nvim-treesitter-parsers;
	parsers-pkgs = lib.filter
		lib.isDerivation
		parsers;
in {
	imports = [
		inputs.nixvim.homeModules.nixvim
	];

	home.sessionVariables = {
		EDITOR = "nvim";
		MANPAGER = "nvim +Man!";
	};

	home.packages = [
		pkgs.nixd
		pkgs.ripgrep
	] ++ parsers-pkgs;

	programs.nixvim = {
		enable = true;
		colorschemes.catppuccin.enable = true;

		plugins = {
			lz-n.enable = true;

			oil = {
				enable = true;
				settings = {
					columns = [ "icons" ];
					constrain_cursor = "name";
					default_file_explorer = true;
					skip_confirm_for_simple_edits = true;
				};
			};

			treesitter = {
				enable = true;
				settings = {
					highlight.enable = true;
				};
			};

			lspconfig.enable = true;

			fzf-lua = {
				enable = true;
        package = pkgs.vimPlugins.fzf-lua;
				profile = "default";
				settings.files = {
					git_icons = false;
					file_icons = false;
					color_icons = true;
				};
				keymaps = {
					"<leader>sf" = "files";
					"<leader>sb" = "buffers";
					"<leader>sh" = "helptags";
					"<leader>sr" = "resume";
					"<leader>sk" = "keymaps";
					"<leader>sg" = "grep";
					"<leader>sa" = "lsp_code_actions";
					"<leader>ss" = "lsp_document_symbols";
					"<leader>sdd" = "diagnostics_document";
					"<leader>sdw" = "diagnostics_workspace";
				};
			};
		};

		lsp = {
			servers = {
				nixd.enable = true;
        hls.enable = true;
				gopls.enable = true;
				rust_analyzer.enable = true;
			};

			inlayHints.enable = false;

			onAttach = #lua
      ''
				if client:supports_method('textDocument/completion') then
					vim.lsp.completion.enable(true, client.id, bufnr, { autotrigger = true })
				end
			'';

			keymaps = [
				{
					key = "gd";
					lspBufAction = "definition";
				}
				{
					key = "gt";
					lspBufAction = "type_definition";
				}
				{
					key = "gr";
					lspBufAction = "references";
				}
				{
					key = "<leader>lr";
					lspBufAction = "rename";
				}
				{
					key = "<leader>ls";
					lspBufAction = "signature_help";
				}
			];
		};

		extraConfigLua = ''
			vim.cmd("set completeopt+=noselect")
      vim.cmd("set shortmess+=I")
    '';

    autoCmd = [
      {
        event = ["BufEnter"];
        command = "set tabstop=2";
      }
      {
        event = ["BufEnter"];
        command = "set softtabstop=2";
      }
      {
        event = ["BufEnter"];
        command = "set shiftwidth=2";
      }
      {
        event = ["BufEnter"];
        command = "set expandtab";
      }
    ];

		opts = {
			tabstop = 2;
      softtabstop = 2;
			shiftwidth = 2;
			expandtab = true;

			ignorecase = true;
			smartcase = true;
			incsearch = true;

			inccommand = "split";

			number = true;
			relativenumber = true;
			signcolumn = "yes";
			cursorcolumn = false;

			smartindent = true;
      cindent = true;

			swapfile = false;
			undofile = true;

			termguicolors = true;

			winborder = "rounded";

			scrolloff = 5;

      timeout = false;

      cmdwinheight = 1;
		};

		globals = {
			mapleader = " ";
		};

		keymaps = [
			# {
			# 	mode = "n";
			# 	key = ":";
			# 	action = "q:i";
			# }
      {
				mode = "n";
				key = "<leader>e";
				action = "<cmd>Oil<CR>";
			}
			{
				mode = ["n" "v" "x"];
				key = "<leader>y";
				action = "\"+y";
			}
			{
				mode = ["n" "v" "x"];
				key = "<leader>p";
				action = "\"+p";
			}
			{
				mode = ["n" "v" "x"];
				key = "<leader>P";
				action = "\"+P";
			}
			{
				mode = "n";
				key = "<leader>o";
				action = "moo<Esc>`o";
			}
			{
				mode = "n";
				key = "<leader>O";
				action = "moO<Esc>`o";
			}
			{
				mode = "n";
				key = "<C-c>";
				action = "<cmd>nohlsearch<CR><cmd>let @/=\"\"<CR>";
			}
		];
	};
}
