 { ... }:

{
  programs.freetube = {
    enable = true;
    settings = {
      allowDashAv1Formats = true;
      checkForUpdates = false;
      baseTheme = "catppuccinMocha";
      autoplayPlaylist = false;
      defaultQuality = "2160";
      externalPlayer = "mpv";
      useSponsorBlock = true;
      sponsorBlockSponsor = {
	color = "Green";
	skip="autoSkip";
      };
      sponsorBlockIntro = {
	color="Cyan";
	skip="showInSeekBar";
      };
      sponsorBlockOutro = {
	color="Blue";
	skip="showInSeekBar";
      };
      sponsorBlockMusicOffTopic = {
	color="Orange";
	skip="showInSeekBar";
      };
      sponsorBlockRecap = {
	color="Indigo";
	skip="showInSeekBar";
      };
    };
  };
}
