import {
  AndroidLogo,
  AppleLogo,
  Article,
  Browser,
  CalendarCheck,
  ChartBarHorizontal,
  ChatsCircle,
  DownloadSimple,
  EnvelopeSimple,
  FacebookLogo,
  FirstAid,
  FolderOpen,
  GlobeHemisphereWest,
  HardHat,
  InstagramLogo,
  LinkedinLogo,
  LinuxLogo,
  Newspaper,
  PenNib,
  Question,
  UsersThree,
  VideoCamera,
  WindowsLogo,
} from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { MenuIcon } from "@/content/navigation";
import type { PlatformId, SocialIcon } from "@/content/site";

/*
 * One icon set (Phosphor, regular weight), rendered on the server only. Icons mark navigation items,
 * platforms and social profiles, where they speed up recognition.
 */

export const menuIcons: Record<MenuIcon, Icon> = {
  chats: ChatsCircle,
  video: VideoCamera,
  files: FolderOpen,
  feed: Newspaper,
  events: CalendarCheck,
  polls: ChartBarHorizontal,
  distributed: GlobeHemisphereWest,
  field: HardHat,
  studio: PenNib,
  healthcare: FirstAid,
  about: UsersThree,
  download: DownloadSimple,
  blog: Article,
  faq: Question,
  contact: EnvelopeSimple,
};

export const platformIcons: Record<PlatformId, Icon> = {
  web: Browser,
  macos: AppleLogo,
  windows: WindowsLogo,
  linux: LinuxLogo,
  ios: AppleLogo,
  android: AndroidLogo,
};

export const socialIcons: Record<SocialIcon, Icon> = {
  linkedin: LinkedinLogo,
  instagram: InstagramLogo,
  facebook: FacebookLogo,
};
