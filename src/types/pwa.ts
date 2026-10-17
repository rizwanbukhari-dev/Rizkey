export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type InstallationStatus = 'uninstalled' | 'installing' | 'installed';

export interface PWAContextValue {
  isInstallable: boolean;
  isInstalled: boolean;
  installationStatus: InstallationStatus;
  isIOS: boolean;
  isStandalone: boolean;
  isModalOpen: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  promptInstall: () => Promise<void>;
}
