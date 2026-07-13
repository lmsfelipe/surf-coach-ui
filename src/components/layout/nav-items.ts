import { IconBarbell, IconBoard, IconHome, IconUser } from '@/components/icons';
import type { LinkProps } from '@tanstack/react-router';

export interface NavItem {
  to: LinkProps['to'];
  label: string;
  icon: typeof IconHome;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/sessions',       label: 'Sessões', icon: IconHome    },
  { to: '/boards',         label: 'Pranchas', icon: IconBoard   },
  { to: '/training-plans', label: 'Treinos',  icon: IconBarbell },
  { to: '/profile',        label: 'Perfil',   icon: IconUser    },
];
