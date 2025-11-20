{ ... }:

{
  services.ludusavi = {
    enable = true;
    backupNotification = true;

    settings = {
      backup.path = "/mnt/drive/ludusavi-backup";
      restore.path = "/mnt/drive/ludusavi-backup";

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
