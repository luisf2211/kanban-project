'use client';

import { useState } from 'react';
import {
  IconManualGearbox,
  IconPaperclip,
  IconUser,
  IconLayoutKanban,
} from '@tabler/icons-react';
import { Stack, Tooltip, UnstyledButton } from '@mantine/core';
import classes from './navbar.module.css';

import ProyectosPage from './proyectos/page';
import ClientesPage from './clientes/page';
import ArchivosPage from './archivos/page';

interface NavbarLinkProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={`${classes.link} ${active ? classes.active : ''}`}
      >
        <Icon size={22} stroke={1.6} />
      </UnstyledButton>
    </Tooltip>
  );
}

const menuItems = [
  { icon: IconLayoutKanban, label: 'Proyectos' },
  { icon: IconUser, label: 'Clientes' },
  { icon: IconPaperclip, label: 'Archivos' },
];

export default function Dashboard() {
  const [active, setActive] = useState(0);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <nav className={classes.navbar}>
        <div className={classes.logoContainer}>
          <img src="/logo.png" className={classes.logo} alt="Logo" />
        </div>

        <div className={classes.navbarMain}>
          <Stack gap="xs">
            {menuItems.map((item, index) => (
              <NavbarLink
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={active === index}
                onClick={() => setActive(index)}
              />
            ))}
          </Stack>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        {active === 0 && <ProyectosPage />}
        {active === 1 && <ClientesPage />}
        {active === 2 && <ArchivosPage />}
      </main>
    </div>
  );
}
