{ ... }:

{
  programs.git = {
    enable = true;
    settings = {
			init.defaultBranch = "master";
			user = {
				name = "nick";
				email = "nicc.gemm@gmail.com";
			};
      pull.rebase = false;
    };
  };
}
