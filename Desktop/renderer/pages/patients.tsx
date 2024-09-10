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
// import SearchBar from 'material-ui-search-bar';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import { Backdrop, ButtonGroup, CircularProgress, Fab, ToggleButton, ToggleButtonGroup} from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { ShiftUtils } from '../utils/shift_manager';
import AddIcon from '@mui/icons-material/Add'
import FormDialog, { FormItemDateTime, FormItemLongText, FormItemRadioButton, FormItemShortText } from '../components/InsertFormDialog';
import { Timestamp } from 'firebase/firestore';
import { PatientUtils } from '../utils/patient_manager';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
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

let userRole = "";

export default function Patients() {
    const { authenticatedUser} = useAuth();
    userRole = localStorage.getItem('role')
    const classes = useStyles();
    const [patients, setPatients] = useState([]);

    const [openPopup, setOpenPopup] = useState(false);

    const [patient, setPatient] = useState<any>({
      id: '',
      name: '',
      email: '',
      gender: '',
      phone: '',
      dob : '',
      address: ''
    });


    const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
    const [ openEditForm, setOpenEditForm ] = React.useState(false);
  
    const [ newLRError, setNewLRError ] = React.useState<boolean>(false);
  
    const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');
  
    const [ newId, setNewId ] = React.useState<string>("");
    const [ newName, setNewName ] = React.useState<string>("");
    const [ newStartDate, setNewStartDate ] = React.useState<Date>(new Date(Date.now()));
    const [ newEmail, setNewEmail ] = React.useState<string>("");
    const [ newPhone, setNewPhone ] = React.useState<string>("");
    const [ newAddress, setNewAddress ] = React.useState<string>("");
    const [ newGender, setNewGender] = useState<string>("");

    const [ searched, setSearched ] = React.useState<any>("");

    const handleNameChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewName(event.target.value);
    }

    const handlePhoneChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewPhone(event.target.value);
    }
  
    const handleEmailChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewEmail(event.target.value);
    }
  
    const handleAddressChange = (event: React.ChangeEvent<{ value: string }>) => {
      setNewAddress(event.target.value);
    }

    const handleSearch = (event) => {
      setSearched(event.target.value);
    };

    const cancelSearch = () => {
      setSearched("");
    };


    const [dataChanged, setDataChanged] = React.useState(false)

    const [loading, setLoading] = React.useState(false)
    
    useEffect(() => {
      if(dataChanged){
        const fetchPatients = async () => {
          const fetchedPatients = await PatientUtils.getAllPatient();
          setPatients(fetchedPatients);
          
        };
    
        fetchPatients();
        setDataChanged(false);
      }
    }, [dataChanged]);

    useEffect(() => {
        const fetchPatients = async () => {
            const fetchedPatients = await PatientUtils.getAllPatient();
            setPatients(fetchedPatients);
        };
    
        fetchPatients();
    }, []);

    useEffect(() => {
        if(searched !== ""){
          setPatients(patients.filter((x) =>
          x.name.toLowerCase().includes(searched.toLowerCase())
        ))
        }else{
          setDataChanged(true);
        }
    },[searched]);

    const handleEdit = (row) => {

        setNewId(row.id);
        setNewName(row.name);
        setNewStartDate(new Date(row.dob))
        setNewEmail(row.email);
        setNewGender(row.gender);
        setNewPhone(row.phone);
        setNewAddress(row.address);

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
        if(newName.length < 1){
          setNewLRErrMsg("Name must be filled");
          setNewLRError(true);
        }else if(newEmail.length < 1){
          setNewLRErrMsg("Email must be filled");
          setNewLRError(true);
        }else if(newGender.length < 1){
          setNewLRErrMsg("Gender must be filled");
          setNewLRError(true);
        }else if(newPhone.length < 1){
          setNewLRErrMsg("Phone must be filled");
          setNewLRError(true);
        }else if(newAddress.length < 1){
          setNewLRErrMsg("Address must be filled");
          setNewLRError(true);
        }
        else{
            const patient = {
              id : newId,
              name : newName,
              email : newEmail,
              gender : newGender,
              phone : newPhone,
              address: newAddress,
              dob : Timestamp.fromDate(newStartDate)
            }
            PatientUtils.updatePatient(patient);
            setDataChanged(true);
            setOpenEditForm(false);
        }
      }

      const handleDelete = (id) => {
        PatientUtils.deletePatient(id);
      };
      
      const resetForm = () => {
        setNewName("");
        setNewStartDate(new Date())
        setNewEmail("");
        setNewGender("");
        setNewPhone("");
        setNewAddress("");
      }
    
      const handleCreateNew = () => {
        resetForm();
        setNewLRError(false);
        setOpenCreateForm(true);
      }
    
      const handleCloseForm = () => {
        setOpenCreateForm(false);
      }
    
      const handleSubmitForm = () => {
        if(newName.length < 1){
            setNewLRErrMsg("Name must be filled");
            setNewLRError(true);
        }else if(newEmail.length < 1){
          setNewLRErrMsg("Email must be filled");
          setNewLRError(true);
        }else if(newGender.length < 1){
          setNewLRErrMsg("Gender must be filled");
          setNewLRError(true);
        }else if(newPhone.length < 1){
          setNewLRErrMsg("Phone must be filled");
          setNewLRError(true);
        }else if(newAddress.length < 1){
          setNewLRErrMsg("Address must be filled");
          setNewLRError(true);
        }
        else{
            const patient = {
              name : newName,
              email : newEmail,
              gender : newGender,
              phone : newPhone,
              address: newAddress,
              dob : Timestamp.fromDate(newStartDate)
            }
            PatientUtils.insertPatient(patient);
            setDataChanged(true);
            setOpenCreateForm(false);
        }
      }
  
      const columns = [
      
        { field: 'id'},
        { field: 'name', headerName: 'Name', width: 125 },
        { field: 'email', headerName: 'Email', width: 150 },
        { field: 'gender', headerName: 'Gender', width: 100 },
        { field: 'phone', headerName: 'Phone', width: 150 },
        { field: 'formattedDOB', headerName: 'DOB', width: 150 },
        { field: 'address', headerName: 'Address', width: 150 },
        {
          field: 'bill',
          headerName: 'Bills',
          width: 75,
          renderCell: (params: GridCellParams) => (
              <IconButton color="primary" onClick={() => {}}>
                <Typography component="h6" variant="h6" color="primary">
                  Bill
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
              <IconButton color="primary" onClick={() => handleEdit(params.row)}>
                <AiFillEdit/>
              </IconButton>
              <IconButton color="primary" onClick={() => handleDelete(params.row.id)}>
                <AiFillDelete/>
              </IconButton>
              </div>
          ),
        },
      ];
  
    
  
    return (
        <React.Fragment>
            <Head>
                <title>Patients Page</title>
            </Head>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar/>                
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                <div style={{display : "flex", justifyContent:"space-between", alignItems:'center'}}>
                  <Typography component="h1" variant="h5" color="primary">
                  Patients
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
                {/* <SearchBar
                  value={searched}
                  onChange={(searchVal) => handleSearch(searchVal)}
                  onCancelSearch={() => cancelSearch()}
                  placeholder="Search patient by name"
                /> */}
                <SearchBar
                  value={searched}
                  onChange={handleSearch}
                  onCancelSearch={cancelSearch}
                  placeholder="Search patient by name"
                />

                <br/>
                
                <DataGrid initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                      bill : userRole === "admin" ? true : false,
                      actions: userRole === "admin" ? true : false
                    },
                    },
                  }}
                  rows={patients} columns={columns}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'auto',
                      width: 'auto',
                      }}/>
                    
                </Box>
            </Box>
            

            <FormDialog
                title={"Edit Patient"} 
                success_msg={"Successfully edited patient"} 
                positive_btn_label={"Edit"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                      {
                        id: "1",
                        component: <FormItemShortText value={newName} fieldname='Patient Name' placeholder='Patient Name' minLength={0} maxLength={500} handleChange={handleNameChange}/>
                    },
                    {
                        id: "2",
                        component: <FormItemShortText value={newEmail} fieldname='Patient Email' placeholder='Patient Email' minLength={0} maxLength={500} handleChange={handleEmailChange}/>
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
                        component: <FormItemShortText value={newPhone} fieldname='Patient Phone' placeholder='Patient Phone' minLength={0} maxLength={500} handleChange={handlePhoneChange}/>
                    },
                    {
                        id: "5",
                        component: <FormItemDateTime value={new Date(newStartDate)} fieldname='Patient DOB' min={new Date("1950-01-01")} max={new Date(Date.now())} handleChange={setNewStartDate}/>
                    },
                    {
                        id: "6",
                        component: <FormItemLongText value={newAddress} fieldname='Patient Address' placeholder='Patient Address' minLength={0} maxLength={500} handleChange={handleAddressChange}/>
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
                title={"Add Patient"} 
                success_msg={"Successfully added patient"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                            id: "1",
                            component: <FormItemShortText value={newName} fieldname='Patient Name' placeholder='Patient Name' minLength={0} maxLength={500} handleChange={handleNameChange}/>
                        },
                        {
                            id: "2",
                            component: <FormItemShortText value={newEmail} fieldname='Patient Email' placeholder='Patient Email' minLength={0} maxLength={500} handleChange={handleEmailChange}/>
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
                            component: <FormItemShortText value={newPhone} fieldname='Patient Phone' placeholder='Patient Phone' minLength={0} maxLength={500} handleChange={handlePhoneChange}/>
                        },
                        {
                            id: "5",
                            component: <FormItemDateTime value={newStartDate} fieldname='Patient DOB' min={new Date("1950-01-01")} max={new Date(Date.now())} handleChange={setNewStartDate}/>
                        },
                        {
                            id: "6",
                            component: <FormItemLongText value={newAddress} fieldname='Patient Address' placeholder='Patient Address' minLength={0} maxLength={500} handleChange={handleAddressChange}/>
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