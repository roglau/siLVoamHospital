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
import { Backdrop, ButtonGroup, CircularProgress, DialogActions, DialogContent, Fab, ToggleButton, ToggleButtonGroup} from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { ShiftUtils } from '../utils/shift_manager';
import AddIcon from '@mui/icons-material/Add'
import FormDialog, { FormItemDateTime, FormItemLongText, FormItemRadioButton, FormItemShortText } from '../components/InsertFormDialog';
import { Timestamp } from 'firebase/firestore';
import { PatientUtils } from '../utils/patient_manager';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { JobUtils } from '../utils/job_manager';
import { UserUtils } from '../utils/user_manager';
import { SearchBar } from '../components/SearchBar';

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

}));



export default function Jobs() {
    const { authenticatedUser} = useAuth();
    const [userId, setUserId] = useState("");
    
    const classes = useStyles();
    const [jobs, setJobs] = useState([]);

    const [open, setOpen] = React.useState(false);
  
    const [ newId, setNewId ] = React.useState<string>("");

    const [ searched, setSearched ] = React.useState<string>("");

    const handleSearch = (searched: string) => {
      setSearched(searched);
    }

    const cancelSearch = () => {
      setSearched("");
      handleSearch("");
    };

    const [dataChanged, setDataChanged] = React.useState(false)
    
    const [userJobs, setUserJobs] = React.useState([]);

    function findJobsByEmployeeId(employeeId) {
        const assignedJobs = [];
        
        jobs.forEach((job) => {
          if (job.assignedEmployees.includes(employeeId)) {
            assignedJobs.push(job);
          }
        });
        // console.log(assignedJobs, employeeId);
        return assignedJobs;
    }

    useEffect(() => {
        const fetchJobs = async () => {
            const fetchedJobs = await JobUtils.getAllJob();
            setJobs(fetchedJobs);
        }; 
        fetchJobs();
    }, [dataChanged]);



    useEffect(() => {
        const fetchUserJobs = async () => {
        const userAssignedJobs = await findJobsByEmployeeId(localStorage.getItem('id'));
        setUserJobs(userAssignedJobs);
        };
        if(jobs.length > 0) 
        fetchUserJobs()
    },[jobs]);

    const [searching, setSearching] = useState(false);

    useEffect(() => {
        
        if(searched !== ""){
          setSearching(true);
          setJobs(jobs.filter((x) =>
          x.name.toLowerCase().includes(searched.toLowerCase())
        ))
        }else{
            if(searching){
                console.log("search cok")
                setDataChanged(!dataChanged);
                setSearching(false)
            }
        }
    },[searched]);

    const handleEdit = (row) => {
        setNewId(row.id);
        handleEditForm();
      };

      const handleEditForm  = () => {
        setOpen(true);
      }

      const handleCloseEditForm = () => {
        setOpen(false);
      }

      const handleSubmitEditForm = () => {
        JobUtils.completeJob(newId)
        setNewId("");
        setDataChanged(!dataChanged);
        setOpen(false);
      }

      const [employees, setEmployees] = useState<any>(0);
      const [openDet, setOpenDet] = useState(false);

      const handleDetail = async (employees) => {
        const e = [];
        
        for (const emp of employees) {
          const u = await UserUtils.getUser(emp);
          const user = {id : u.uid, email : u.email, password : u.password, name : u.name, role: u.role, shiftId : u.shiftId}
          e.push(user);
        }
        
        setEmployees(e);
        setOpenDet(true)
      }

      const handleCloseDet = () => {
            setOpenDet(false);
      }
  
      const columns = [
      
        { field: 'id'},
        { field: 'name', headerName: 'Name', width: 125 },
        { field: 'category', headerName: 'Category', width: 150 },
        { field: 'status', headerName: 'Status', width: 100 },
        { field: 'patientN', headerName: 'Patient', width: 150 },
        { field: 'formattedStartDate', headerName: 'Start Date', width: 150 },
        { field: 'formattedEndDate', headerName: 'End Date', width: 150 },
        {
            field: 'staff',
            headerName: 'Staffs',
            width: 75,
            renderCell: (params: GridCellParams) => (
                <IconButton color="primary" onClick={() => handleDetail(params.row.assignedEmployees)}>
                    <Typography component="h6" variant="h6" color="primary" fontSize={16}>
                    Staffs
                    </Typography>
                </IconButton>
            ),
        },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 150,
          renderCell: (params: GridCellParams) => (
              <div>
              {(params.row.status !== 'completed' && params.row.status !== 'late') && ( // Check if status is not 'completed'
                <IconButton color="primary" onClick={() => handleEdit(params.row)}>
                    <AiFillEdit />
                </IconButton>
                )}
              </div>
          ),
        },
      ];

      const columnsE = [
        {field : 'id', headerName : "Id", width:250},
        { field: 'name', headerName :"Name", width : 200},
      ];
  
    
  
    return (
        <React.Fragment>
            <Head>
                <title>Jobs Page</title>
            </Head>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar/>                
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                <Typography component="h1" variant="h5" color="primary">
                    Jobs
                </Typography>
                <br/>
                <SearchBar
                  value={searched}
                  onChange={(searchVal) => handleSearch(searchVal)}
                  onCancelSearch={() => cancelSearch()}
                  placeholder="Search job by name"
                />
                <br/>
                
                <DataGrid initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                    //   bill : userRole === "admin" ? true : false,
                      // actions: userRole === "admin" ? true : false
                    },
                    },
                  }}
                  rows={userJobs} columns={columns}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'auto',
                      width: '100%',
                      }}/>
                
                </Box>
            </Box>

            <Dialog onClose={handleCloseDet} aria-labelledby="customized-dialog-title" open={openDet}>
                  <MuiDialogTitle id="customized-dialog-title">
                    Staffs
                  </MuiDialogTitle>
                  <DialogContent dividers>
                  <DataGrid 
                  rows={employees} columns={columnsE}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'auto',
                      width: '100%',
                      }}/>
                    
                  </DialogContent>
                </Dialog> 

            <Dialog onClose={handleCloseEditForm} aria-labelledby="customized-dialog-title" open={open}>
                  <MuiDialogTitle id="customized-dialog-title">
                    Complete Confirmation
                  </MuiDialogTitle>
                  <DialogContent dividers>
                    <Typography component='h1' variant='h6'>
                      Complete Job
                      <br/>
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button autoFocus onClick={e => handleSubmitEditForm()} color="primary">
                      Save changes
                    </Button>
                  </DialogActions>
                </Dialog> 

            
        </React.Fragment>
    );
}