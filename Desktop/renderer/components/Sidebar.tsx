import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import {  AiFillDelete, AiTwotoneHome, AiFillMedicineBox } from 'react-icons/ai';
import {FaUserInjured , FaUserMd, FaAmbulance, FaPrescriptionBottleAlt} from 'react-icons/fa';
import { IoLogOut } from 'react-icons/io5';
import { IoIosNotifications } from 'react-icons/io';
import { VscGitPullRequestGoToChanges } from 'react-icons/vsc';
import { useAuth } from '../utils/AuthContext';
import Router from 'next/router';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import WorkIcon from '@mui/icons-material/Work';
import { flexbox, fontSize } from '@mui/system';
import { BsBagPlusFill } from 'react-icons/bs';
import BedIcon from '@mui/icons-material/Bed';
import { Button } from '@mui/material';
import { Dialog, DialogContent } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { DataGrid, GridCellParams } from '@mui/x-data-grid';
import { NotifUtils } from '../utils/notif_manager';
import { HiDocumentReport } from 'react-icons/hi';
import { PiCertificateFill } from 'react-icons/pi';
import { MdMeetingRoom } from 'react-icons/md'


const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  backgroundColor: theme.palette.primary.main,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
    backgroundColor: "black"
  }),
);

// const rows = [];
// const staffId = 'wLICExScbRVdX0myUlpnpppZApp1';

// for (let i = 0; i < 5; i++) {
//   const row = {
//     staffId: staffId,
//     content: 'This is ur job ....',
//     title: 'Newly Assigned Job',
//   };
//   rows.push(row)
//   NotifUtils.insertNotif(row.title, row.content, staffId)
// }

export default function Sidebar() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const { authenticatedUser, logout } = useAuth();
  const [userRole, setUserRole] = React.useState("");

  React.useEffect (() => {
    setUserRole(localStorage.getItem("role"))
  }, [])

  const handleHome = () => {
    Router.push('home');
  }

  const handleLogout = () => {
    if(authenticatedUser !== null){
      logout();
      localStorage.clear();
      signOut(auth)
        .then(() => {
          Router.push('login');
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
    }
    localStorage.clear();
    Router.push('login');
  };

  const handleRequest = () => {
    Router.push('requests');
  };

  const handleStaff = () => {
    Router.push('staffs');
  };

  const handleStaffJob = () => {
    Router.push('jobmanagement');
  };

  const handleJobs = () => {
    Router.push('jobs');
  };

  const handlePatient = () => {
    Router.push('patients');
  };
  
  const handleRoom = () => {
    Router.push('rooms');
  }

  const handleReport = () => {
    Router.push('reports');
  }

  const handleCertif = () => {
    Router.push('certificates');
  }

  const handleAmbulance = () => {
    Router.push('ambulances');
  }

  const handleAppoint = () => {
    Router.push('appointments');
  }

  const handleMedicine = () => {
    Router.push('medicines');
  }

  const handlePrescription = () => {
    Router.push('prescriptions');
  }
  
  const sidebarItemsByRole = {
    admin: [
      { text: 'Home', icon: <AiTwotoneHome size={'24'}/>, onClick: handleHome},
      { text: 'Staffs', icon: <FaUserMd size={'24'} />, onClick : handleStaff},
      { text: 'Add Jobs', icon: <BsBagPlusFill size={'24'}/>, onClick : handleStaffJob},
      { text: 'Staff Requests', icon: <VscGitPullRequestGoToChanges size={'24'}/>, onClick : handleRequest},
      { text: 'Patients', icon: <FaUserInjured size={'24'} />, onClick : handlePatient},
      { text: 'Rooms', icon: <BedIcon sx={{fontSize:'24'}} />, onClick : handleRoom},
      { text: 'Ambulances', icon: <FaAmbulance size={'24'} />, onClick : handleAmbulance},
      { text: 'Reports', icon: <HiDocumentReport size={'24'} />, onClick : handleReport},
      { text: 'Certificate', icon: <PiCertificateFill size={'24'} />, onClick : handleCertif},
      { text: 'Appointment', icon: <MdMeetingRoom size={'24'} />, onClick : handleAppoint},
      { text: 'Prescription', icon: <FaPrescriptionBottleAlt size={'24'} />, onClick : handlePrescription},
      { text: 'Medicine', icon: <AiFillMedicineBox size={'24'} />, onClick : handleMedicine},
    ],
    doctor: [
      { text: 'Home', icon: <AiTwotoneHome size={'24'}/>, onClick: handleHome},
      { text: 'My Jobs', icon: <WorkIcon sx={{fontSize:'24'}}/>, onClick : handleJobs},
      { text: 'Patients', icon: <FaUserInjured size={'24'} />, onClick : handlePatient},
      { text: 'Rooms', icon: <BedIcon sx={{fontSize:'24'}} />, onClick : handleRoom},
      { text: 'Reports', icon: <HiDocumentReport size={'24'} />, onClick : handleReport},
      { text: 'Certificate', icon: <PiCertificateFill size={'24'} />, onClick : handleCertif},
      { text: 'Prescription', icon: <FaPrescriptionBottleAlt size={'24'} />, onClick : handlePrescription},
      { text: 'Appointment', icon: <MdMeetingRoom size={'24'} />, onClick : handleAppoint},
    ],
    nurse : [
      { text: 'Home', icon: <AiTwotoneHome size={'24'}/>, onClick: handleHome},
      { text: 'My Jobs', icon: <WorkIcon sx={{fontSize:'24'}}/>, onClick : handleJobs},
      { text: 'Patients', icon: <FaUserInjured size={'24'} />, onClick : handlePatient},
      { text: 'Rooms', icon: <BedIcon sx={{fontSize:'24'}} />, onClick : handleRoom},
      { text: 'Reports', icon: <HiDocumentReport size={'24'} />, onClick : handleReport},
      { text: 'Certificate', icon: <PiCertificateFill size={'24'} />, onClick : handleCertif},
      { text: 'Prescription', icon: <FaPrescriptionBottleAlt size={'24'} />, onClick : handlePrescription},
      { text: 'Appointment', icon: <MdMeetingRoom size={'24'} />, onClick : handleAppoint},
    ],
    pharmacist : [
      { text: 'Home', icon: <AiTwotoneHome size={'24'}/>, onClick: handleHome},
      { text: 'My Jobs', icon: <WorkIcon sx={{fontSize:'24'}}/>, onClick : handleJobs},
      { text: 'Rooms', icon: <BedIcon sx={{fontSize:'24'}} />, onClick : handleRoom},
      { text: 'Medicine', icon: <AiFillMedicineBox size={'24'} />, onClick : handleMedicine},
      { text: 'Prescription', icon: <FaPrescriptionBottleAlt size={'24'} />, onClick : handlePrescription},
    ]

    // Add more roles and their corresponding sidebar items here
  };

  const sidebarItems = sidebarItemsByRole[userRole] || 
  [{ text: 'Home', icon: <AiTwotoneHome size={'24'}/>, onClick: handleHome},
  { text: 'My Jobs', icon: <WorkIcon sx={{fontSize:'24'}}/>, onClick : handleJobs},
  { text: 'Rooms', icon: <BedIcon sx={{fontSize:'24'}} />, onClick : handleRoom},
  { text: 'Reports', icon: <HiDocumentReport size={'24'} />, onClick : handleReport},];
  // console.log(sidebarItems)

  const sidebarItems2 = [{ text: 'Logout', icon: <IoLogOut size={'24'}/>, onClick : handleLogout},];
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleItemClick = (text) => {
    const selectedItem = sidebarItems.find((item) => item.text === text);    
    if (selectedItem) {
      selectedItem.onClick();
    }
  };

  const handleItem2Click = (text) => {
    const selectedItem = sidebarItems2.find((item) => item.text === text);    
    if (selectedItem) {
      selectedItem.onClick();
    }
  };

  const[notifs, setNotifs] = React.useState<any>([])
  const [dataChanged, setDataChanged] = React.useState(false)

  React.useEffect(() => {
    const fetchNotif = async () => {
      const fetchedNotifs = await NotifUtils.getAllNotifUser(localStorage.getItem('id'.toString()))
      setNotifs(fetchedNotifs)
    }
    fetchNotif()
  },[dataChanged])



  async function handleDelete(id){
    await NotifUtils.deleteNotif(id)
    setDataChanged(!dataChanged)
  }

  const columns = [
    {field : 'id'},
    { field: 'title', headerName :"Title", width : 200},
    { field: 'content', headerName :"Content", width : 200},
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params: GridCellParams) => (
          <div>
          {(params.row.status !== 'completed' && params.row.status !== 'late') && ( // Check if status is not 'completed'
            <IconButton color="primary" onClick={() => handleDelete(params.row.id)}>
                <AiFillDelete/>
            </IconButton>
            )}
          </div>
      ),
    },
  ];

  const [openNotif, setOpenNotif] = React.useState(false)
  const handleNotif = () => {
    setOpenNotif(true)
  }

  const handleCloseNotif = () => {
    setOpenNotif(false)
  }

  return (  
    <React.Fragment>
    <AppBar position="fixed" open={open} >
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        edge="start"
        sx={{
          marginRight: 5,
          ...(open && { display: 'none' }),
        }}
      >
        <MenuIcon />
      </IconButton>
      <div style={{display:'flex', justifyContent:'space-between', width:'100%', padding:'1em'}}>
        <Typography variant="h6" noWrap component="div">
          silVoam Hospital
        </Typography>
        <IconButton onClick={handleNotif}>  
          <IoIosNotifications />
        </IconButton>
      </div>
    </Toolbar>
  </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {sidebarItems.map((item) =>(
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
                onClick={() => handleItemClick(item.text)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 63,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
        {sidebarItems2.map((item) =>(
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
                onClick={() => handleItem2Click(item.text)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 63,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Dialog onClose={handleCloseNotif} aria-labelledby="customized-dialog-title" open={openNotif}>
                  <MuiDialogTitle id="customized-dialog-title">
                    Notifs
                  </MuiDialogTitle>
                  <DialogContent dividers>
                  <DataGrid initialState={{
                      columns: {
                        columnVisibilityModel: {
                          id: false,
                        },
                        },
                      }}
                  rows={notifs} columns={columns}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'30em',
                      width: '100%',
                      }}/>
                    
                  </DialogContent>
                </Dialog> 
      </React.Fragment>
  );
}
