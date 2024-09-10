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
import FormDialog, { FormItemCombo, FormItemDateTime, FormItemLongText, FormItemMultiCombo, FormItemRadioButton, FormItemSelect, FormItemShortText, MFOption, MFOptionCombo } from '../components/InsertFormDialog';
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
import { AppointmentUtils } from '../utils/appointment_manager';
import { MedicineUtils } from '../utils/med_manager';

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
  { label: 'Ambulance Doctor', value: 'AmbulanceDoctor' },
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

const categories : MFOption[] = [
    {label : 'Normal', value : 'Normal'},
    {label : 'Urgent', value : 'Urgent'},
]

const status : MFOption[] = [
    {label : 'Queued', value : 'Queued'},
    {label : 'In Progress', value : 'In Progress'},
    {label : 'Skipped', value : 'Skipped'},
]

export default function Appointments() {    
    const classes = useStyles();
    const [appointments, setAppointments] = useState([]);

    const [appointment, setAppointment] = useState<any>([]);

    const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
    const [ openSCreateForm, setOpenSCreateForm ] = React.useState(false);
    const [ openRCreateForm, setOpenRCreateForm ] = React.useState(false);
    const [ openPCreateForm, setOpenPCreateForm ] = React.useState(false);
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
    const [newDoctor, setNewDoctor] = React.useState<any>("")
    const[idSelected, setIdSelected] = React.useState<any>("")
    const [ newStartDate, setNewStartDate ] = React.useState<Date>(new Date(Date.now()));
    const [ newCategory, setNewCategory ] = React.useState<any>("")
    const [ newSymptoms, setNewSymptoms ] = React.useState<any>("")
    const [ newDiagnosis, setNewDiagnosis ] = React.useState<any>("")
    const [newNote, setNewNote] = React.useState<any>("")

    const [medicines, setMedicines] = useState([]);

    useEffect(() => {
      const fetchRequests = async () => {
          const fetchedRequests = await MedicineUtils.getAllMedicine();
          setMedicines(fetchedRequests);
      };
  
      fetchRequests();
  }, []);


    const [patients, setPatients] = useState<any>(0);
    const [Doctors, setDoctors] = useState<any>(0);

    useEffect(() => {
      const fetchPatients = async () => {
          const fetchedPatients = await PatientUtils.getAllPatient();
          setPatients(fetchedPatients);
      };
  
      fetchPatients();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
        const fetchedDoctors = await UserUtils.getAllUserRole("doctor");
        setDoctors(fetchedDoctors);
    };

    fetchDoctors();
}, []);

  const [rooms, setRooms] = useState<any>(0);
  const [beds, setBeds] = useState<any>([]);

  const [ room, setRoom ] = React.useState<any>(0);
  const [ bed, setBed ] = React.useState<any>(0);

  useEffect(() => {
    const fetchRooms = async () => {
        const fetchedRooms = await RoomUtils.getAllRoom()
        setRooms(fetchedRooms);
    };
  
    fetchRooms();
    } ,[]);


    function convertPatientMFOption(index: number, patient: Patient) : MFOptionCombo{
      return {id : index, label: patient.name, content: patient} as MFOptionCombo;
    }

    function convertMedicineMFOption(index: number, medicine: any) : MFOptionCombo{
      return {id : index, label: medicine.name, content: medicine} as MFOptionCombo;
    }

    function convertDoctorMFOption(index: number, Doctor: User) : MFOptionCombo{
      return {id : index, label: Doctor.name, content: Doctor} as MFOptionCombo;
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

    const handleDoctorChange = (event: any, newValue: MFOptionCombo) => {
      if(newValue.content)
      setNewDoctor(newValue.content.id);
    };


    const handleRoleChange = (e: React.ChangeEvent<{ value: string }>) => {
      if(e.target.value)
        setNewCategory(e.target.value);
    };

    const handleStatusChange = (e: React.ChangeEvent<{ value: string }>) => {
        if(e.target.value)
          setNewStatus(e.target.value);
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

    const handleDiagChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewDiagnosis(event.target.value);
      }

    const handleNoteChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewNote(event.target.value);
    }

    const handleSymChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewSymptoms(event.target.value);
      }

    const [dataChanged, setDataChanged] = React.useState(false)

    useEffect(() => {
        const fetchRequests = async () => {
            const fetchedRequests = await AppointmentUtils.getAllAppointment();
            setAppointments(fetchedRequests);
        };
    
        fetchRequests();
    }, [dataChanged]);

    const [newJob, setNewJob] = useState<any>()

    const handleEdit = (row) => {
        // console.log(row);
        setRoom(row.room)
        setBed(row.bed)
        setNewPatient(row.patient)
        setNewDoctor(row.doctor)
        setNewCategory(row.category)
        setNewStartDate(new Date(row.dateFormatted))
        setIdSelected(row.id)
        setNewStatus(row.status)
        setNewJob(row.job)

        setNewLRError(false);
        setNewLRErrMsg("");

        if(row.status === "In Progress"){
          status.push({label : 'Completed', value : 'Completed'})
        }

        if(row.status === "Completed"){
          status.splice(0)
          status.push({label : 'Completed', value : 'Completed'})
        }

        handleEditForm();
      };

    const handleBan = async (row) => {
      
      setNewLRError(false);
      setNewLRErrMsg("");

      const appointment = {
        id : row.id
      }
      await AppointmentUtils.deleteAppointment(appointment);
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
            setNewLRErrMsg("Patient must be selected");
            setNewLRError(true);
        }else if(newDoctor.length < 1){
          setNewLRErrMsg("Doctor must be filled");
          setNewLRError(true);
        }else if(room.length < 1){
          setNewLRErrMsg("Room must be filled");
          setNewLRError(true);
        }else if(bed.length < 1){
            setNewLRErrMsg("Bed must be filled");
            setNewLRError(true);
        }else if(newCategory.length < 1){
            setNewLRErrMsg("Category must be filled");
            setNewLRError(true);
        }else if(newStatus.length < 1){
            setNewLRErrMsg("Status must be filled");
            setNewLRError(true);
        }
        else{
            const appointment = {
                id : idSelected,
                patient : newPatient,
                doctor : newDoctor,
                room : room,
                bed : bed,
                date : newStartDate,
                status : newStatus,
                category : newCategory,
                result : null,
                job : newJob
            }
            // console.log(appointment)
            await AppointmentUtils.updateAppointment(appointment)
            setDataChanged(!dataChanged);
            setOpenEditForm(false);
        }
      }
      
      const resetForm = () => {
        setNewId("");
        setRoom("");        
        setNewPatient("");
        setBed("");
        setNewDoctor("");
        setNewStartDate(new Date());
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
        if(newPatient.length < 1){
            setNewLRErrMsg("Patient must be selected");
            setNewLRError(true);
        }else if(newDoctor.length < 1){
          setNewLRErrMsg("Doctor must be filled");
          setNewLRError(true);
        }else if(room.length < 1){
          setNewLRErrMsg("Room must be filled");
          setNewLRError(true);
        }else if(bed.length < 1){
            setNewLRErrMsg("Bed must be filled");
            setNewLRError(true);
        }else if(newCategory.length < 1){
            setNewLRErrMsg("Category must be filled");
            setNewLRError(true);
        }
          else{
            const appointment = {
              patient : newPatient,
              doctor : newDoctor,
              room : room,
              bed : bed,
              date : newStartDate,
              status : "Queued",
              category : newCategory,
              result : null
            }
            await AppointmentUtils.insertAppointment(appointment);
            setDataChanged(!dataChanged);
            setOpenCreateForm(false);
        }
      }

      const currentDate = new Date();    
      
      const handleResult = (row) => {
        setIdSelected(row.id)
        setNewSymptoms(row.symptoms)
        setNewDiagnosis(row.diagnosis)

        setOpenRCreateForm(true)
      } 

      const handlePrescription = (row) => {
        setRoom("");        
        setNewPatient("");
        setSelectedMedicines([])
        setNewNote("")
        setNewCategory("")

        setOpenPCreateForm(true)
      } 

      const handleSchedule = (row) => {
        setRoom("")
        setBed("")
        setNewPatient(row.patient)
        setNewDoctor(row.doctor)
        setNewCategory("")
        setNewStartDate(new Date())
        setIdSelected(row.id)
        setNewStatus("Queued")
        setNewJob("")

        setNewLRError(false);
        setNewLRErrMsg("");

        setOpenSCreateForm(true);
      } 

      const handleSSubmitForm = async () => {
        if(room.length < 1){
          setNewLRErrMsg("Room must be filled");
          setNewLRError(true);
        }else if(bed.length < 1){
            setNewLRErrMsg("Bed must be filled");
            setNewLRError(true);
        }else if(newCategory.length < 1){
            setNewLRErrMsg("Category must be filled");
            setNewLRError(true);
        }
          else{
            const appointment = {
              patient : newPatient,
              doctor : newDoctor,
              room : room,
              bed : bed,
              date : newStartDate,
              status : "Queued",
              category : newCategory,
              result : null
            }
            await AppointmentUtils.insertAppointment(appointment);
            setDataChanged(!dataChanged);
            setOpenSCreateForm(false);
        }
      }

      const handleRCloseForm = () => {
        setOpenRCreateForm(false)
      }

      const handleRSubmitForm = async () => {
        if(newDiagnosis.length < 1){
          setNewLRErrMsg("Diagnosis must be filled");
          setNewLRError(true);
        }else if(newSymptoms.length < 1){
            setNewLRErrMsg("Symptoms must be filled");
            setNewLRError(true);
        }else{
            const appointment = {
              id : idSelected,
              diagnosis : newDiagnosis,
              symptoms : newSymptoms
            }
            await AppointmentUtils.updateResult(appointment);
            setDataChanged(!dataChanged);
            setOpenRCreateForm(false);
        }
      }

      const handleSCloseForm = () => {
        setOpenSCreateForm(false)
      }

      const handlePSubmitForm = () => {
        if(newPatient.length < 1){
          setNewLRErrMsg("Patient must be filled");
          setNewLRError(true);
        }else if(selectedMedicines.length < 1){
          setNewLRErrMsg("Medicines must be filled");
          setNewLRError(true);
        }else if(newCategory.length < 1){
          setNewLRErrMsg("Category must be filled");
          setNewLRError(true);
        }else if(newRoom.length < 1){
          setNewLRErrMsg("Room must be filled");
          setNewLRError(true);
        }else if(newNote.length < 1){
          setNewLRErrMsg("Note must be filled");
          setNewLRError(true);
        }else{
          const p = {
            patient : newPatient,
            medicines : medicines,
            
          }
          setOpenPCreateForm(false)
        }

      }
  
      const handlePCloseForm = () => {
        setOpenPCreateForm(false)
      }

      const [selectedMedicines, setSelectedMedicines] = useState<MFOptionCombo[]>([]);

      const handleMultiComboChange = (event: React.ChangeEvent<{}>, newValue: MFOptionCombo[]) => {
        const uniqueNewValue = newValue.filter((medicine, index, self) =>
          index === self.findIndex((m) => m.id === medicine.id)
        );
        setSelectedMedicines(uniqueNewValue);
      };

      const columns = [
      
        { field: 'id'},
        { field: 'doctorN', headerName: 'Doctor', width: 150 },
        { field: 'patientN', headerName: 'Patient', width: 150 },
        { field: 'room', headerName: 'Room', width: 75 },
        { field: 'bed', headerName: 'Bed', width: 50 },
        { field: 'dateFormatted', headerName: 'Date', width: 150 },
        { field: 'status', headerName: 'Status', width: 125 },
        { field: 'category', headerName: 'Category', width: 150 },
        { field: 'queueNumber', headerName: 'Queue', width: 100 },
        {
          field: 'schedule',
          headerName: 'Schedule',
          width: 100,
          renderCell: (params: GridCellParams) => (
              <div>  
              {params.row.status === 'Completed' && (<IconButton color="primary" size='small' style={{fontSize : '16px'}} onClick={() => handleSchedule(params.row)}>
                Schedule
              </IconButton>)}
              </div>
          ),
        },
        {
          field: 'prescription',
          headerName: 'Prescription',
          width: 100,
          renderCell: (params: GridCellParams) => (
              <div>  
              {params.row.status === 'Completed' && (<IconButton color="primary" size='small' style={{fontSize : '16px'}} onClick={() => handlePrescription(params.row)}>
                Prescription
              </IconButton>)}
              </div>
          ),
        },
        {
          field: 'result',
          headerName: 'Result',
          width: 100,
          renderCell: (params: GridCellParams) => (
              <div>  
              {params.row.status === 'Completed' && (<IconButton color="primary" size='small' style={{fontSize : '16px'}} onClick={() => handleResult(params.row)}>
                Result
              </IconButton>)}
              </div>
          ),
        },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 150,
          renderCell: (params: GridCellParams) => {
            if(localStorage.getItem('role') == 'admin' || localStorage.getItem('role') == 'nurse'){
              return (
                <div>
                  <IconButton color="primary" onClick={() => handleEdit(params.row)}>
                    <AiFillEdit />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleBan(params.row)}>
                    <AiFillDelete />
                  </IconButton>
              </div>
              )
            }
            return null
              
          },
        },
      ];
      
    
    
  
    return (
        <React.Fragment>
            <Head>
                <title>Appointment Page</title>
            </Head>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar/>                
                <Box component="main" sx={{ flexGrow: 1, p: 3, width:'auto'}}>
                <DrawerHeader />
                <div style={{display : "flex", justifyContent:"space-between", alignItems:'center'}}>
                  <Typography component="h1" variant="h5" color="primary">
                  Appointments
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
                  rows={appointments} columns={columns}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'auto',
                      width: '100%',
                      }}/>
                    
                </Box>
            </Box>

            <FormDialog
                title={"Edit appointments"} 
                success_msg={"Successfully edited appointment"} 
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
                            component: <FormItemCombo<User> value={newDoctor} fieldname='Doctor' placeholder='Doctor' options={Array.isArray(Doctors) ? Doctors.map((e, idx) => convertDoctorMFOption(idx, e)) : []} handleChange={handleDoctorChange}/>
                          },
                          {
                            id: "3",
                            component: <FormItemDateTime value={newStartDate} fieldname='Start Date' min={new Date()} max={new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())} handleChange={setNewStartDate}/>
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
                          },
                          {
                            id: "6",
                            component: <FormItemSelect<string> value={newCategory} fieldname='Category' placeholder='Category' options={categories} handleChange={handleRoleChange}/>
                          },
                          {
                            id: "7",
                            component: <FormItemSelect<string> value={newStatus} fieldname='Status' placeholder='Status' options={status} handleChange={handleStatusChange}/>
                          },
                    ]
                }
                handleSubmit={handleSubmitEditForm}
                handleClose={handleCloseEditForm}
                open={openEditForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />

              <FormDialog
                title={"Create prescription"} 
                success_msg={"Successfully added prescription"} 
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
                            component: <FormItemMultiCombo
                            fieldname="Medicines"
                            value={selectedMedicines}
                            options={Array.isArray(medicines) ? medicines.map((e, idx) => convertMedicineMFOption(idx, e)) : []}
                            handleChange={handleMultiComboChange}
                            placeholder="Medicines"
                          />
                          },
                          {
                            id: "3",
                            component: <FormItemSelect<string> value={newCategory} fieldname='Category' placeholder='Category' options={categories} handleChange={handleRoleChange}/>
                          },
                          {
                            id: "4",
                            component: <FormItemCombo<Room> value={room} fieldname='Room' placeholder='Room' options={Array.isArray(rooms) ? rooms.map((e, idx) => convertRoomMFOption(idx, e)) : []} handleChange={handleRoomChange}/>
                          },
                          {
                            id: "5",
                            component: <FormItemShortText value={newNote} fieldname='Note' placeholder='Note' minLength={0} maxLength={500} handleChange={handleNoteChange}/>
                          },
                    ]
                }
                handleSubmit={handlePSubmitForm}
                handleClose={handlePCloseForm}
                open={openPCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />

            <FormDialog
                title={"Add Appointment"} 
                success_msg={"Successfully added appointment"} 
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
                            component: <FormItemCombo<User> value={newDoctor} fieldname='Doctor' placeholder='Doctor' options={Array.isArray(Doctors) ? Doctors.map((e, idx) => convertDoctorMFOption(idx, e)) : []} handleChange={handleDoctorChange}/>
                          },
                          {
                            id: "3",
                            component: <FormItemDateTime value={newStartDate} fieldname='Start Date' min={new Date()} max={new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())} handleChange={setNewStartDate}/>
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
                          },
                          {
                            id: "6",
                            component: <FormItemSelect<string> value={newCategory} fieldname='Category' placeholder='Category' options={categories} handleChange={handleRoleChange}/>
                          },
                    ]
                }
                handleSubmit={handleSubmitForm}
                handleClose={handleCloseForm}
                open={openCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />

              <FormDialog
                title={"Schedule next appointment"} 
                success_msg={"Successfully scheduled next appointment"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                          {
                            id: "1",
                            component: <FormItemDateTime value={newStartDate} fieldname='Start Date' min={new Date()} max={new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())} handleChange={setNewStartDate}/>
                          },
                          {
                            id: "2",
                            component: <FormItemCombo<Room> value={room} fieldname='Room' placeholder='Room' options={Array.isArray(rooms) ? rooms.map((e, idx) => convertRoomMFOption(idx, e)) : []} handleChange={handleRoomChange}/>
                          },
                          {
                            id: "3",
                            component: room && (
                              <FormItemCombo<String> value={bed} fieldname='Bed' placeholder='Bed' options={Array.isArray(beds) ? beds.map((e, idx) => convertBedMFOption(idx, e)) : []} handleChange={handleBedChange}/>
                            ),
                          },
                          {
                            id: "4",
                            component: <FormItemSelect<string> value={newCategory} fieldname='Category' placeholder='Category' options={categories} handleChange={handleRoleChange}/>
                          },
                    ]
                }
                handleSubmit={handleSSubmitForm}
                handleClose={handleSCloseForm}
                open={openSCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />

              <FormDialog
                title={"Appointment result"} 
                success_msg={"Successfully added result"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                      {
                        id: "1",
                        component: <FormItemShortText value={newSymptoms} fieldname='Patient symptoms' placeholder='Patient symptoms' minLength={0} maxLength={500} handleChange={handleSymChange}/>
                      },
                      {
                        id: "2",
                        component: <FormItemShortText value={newDiagnosis} fieldname='Doctor diagnosis' placeholder='Doctor diagnosis' minLength={0} maxLength={500} handleChange={handleDiagChange}/>
                      },
                    ]
                }
                handleSubmit={handleRSubmitForm}
                handleClose={handleRCloseForm}
                open={openRCreateForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />

            
        </React.Fragment>
    );
}