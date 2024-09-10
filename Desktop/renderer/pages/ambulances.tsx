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
import { User, useAuth } from '../utils/AuthContext';
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
import { Backdrop, ButtonGroup, CircularProgress, DialogActions, DialogTitle, Fab, ToggleButton, ToggleButtonGroup} from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { ShiftUtils } from '../utils/shift_manager';
import AddIcon from '@mui/icons-material/Add'
import FormDialog, { FormItemCombo, FormItemDateTime, FormItemLongText, FormItemRadioButton, FormItemSelect, FormItemShortText, MFOption, MFOptionCombo } from '../components/InsertFormDialog';
import { Timestamp } from 'firebase/firestore';
import { Patient, PatientUtils } from '../utils/patient_manager';
import { AiFillDelete, AiFillEdit, AiFillCar } from 'react-icons/ai';
import { SearchBar } from '../components/SearchBar';
import { ReportUtils } from '../utils/report_manager';
import { Bed, Room, RoomUtils } from '../utils/room_manager';
import { AmbulancesUtils } from '../utils/ambulance_manager';
import { MdCarCrash } from 'react-icons/md';
import { DialogContent } from '@material-ui/core';
import { UserUtils } from '../utils/user_manager';

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

const types: MFOption[] = [
  {label : '1' , value : '1'},
  {label : '2' , value : '2'},
  {label : '3' , value : '3'},
]

export default function Ambulances() {    
    const classes = useStyles();
    const [ambulances, setAmbulances] = useState([]);

    const [ambulance, setAmbulance] = useState<any>([]);

    const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
    const [ openEditForm, setOpenEditForm ] = React.useState(false);
  
    const [ newLRError, setNewLRError ] = React.useState<boolean>(false);
  
    const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');
  
    const [ newId, setNewId ] = React.useState<string>("");
    const [ newRoom, setNewRoom ] = React.useState<any>("");    
    const [ newPatient, setNewPatient ] = React.useState<any>("");
    const [ newPoliceN, setNewPoliceN ] = React.useState<string>("");
    const [ newStaff, setNewStaff ] = React.useState<string>("");
    const [ newType, setNewType] = useState<string>("");
    const [newStatus, setNewStatus] = React.useState<string>("");
    const [newYear, setNewYear] = React.useState<string>("");
    const [newDestination, setNewDestination] = React.useState<string>("");
    const [newDriver, setNewDriver] = React.useState<any>("")
    const[idSelected, setIdSelected] = React.useState<any>("")


    const [patients, setPatients] = useState<any>(0);
    const [drivers, setDrivers] = useState<any>(0);

    useEffect(() => {
      const fetchPatients = async () => {
          const fetchedPatients = await PatientUtils.getAllPatient();
          setPatients(fetchedPatients);
      };
  
      fetchPatients();
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
        const fetchedDrivers = await UserUtils.getAllUserRole("ambulancedriver");
        setDrivers(fetchedDrivers);
    };

    fetchDrivers();
}, []);

  const [rooms, setRooms] = useState<any>(0);
  const [beds, setBeds] = useState<any>([]);

  const [ room, setRoom ] = React.useState<any>(0);
  const [ bed, setBed ] = React.useState<any>(0);

  useEffect(() => {
    const fetchRooms = async () => {
        const fetchedRooms = (await RoomUtils.getAllRoom()).filter((room) => room.type === "Emergency");
        setRooms(fetchedRooms);
    };
  
    fetchRooms();
    } ,[]);


    function convertPatientMFOption(index: number, patient: Patient) : MFOptionCombo{
      return {id : index, label: patient.name, content: patient} as MFOptionCombo;
    }

    function convertDriverMFOption(index: number, driver: User) : MFOptionCombo{
      return {id : index, label: driver.name, content: driver} as MFOptionCombo;
    }

    function convertRoomMFOption(index: number, room: Room) : MFOptionCombo{
      return {id : index, label: room.id, content: room} as MFOptionCombo;
    }
  
    function convertBedMFOption(index: number, bed: Bed) : MFOptionCombo{
      // console.log(bed)
      return {id : index, label: bed.id, content: bed.id} as MFOptionCombo;
    }

    const handlePatientChange = (event: any, newValue: MFOptionCombo) => {
      // console.log(newValue.content.name)
      if(newValue.content)
      setNewPatient(newValue.content.id);
    };

    const handleDriverChange = (event: any, newValue: MFOptionCombo) => {
      if(newValue.content)
      setNewDriver(newValue.content.id);
    };


    const handleRoleChange = (e: React.ChangeEvent<{ value: string }>) => {
      if(e.target.value)
        setNewType(e.target.value);
    };

    const handleDestChange = (e: React.ChangeEvent<{ value: string }>) => {
        setNewDestination(e.target.value);
    };

    const handleRoomChange = async (event: any, newValue: MFOptionCombo) => {
      // console.log(newValue.content.beds)
      await setRoom(newValue.content.id);
      const beds = await newValue.content.beds.filter((b) => b.status === "Available")
      await setBeds(beds)
    };
  
    const handleBedChange = (event: any, newValue: MFOptionCombo) => {
      // console.log(newValue.content)
      setBed(newValue.content);
    };

    const handleYearChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewYear(event.target.value);
    }

    const handlePoliceNChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewPoliceN(event.target.value);
    }


    const [dataChanged, setDataChanged] = React.useState(false)

    useEffect(() => {
        const fetchRequests = async () => {
            const fetchedRequests = await AmbulancesUtils.getAllAmbulances();
            setAmbulances(fetchedRequests);
        };
    
        fetchRequests();
    }, [dataChanged]);

    const handleEdit = (row) => {
        setRoom("")
        setBed("")
        setNewPatient("")
        setNewDriver("")
        setNewDestination("")

        setIdSelected(row.id)

        setNewLRError(false);
        setNewLRErrMsg("");

        handleEditForm();
      };

    const handleBan = async (row) => {
      
      setNewLRError(false);
      setNewLRErrMsg("");

      const ambulance = {
        id : row.id
      }
      await AmbulancesUtils.banAmbulance(ambulance);
      setDataChanged(!dataChanged);

    };

      const handleEditForm  = () => {
        setOpenEditForm(true);
      }

      const handleCloseEditForm = () => {
        setOpenEditForm(false);
      }

      const handleSubmitEditForm = async () => {
        if(newPatient.length < 1){
          setNewLRErrMsg("Patient must be filled");
          setNewLRError(true);
        }else if(newDriver.length < 1){
          setNewLRErrMsg("Driver must be filled");
          setNewLRError(true);
        }else if(newDestination.length < 1){
          setNewLRErrMsg("Destination must be filled");
          setNewLRError(true);
        }else if(room.length < 1){
          setNewLRErrMsg("Room must be filled");
          setNewLRError(true);
        }else if(bed.length < 1){
          setNewLRErrMsg("Bed must be filled");
          setNewLRError(true);
        }
        else{
            const ambulance = {
              id : idSelected,
              patient : newPatient,
              driver : newDriver,
              destination : newDestination,
              room : room,
              bed : bed
            }
            // console.log(ambulance)
            await AmbulancesUtils.updateAmbulance(ambulance, "Used");
            setDataChanged(!dataChanged);
            setOpenEditForm(false);
        }
      }
      
      const resetForm = () => {
        setNewId("");
        setNewRoom("");        
        setNewPatient("");
        setNewPoliceN("");
        setNewType("");
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
        if(newType.length < 1){
            setNewLRErrMsg("Type must be selected");
            setNewLRError(true);
        }else if(newYear.length < 1){
          setNewLRErrMsg("Year must be filled");
          setNewLRError(true);
        }else if(newPoliceN.length < 1){
          setNewLRErrMsg("PoliceN must be filled");
          setNewLRError(true);
        }
          else{
            const ambulance = {
              type : newType,
              policeN : newPoliceN,
              year : newYear,
              status : "Available",
              destination : null,
              patient : null,
              driver : null,
              room : null,
              bed : null,

            }
            await AmbulancesUtils.insertAmbulance(ambulance);
            setDataChanged(!dataChanged);
            setOpenCreateForm(false);
        }
      }
  
      const columns = [
      
        { field: 'id'},
        { field: 'type', headerName: 'Type', width: 150 },
        { field: 'policeN', headerName: 'Police Number', width: 150 },
        { field: 'year', headerName: 'Year', width: 150 },
        { field: 'status', headerName: 'Status', width: 150 },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 150,
          renderCell: (params: GridCellParams) => (
              <div>
              {params.row.status == "Available" && (<IconButton color="primary" onClick={() => handleEdit(params.row)}>
                <AiFillCar />
              </IconButton>)}
              {params.row.status == "Available" && (<IconButton color="primary" onClick={() => handleBan(params.row)}>
                <MdCarCrash />
              </IconButton>)}
              </div>
          ),
        },
      ];
      
    
    
  
    return (
        <React.Fragment>
            <Head>
                <title>Ambulances Page</title>
            </Head>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar/>                
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                <div style={{display : "flex", justifyContent:"space-between", alignItems:'center'}}>
                  <Typography component="h1" variant="h5" color="primary">
                  Ambulances
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
                  rows={ambulances} columns={columns}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'auto',
                      width: '100%',
                      }}/>
                    
                </Box>
            </Box>

            <FormDialog
                title={"Use Ambulance"} 
                success_msg={"Successfully added ambulance"} 
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
                        component: <FormItemCombo<User> value={newDriver} fieldname='Driver' placeholder='Driver' options={Array.isArray(drivers) ? drivers.map((e, idx) => convertDriverMFOption(idx, e)) : []} handleChange={handleDriverChange}/>
                      },
                      {
                        id: "3",
                        component: <FormItemLongText value={newDestination} fieldname='Destination' placeholder='Destination' minLength={0} maxLength={500} handleChange={handleDestChange}/>
                      },
                      {
                        id: "4",
                        component: <FormItemCombo<Room> value={room} fieldname='Room' placeholder='Room' options={Array.isArray(rooms) ? rooms.map((e, idx) => convertRoomMFOption(idx, e)) : []} handleChange={handleRoomChange}/>
                      },
                      {
                        id: "5",
                        component: room && (
                          <FormItemCombo<String> value={bed} fieldname='Bed' placeholder='Bed' options={Array.isArray(beds) ? beds.map((e, idx) => convertBedMFOption(idx, e)) : []} handleChange={handleBedChange}/>
                        ),
                      }
                    ]
                }
                handleSubmit={handleSubmitEditForm}
                handleClose={handleCloseEditForm}
                open={openEditForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />

            <FormDialog
                title={"Add Patient"} 
                success_msg={"Successfully added ambulance"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                      {
                        id: "1",
                          component: <FormItemShortText value={newYear} fieldname='Year' placeholder='Year' minLength={0} maxLength={10} handleChange={handleYearChange}/>
                      },
                      {
                          id: "2",
                          component: <FormItemShortText value={newPoliceN} fieldname='Police Number' placeholder='PoliceN' minLength={0} maxLength={500} handleChange={handlePoliceNChange}/>
                      },
                      {
                        id: "3",
                        component: <FormItemSelect<string> value={newType} fieldname='Type' placeholder='Type' options={types} handleChange={handleRoleChange}/>
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