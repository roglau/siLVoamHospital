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
import { Backdrop, ButtonGroup, CircularProgress, Fab, ToggleButton, ToggleButtonGroup} from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { ShiftUtils } from '../utils/shift_manager';
import AddIcon from '@mui/icons-material/Add'
import FormDialog, { FormItemCombo, FormItemDateTime, FormItemLongText, FormItemRadioButton, FormItemSelect, FormItemShortText, MFOption, MFOptionCombo } from '../components/InsertFormDialog';
import { Timestamp } from 'firebase/firestore';
import { Patient, PatientUtils } from '../utils/patient_manager';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { SearchBar } from '../components/SearchBar';
import { ReportUtils } from '../utils/report_manager';
import { Room, RoomUtils } from '../utils/room_manager';

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

const roles: MFOption[] = [
  { label: "Admin", value: 'Admin'},
  { label: 'Doctor', value: 'Doctor' },
  { label: 'Nurse', value: 'Nurse' },
  { label: 'Pharmacist', value: 'Pharmacist' },
  { label: 'Ambulance Driver', value: 'AmbulanceDriver' },
  { label: 'Kitchen Staff', value: 'KitchenStaff' },
  { label: 'Cleaning Service', value: 'CleaningService' }
];

const rolesFormatted: MFOption[] = roles.map((role) => ({
  label: role.label,
  value: role.value.trim().toLowerCase()
  
}));

export default function Reports() {    
    const classes = useStyles();
    const [requests, setRequests] = useState([]);

    const [openPopup, setOpenPopup] = useState(false);

    const [request, setRequest] = useState<any>([]);

    const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
    const [ openEditForm, setOpenEditForm ] = React.useState(false);
  
    const [ newLRError, setNewLRError ] = React.useState<boolean>(false);
  
    const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');
  
    const [ newId, setNewId ] = React.useState<string>("");
    const [ newRoom, setNewRoom ] = React.useState<any>("");
    const [ newDate, setNewDate ] = React.useState<Date>(new Date(Date.now()));
    const [ newPatient, setNewPatient ] = React.useState<any>("");
    const [ newProblem, setNewProblem ] = React.useState<string>("");
    const [ newStaff, setNewStaff ] = React.useState<string>("");
    const [ newDivision, setNewDivision] = useState<string>("");
    const [newStatus, setNewStatus] = React.useState<string>("");


    const [patients, setPatients] = useState<any>(0);

    useEffect(() => {
      const fetchPatients = async () => {
          const fetchedPatients = await PatientUtils.getAllPatient();
          setPatients(fetchedPatients);
      };
  
      fetchPatients();
  }, []);

    const [rooms, setRooms] = useState<any>(0)

  useEffect(() => {
    const fetchRooms = async () => {
        const fetchedRooms = await RoomUtils.getAllRoom();
        setRooms(fetchedRooms);
    };
  
    fetchRooms();
    } ,[]);


    function convertPatientMFOption(index: number, patient: Patient) : MFOptionCombo{
      return {id : index, label: patient.name, content: patient} as MFOptionCombo;
    }

    function convertRoomMFOption(index: number, room: Room) : MFOptionCombo{
      return {id : index, label: room.id, content: room} as MFOptionCombo;
    }

    const handlePatientChange = (event: any, newValue: MFOptionCombo) => {
      // console.log(newValue.content.name)
      setNewPatient(newValue.content.id);
    };

    const handleRoleChange = (e: React.ChangeEvent<{ value: string }>) => {
      if(e.target.value)
        setNewDivision(e.target.value);
    };

    const handleRoomChange = async (event: any, newValue: MFOptionCombo) => {
      // console.log(newValue.content.beds)
       setNewRoom(newValue.content.id);
    };

    const handleProblemChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewProblem(event.target.value);
    }
  
    const handleDivisionChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewDivision(event.target.value);
    }


    const [dataChanged, setDataChanged] = React.useState(false)

    useEffect(() => {
        const fetchRequests = async () => {
            const fetchedRequests = await ReportUtils.getAllReportUser(localStorage.getItem('role'));
            setRequests(fetchedRequests);
        };
    
        fetchRequests();
    }, [dataChanged]);

    const handleEdit = (row) => {
        setNewStatus(row.status);

        setNewLRError(false);
        setNewLRErrMsg("");

        handleEditForm();
      };

      const handleEditForm  = () => {
        setOpenEditForm(true);
      }

      const handleCloseEditForm = () => {
        setOpenEditForm(false);
      }

      const handleSubmitEditForm = () => {
        if(newStatus.length < 1){
          setNewLRErrMsg("Name must be filled");
          setNewLRError(true);
        }
        else{
            const patient = {
              // id : newId,
              // name : newName,
              // email : newEmail,
              // gender : newGender,
              // phone : newPhone,
              // address: newAddress,
              // dob : Timestamp.fromDate(newStartDate)
            }
            // PatientUtils.updatePatient(patient);
            setDataChanged(!dataChanged);
            setOpenEditForm(false);
        }
      }
      
      const resetForm = () => {
        setNewId("");
        setNewRoom("");
        setNewDate(new Date())
        setNewPatient("");
        setNewProblem("");
        setNewDivision("");
      }
    
      const handleCreateNew = () => {
        resetForm();
        setNewLRError(false);
        setOpenCreateForm(true);
      }
    
      const handleCloseForm = () => {
        setOpenCreateForm(false);
      }
    
      const handleSubmitForm = async () => {
        if(newRoom.length < 1){
            setNewLRErrMsg("Room must be selected");
            setNewLRError(true);
        }else if(newPatient.length < 1){
          setNewLRErrMsg("Patient must be selected");
          setNewLRError(true);
        }else if(newProblem.length < 1){
          setNewLRErrMsg("Problem must be filled");
          setNewLRError(true);
        }else if(newDivision.length < 1){
          setNewLRErrMsg("Division must be selected");
          setNewLRError(true);
        }
          else{
            const report = {
              room : newRoom,
              problem : newProblem,
              patient : newPatient,
              division : newDivision,
              status : "none",
              staffId : localStorage.getItem("id"),
              date : Timestamp.fromDate(new Date())
            }
            await ReportUtils.insertReport(report);
            setDataChanged(!dataChanged);
            setOpenCreateForm(false);
        }
      }
  
      const columns = [
      
        { field: 'id'},
        { field: 'room', headerName: 'Room', width: 125 },
        { field: 'patientName', headerName: 'Patient', width: 150 },
        { field: 'date', headerName: 'Date', width: 100 },
        { field: 'problem', headerName: 'Problem', width: 150 },
        { field: 'staffName', headerName: 'Staff', width: 150 },
        { field: 'status', headerName: 'Status', width: 150 },
        // {
        //   field: 'actions',
        //   headerName: 'Actions',
        //   width: 150,
        //   renderCell: (params: GridCellParams) => (
        //       <div>
        //       <IconButton color="primary" onClick={() => handleEdit(params.row)}>
        //         <AiFillEdit/>
        //       </IconButton>
        //       </div>
        //   ),
        // },
      ];
      
    
    
  
    return (
        <React.Fragment>
            <Head>
                <title>Reports Page</title>
            </Head>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar/>                
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                <div style={{display : "flex", justifyContent:"space-between", alignItems:'center'}}>
                  <Typography component="h1" variant="h5" color="primary">
                  Reports
                  </Typography>
                  <Fab
                    color="primary"
                    aria-label="add"
                    sx={{
                        position: 'fixed',
                        right: '0',
                        bottom: '0',
                        margin: '1em' // Adjust the margin value as per your preference
                    }}
                    onClick={handleCreateNew}
                    >
                    <AddIcon />
                </Fab>
                </div>

                <br/>
                
                <DataGrid initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                    },
                    },
                  }}
                  rows={requests} columns={columns}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'auto',
                      width: '100%',
                      }}/>
                    
                </Box>
            </Box>

            <FormDialog
                title={"Add Patient"} 
                success_msg={"Successfully added report"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                      {
                        id: "1",
                        component: <FormItemCombo<Patient> value={newPatient} fieldname='Patient' placeholder='Patient' options={Array.isArray(patients) ? patients.map((e, idx) => convertPatientMFOption(idx, e)) : []} handleChange={handlePatientChange}/>
                      },
                      {
                        id: "2",
                        component: <FormItemCombo<Room> value={newRoom} fieldname='Room' placeholder='Room' options={Array.isArray(rooms) ? rooms.map((e, idx) => convertRoomMFOption(idx, e)) : []} handleChange={handleRoomChange}/>
                      },
                      {
                          id: "3",
                          component: <FormItemLongText value={newProblem} fieldname='Problem' placeholder='Problem' minLength={0} maxLength={500} handleChange={handleProblemChange}/>
                      },
                      {
                        id: "4",
                        component: <FormItemSelect<string> value={newDivision} fieldname='Division' placeholder='Division' options={rolesFormatted} handleChange={handleRoleChange}/>
                      },
                    ]
                }
                handleSubmit={handleSubmitForm}
                handleClose={handleCloseForm}
                open={openCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />

            
        </React.Fragment>
    );
}