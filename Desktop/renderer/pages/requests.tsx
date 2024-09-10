import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import {app, auth, database} from '../firebase/firebase';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../utils/AuthContext';
import { RequestUtils } from '../utils/request_manager';
import Head from 'next/head';
import { DataGrid, GridCellParams } from '@mui/x-data-grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import { DeleteOutline } from '@mui/icons-material';
import { FcApprove } from 'react-icons/fc'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { UserUtils } from '../utils/user_manager';
import Popup from '../components/Popup';
import { Backdrop, ButtonGroup, CircularProgress, ToggleButton, ToggleButtonGroup} from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { ShiftUtils } from '../utils/shift_manager';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function Requests() {
    const classes = useStyles();
    const [requests, setRequests] = useState([]);

    const [roleUsers, setRoleUsers] = useState([]);

    const [shifts, setShifts] = useState([]);

    const [openPopup, setOpenPopup] = useState(false);

    const [curId, setCurId] = useState("");
    const [curName, setCurName] = useState("");
    const [curEmail, setCurEmail] = useState("");
    const [curRole, setCurRole] = useState("");
    const [curPassword, setCurPassword] = useState("");

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };

    const [selShift, setSelShift] = React.useState("MORNING");

    const [dataChanged, setDataChanged] = React.useState(false)
    const [shiftChanged, setShiftChanged] = React.useState(false)

    const [loading, setLoading] = React.useState(false)

    const handleChangeShift = (e, newShift) => {
      setSelShift(newShift)
    }

    const handleSubmitShift = (id, email, password, name, role) => {
      handleClose()
      setLoading(true)
      RequestUtils.deleteReq(id);

      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const uid = user.uid;          
        UserUtils.insertUser(uid, name, email, password, role, selShift).then(e => {
          setDataChanged(true)
          setLoading(false)
        })
      })
      .catch((error) => {

      });

    }
    
    useEffect(() => {
      const fetchSameRole = async () => {
        const roleUsers = await UserUtils.getAllUserRole(curRole);
        setRoleUsers(roleUsers);
      };
  
      fetchSameRole();
    }, [curRole]);

    //Reload data on change
    useEffect(() => {
      if(dataChanged){
        const fetchRequests = async () => {
          const fetchedRequests = await RequestUtils.getAllRequest();
          setRequests(fetchedRequests);
          
        };
    
        fetchRequests();
        setDataChanged(false);
      }
    }, [dataChanged]);



    //First time load
    useEffect(() => {
        const fetchRequests = async () => {
          const fetchedRequests = await RequestUtils.getAllRequest();
          setRequests(fetchedRequests);
        };

        const fetchShifts = async () => {
          const fetchedShifts = await ShiftUtils.getAllShift();
          setShifts(fetchedShifts);
        };
    
        fetchRequests();
        fetchShifts();
    }, []);

    const handleApprove = (id) => {
        const row = requests.find((r) => r.id === id);
        // if (row) {
        // // Access the data properties of the row
        const { name, email, password, role } = row;

        setCurName(name)
        setCurEmail(email)
        setCurPassword(password)
        setCurRole(role)
        setCurId(id)

        handleClickOpen()
      };
  
    const columns = [
      { field: 'id', headerName: 'ID', width: 200 },
      { field: 'name', headerName: 'Name', width: 125 },
      { field: 'email', headerName: 'Email', width: 200 },
      { field: 'password', headerName: 'Password', width: 150 },
      { field: 'role', headerName: 'Role', width: 100 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 75,
        renderCell: (params: GridCellParams) => (
          <IconButton color="primary" onClick={() => handleApprove(params.row.id)}>
            <FcApprove />
          </IconButton>
        ),
      },
    ];

    function toPascalCase(str) {
      const words = str.split(' ');
      const pascalCaseWords = words.map((word) => {
        const firstLetter = word.charAt(0).toUpperCase();
        const restOfWord = word.slice(1).toLowerCase();
        return firstLetter + restOfWord;
      });
      return pascalCaseWords.join('');
    }    

    const columnsShift = [
      { field: 'name', headerName: 'Name', width: 125 },
      {
        field: 'shift',
        headerName: 'Shift',
        width: 200,
        renderCell: (params: GridCellParams) => {
          const pascalCasedShiftId = toPascalCase(params.row.shiftId);
          return pascalCasedShiftId;
        },
      },
    ];

    const getAutoShift = () => {
      const shiftCount = {"MORNING":0, "AFTERNOON":0, "NIGHT":0}; // Object to keep track of shiftId occurrences
    
      // Count the occurrences of each shiftId
      roleUsers.forEach((user) => {
        const { shiftId } = user;
        if (shiftCount[shiftId]) {
          shiftCount[shiftId]++;
        } else {
          shiftCount[shiftId] = 1;
        }
      });
    
      // Find the shiftId with the least occurrence
      let leastOccurrence = Infinity;
      let leastOccurringShiftId = null;
      Object.entries(shiftCount).forEach(([shiftId, count]) => {
        if (count as number < leastOccurrence) {
          leastOccurrence = count as number;
          leastOccurringShiftId = shiftId;
        }
      });
    
      return leastOccurringShiftId;
    };
    
  
    return (
        <React.Fragment>
            <Head>
                <title>Request Page</title>
            </Head>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar/>
                {/* <Box sx={{ display: 'flex', flexDirection:'column', mt:10, ml:2}}> */}
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                <Typography component="h1" variant="h5" color="primary">
                Staff Requests
                </Typography>
                
                <DataGrid rows={requests} columns={columns}
                disableRowSelectionOnClick
                sx={{ mt:2,
                    height:'auto',
                    width: '100%',
                    }}/>

                <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
                  <MuiDialogTitle id="customized-dialog-title">
                    Assign Shift
                  </MuiDialogTitle>
                  <DialogContent dividers>
                    <Typography variant='h6'>
                      Employees with the same role
                      <br/>
                    </Typography>
                    
                    <DataGrid rows={roleUsers} columns={columnsShift}
                      disableRowSelectionOnClick
                      sx={{ mt:2,
                          height:'auto',
                          width: '100%',
                          }}/>
                          <br/>
                    <center>
                    <ButtonGroup
                      color="primary"
                      variant="contained"
                      aria-label="outlined primary button group"
                    >
                      <Button disabled={selShift === "MORNING"} value={'MORNING'} onClick={e => handleChangeShift(e, "MORNING")}>
                        {selShift === 'MORNING' ? 'Morning (5:00 - 13:00)' : 'Morning'}
                      </Button>
                      <Button disabled={selShift === "AFTERNOON"} value={'AFTERNOON'} onClick={e => handleChangeShift(e, "AFTERNOON")}>
                        {selShift === 'AFTERNOON' ? 'Afternoon (13:00 - 21:00)' : 'Afternoon'}
                      </Button>
                      <Button disabled={selShift === "NIGHT"} value={'NIGHT'} onClick={e => handleChangeShift(e, "NIGHT")}>
                        {selShift === 'NIGHT' ? 'Night (21:00 - 5:00)' : 'Night'}
                      </Button>
                      <Button disabled={selShift === "AUTO"} value={'AUTO'} onClick={e => handleChangeShift(e, getAutoShift())}>
                        {selShift === 'AUTO' ? getAutoShift() : 'Auto Assign'}
                      </Button>
                    </ButtonGroup>
                    </center>
                  </DialogContent>
                  <DialogActions>
                    <Button autoFocus onClick={e => handleSubmitShift(curId, curEmail, curPassword, curName, curRole)} color="primary">
                      Save changes
                    </Button>
                  </DialogActions>
                </Dialog> 
                
                </Box>
            <Backdrop className={classes.backdrop} open={loading}>
              <CircularProgress color="inherit" />
            </Backdrop>
            
            </Box>

            
        </React.Fragment>
    );
}