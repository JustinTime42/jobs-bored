'use client'
import React, { useEffect } from 'react';
import {
  Box,
  CssBaseline,
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Favorite as FavoriteIcon,
  Feed as FeedIcon,
} from '@mui/icons-material';
import AuthButton from '@/src/components/AuthButton';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import styles from './NavPanel.module.css';

const drawerWidth = 200;

interface Props {
  children: React.ReactNode;
}

export default function NavPanel({ children }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [ activeMenu, setActiveMenu ] = React.useState<string | null>(null);

  useEffect(() => {
    const lastPathSegment = pathname?.split('/').pop();
    setActiveMenu(lastPathSegment || "");
    console.log(lastPathSegment)
  },[pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div style={{paddingTop:"1em"}}>
      <Toolbar />
      <Divider />
      <List>
        <ListItem 
            className={activeMenu === "feed" ? styles.activeMenu : ""}
            style={{padding:0}} 
            disablePadding 
            component={Link} 
            href="/dashboard/feed" >
            <ListItemButton>
              <ListItemIcon>
                <FeedIcon />
              </ListItemIcon>
              <ListItemText primary={"Company Feed"} />
            </ListItemButton>
          </ListItem>
          <ListItem 
            className={activeMenu === "settings" ? styles.activeMenu : ""}
            style={{padding:0}} 
            disablePadding 
            component={Link} 
            href="/dashboard/settings" 
            >
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={"Settings"} />
            </ListItemButton>
          </ListItem>
      </List>
    </div>
  );

  return (
    <div className={styles.container}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
      <MuiAppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
        style={{
            backgroundColor: "rgb(249, 250, 251)",
            color: "#333333",
            display: "flex",
            alignItems: "center",
        }}
        >
        {/* Left Side */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
            <IconButton
            color="inherit"
            aria-label="Open navigation"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: "none" } }} // Show only on mobile
            >
            <MenuIcon />
            </IconButton>
        </Box>
        <Box component={Link} href="/">
            <Image
            src="/logo-no-headline.png"
            alt="Logo"
            width={256}
            height={256}        
            />
        </Box>
        <Box
            sx={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            }}
        >
            <AuthButton />
        </Box>
        </Toolbar>
      </MuiAppBar>
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
        aria-label="Navigation drawer"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
          sx={{
            display: { xs: 'block', lg: 'none' }, // Only display on mobile
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }, 
          }}

        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' }, // Hide on mobile
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 0, sm: 3 },
          width: "100%",
          marginTop: "100px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {children}
      </Box>
      </Box>
    </div>
  );
}

