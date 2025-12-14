{ ... }:

{
  services.ludusavi = {
    enable = true;
    backupNotification = true;

    settings = {
      backup.path = "/mnt/ludusavi-backup";
      restore.path = "/mnt/ludusavi-backup";

      roots = [
        {
          path = "~/.local/share/Steam";
          store = "steam";
        }
      ];

      theme = "dark";
    };
  };
}
