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
import { Backdrop, ButtonGroup, CircularProgress, DialogActions, DialogContent, DialogTitle, Fab, ToggleButton, ToggleButtonGroup} from '@mui/material';
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
import { JobUtils } from '../utils/job_manager';
import { CertifUtils } from '../utils/certif_manager';
import { v4 as uuidv4 } from 'uuid';

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

const types : MFOption[] = [
    {label : "Birth", value: "Birth"},
    {label : "Death", value: "Death"},
]

export default function Certificates() {    
    const classes = useStyles();
    const [certificates, setCertificates] = useState<any>([]);
    const [certificate, setCertificate] = useState<any>([]);

    const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
    const [ openEditForm, setOpenEditForm ] = React.useState(false);
  
    const [ newLRError, setNewLRError ] = React.useState<boolean>(false);
  
    const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');
  
    const [ idSelected, setIdSelected] = React.useState("")
    const [ newName, setNewName ] = React.useState<string>("");
    const [ newDOB, setNewDOB ] = React.useState<Date>(new Date(Date.now()));
    const [ newAddress, setNewAddress ] = React.useState<string>("");
    const [ newGender, setNewGender] = useState<string>("");
    const [ newPatient, setNewPatient ] = React.useState<any>("");
    const [ newStaff, setNewStaff ] = React.useState<string>("");
    const [newStatus, setNewStatus] = React.useState<string>("");
    const [newType, setNewType] = React.useState<string>("");
    const [fileName, setFileName] = React.useState<string>("")

    const [patients, setPatients] = useState<any>(0);

    useEffect(() => {
      const fetchPatients = async () => {
          const fetchedPatients = await PatientUtils.getAllPatient();
          setPatients(fetchedPatients);
      };
  
      fetchPatients();
  }, []);




    function convertPatientMFOption(index: number, patient: Patient) : MFOptionCombo{
      return {id : index, label: patient.name, content: patient} as MFOptionCombo;
    }

    const handlePatientChange = (event: any, newValue: MFOptionCombo) => {
        // console.log(newValue.content)
        setNewPatient(newValue.content.id)
        setNewName(newValue.content.name)
        setNewGender(newValue.content.gender)
        setNewDOB(newValue.content.formattedDOB)
        setNewAddress(newValue.content.address)
      };

    const handleNameChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewName(event.target.value);
    }

    const handleAddressChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewAddress(event.target.value);
    }

    const handleTypeChange = (e: React.ChangeEvent<{ value: string }>) => {
        if(e.target.value)
          setNewType(e.target.value);
      };

    const [dataChanged, setDataChanged] = React.useState(false)

    useEffect(() => {
        const fetchRequests = async () => {
            const fetchedRequests = await CertifUtils.getAllCertif();
            setCertificates(fetchedRequests);
        };
    
        fetchRequests();
    }, [dataChanged]);

    const handleEdit = (row) => {

        setNewLRError(false);
        setNewLRErrMsg("");

        setIdSelected(row.id)

        handleEditForm();
      };

      const handleEditForm  = () => {
        setOpenEditForm(true);
      }

      const handleCloseEditForm = () => {
        setOpenEditForm(false);
      }

      const handleSubmitEditForm = () => {
        if(fileName.length < 1){
          setNewLRErrMsg("File must be filled");
          setNewLRError(true);
        }
        else{
            CertifUtils.approveCertif(idSelected, fileName)
            setDataChanged(!dataChanged);
            setOpenEditForm(false);
        }
      }
      
      const resetForm = () => {
        setNewPatient("")
        setNewName("");
        setNewDOB(new Date())
        setNewGender("");
        setNewAddress("");
        setNewType("Birth")
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
        if(newName.length < 1){
            setNewLRErrMsg("Name must be filled");
            setNewLRError(true);
        }else if(newGender.length < 1){
          setNewLRErrMsg("Gender must be filled");
          setNewLRError(true);
        }else if(newAddress.length < 1){
          setNewLRErrMsg("Address must be filled");
          setNewLRError(true);
        }else{
            const certif = {
              patient : newPatient,
              name : newName,
              createdDate : Timestamp.fromDate(new Date()),
              gender : newGender,
              dob : newDOB,
              address: newAddress,
              type : newType,
              status : "Waiting for approval",
            }
            // console.log(certif)
            await CertifUtils.insertCertif(certif)
            setDataChanged(!dataChanged);
            setOpenCreateForm(false);
        }
      }

      const checkStaff = (staffs) => {
        if(staffs.includes(localStorage.getItem('id')))
        return true

        return false
      }
  
      const columns = [
      
        { field: 'id'},
        { field: 'name', headerName: 'Patient', width: 150 },
        { field: 'createdDate', headerName: 'Created Date', width: 150 },
        { field: 'gender', headerName: 'Gender', width: 100 },
        { field: 'dob', headerName: 'DOB', width: 150 },
        { field: 'type', headerName: 'Type', width: 150 },
        { field: 'status', headerName: 'Status', width: 150 },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 150,
          renderCell: (params: GridCellParams) => {
            if(checkStaff(params.row.staffs)){
              return (
                <div>
                <IconButton color="primary" onClick={() => handleEdit(params.row)}>
                  <AiFillEdit/>
                </IconButton>
                </div>
              )
            }
            return null
              
          },
        },
      ];
      
    const handleUpload = (event) => {
      const file = event.target.files[0];
      if (!file) {
        setNewLRError(true)
        setNewLRErrMsg("File must be an image")
        return; 
      }
    
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']; // Define the allowed image file types
    
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload an image (JPG, JPEG, PNG, or GIF).');
        return; 
      }
      
      setFileName(file.name)
      
    }
    
  
    return (
        <React.Fragment>
            <Head>
                <title>Certificates Page</title>
            </Head>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar/>                
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                <div style={{display : "flex", justifyContent:"space-between", alignItems:'center'}}>
                  <Typography component="h1" variant="h5" color="primary">
                  Certificates
                  </Typography>
                  {(typeof localStorage !== 'undefined' &&(localStorage.getItem('role') == "admin" || localStorage.getItem('role') == 'nurse'))&&(<Fab
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
                </Fab>)}
                </div>

                <br/>
                
                <DataGrid initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                    },
                    },
                  }}
                  rows={certificates} columns={columns}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'auto',
                      width: '100%',
                      }}/>
                    
                </Box>
            </Box>

            <Dialog open={openEditForm} onClose={handleCloseEditForm}>
              <DialogTitle>Upload File</DialogTitle>
              <DialogContent>
              {newLRError && (
                <Typography variant="body2" color="error" gutterBottom>
                  {newLRErrMsg}
                </Typography>
              )}
                <input type="file" onChange={handleUpload} />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseEditForm}>Cancel</Button>
                <Button onClick={handleSubmitEditForm} color="primary">
                  Upload
                </Button>
              </DialogActions>
            </Dialog>

            <FormDialog
                title={"Add Certificate"} 
                success_msg={"Successfully added certificate"} 
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
                        component: <FormItemShortText value={newName} fieldname='Patient Name' placeholder='Patient Name' minLength={0} maxLength={500} handleChange={handleNameChange}/>
                      },
                      {
                        id: "3",
                        component: <FormItemRadioButton value={newGender} fieldname='Patient Gender'
                        options={[
                          { id: 'Male', label: 'Male' },
                          { id: 'Female', label: 'Female' },
                        ]} handleChange={(e) => setNewGender(e.target.value)}/>
                      },
                      {
                        id: "4",
                        component: <FormItemLongText value={newAddress} fieldname='Patient Address' placeholder='Patient Address' minLength={0} maxLength={500} handleChange={handleAddressChange}/>
                      },
                      {
                        id: "5",
                        component: <FormItemDateTime value={new Date(newDOB)} fieldname='Patient DOB' min={new Date("1950-01-01")} max={new Date(Date.now())} handleChange={setNewDOB}/>
                      },
                      {
                        id: "6",
                        component: <FormItemSelect<string> value={newType} fieldname='Certificate Type' placeholder='Type' options={types} handleChange={handleTypeChange}/>
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