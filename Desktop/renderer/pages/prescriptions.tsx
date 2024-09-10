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
import { FormItemNumber } from '../components/InsertFormDialog';
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
    {label : 'Completed', value : 'Completed'},
]

export default function Prescriptions() {    
    const classes = useStyles();
    const [prescriptions, setPrescriptions] = useState([]);

    const [medicine, setMedicine] = useState<any>([]);

    const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
    const [ openEditForm, setOpenEditForm ] = React.useState(false);
  
    const [ newLRError, setNewLRError ] = React.useState<boolean>(false);
  
    const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');
  
    const [ newId, setNewId ] = React.useState<any>("");
    const [ newName, setNewName ] = React.useState<any>("");    
    const [ newPrice, setNewPrice ] = React.useState<any>("");
    const [ newStock, setNewStock ] = React.useState<any>("");

    const handlePChange = (e: React.ChangeEvent<{ value: number }>) => {
        setNewPrice(e.target.value);
    }

    const handleSChange = (e: React.ChangeEvent<{ value: number }>) => {
        setNewStock(e.target.value);
    }

    const handleNChange = (event: React.ChangeEvent<{ value: string }>) => {
        setNewName(event.target.value);
      }


    const [dataChanged, setDataChanged] = React.useState(false)

    useEffect(() => {
        const fetchRequests = async () => {
            const fetchedRequests = await MedicineUtils.getAllMedicine();
            setPrescriptions(fetchedRequests);
        };
    
        fetchRequests();
    }, [dataChanged]);

    const handleEdit = (row) => {        

        setNewId(row.id)
        setNewName(row.name)
        setNewPrice(row.price)
        setNewStock(row.stock)

        setNewLRError(false);
        setNewLRErrMsg("");

        handleEditForm();
      };

    const handleBan = async (row) => {
      
      setNewLRError(false);
      setNewLRErrMsg("");

      const Medicine = {
        id : row.id
      }
      await MedicineUtils.deleteMedicine(Medicine);
      setDataChanged(!dataChanged);

    };

      const handleEditForm  = () => {
        setOpenEditForm(true);
      }

      const handleCloseEditForm = () => {
        setOpenEditForm(false);
      }

      const handleSubmitEditForm = async () => {
        if(newName.length < 1){
            setNewLRErrMsg("Name must be filled");
            setNewLRError(true);
        }else if(newPrice <= 0 ){
          setNewLRErrMsg("Price must be more than 0");
          setNewLRError(true);
        }else if(newStock.length <= 0){
          setNewLRErrMsg("Stock must be more than 0");
          setNewLRError(true);
        }
        else{
            const medicine = {
                id : newId,
                stock : newStock,
                name : newName,
                price : newPrice
            }
            await MedicineUtils.updateMedicine(medicine)
            setDataChanged(!dataChanged);
            setOpenEditForm(false);
        }
      }
      
      const resetForm = () => {
        setNewId("");
        setNewName("");
        setNewPrice(1)
        setNewStock(1)
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
            setNewLRErrMsg("Patient must be selected");
            setNewLRError(true);
        }else if(newPrice.length < 1){
          setNewLRErrMsg("Doctor must be filled");
          setNewLRError(true);
        }else if(newStock.length < 1){
          setNewLRErrMsg("Room must be filled");
          setNewLRError(true);
        }
          else{
            const medicine = {
                name : newName,
                price : newPrice,
                stock : newStock,
            }
            await MedicineUtils.insertMedicine(medicine);
            setDataChanged(!dataChanged);
            setOpenCreateForm(false);
        }
      }

      const currentDate = new Date();      
  
      const columns = [
      
        { field: 'id'},
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'price', headerName: 'Price', width: 75 },
        { field: 'stock', headerName: 'Stock', width: 150 },
        {
          field: 'actions',
          headerName: 'Actions',
          width: 150,
          renderCell: (params: GridCellParams) => (
              <div>
              {(<IconButton color="primary" onClick={() => handleEdit(params.row)}>
                <AiFillEdit />
              </IconButton>)}
              {(<IconButton color="primary" onClick={() => handleBan(params.row)}>
                <AiFillDelete />
              </IconButton>)}
              </div>
          ),
        },
      ];
      
    
    
  
    return (
        <React.Fragment>
            <Head>
                <title>Medicine Page</title>
            </Head>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar/>                
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                <div style={{display : "flex", justifyContent:"space-between", alignItems:'center'}}>
                  <Typography component="h1" variant="h5" color="primary">
                  Prescriptions
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
                  rows={prescriptions} columns={columns}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'auto',
                      width: '100%',
                      }}/>
                    
                </Box>
            </Box>

            <FormDialog
                title={"Edit Prescriptions"} 
                success_msg={"Successfully edited Medicine"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                            id: "1",
                              component: <FormItemShortText value={newName} fieldname='Medicine Name' placeholder='Medicine Name' minLength={0} maxLength={100} handleChange={handleNChange}/>
                        },
                        {
                            id: "2",
                            component: <FormItemNumber value={newPrice} fieldname='Medicine Price' min={1} max={99999999999} handleChange={handlePChange} unit={""}/>
                        },
                        {
                            id: "3",
                            component: <FormItemNumber value={newStock} fieldname='Medicine Stock' min={1} max={99999999999} handleChange={handleSChange} unit={""}/>
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
                success_msg={"Successfully added medicine"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                            id: "1",
                              component: <FormItemShortText value={newName} fieldname='Medicine Name' placeholder='Medicine Name' minLength={0} maxLength={100} handleChange={handleNChange}/>
                        },
                        {
                            id: "2",
                            component: <FormItemNumber value={newPrice} fieldname='Medicine Price' min={1} max={99999999999} handleChange={handlePChange} unit={""}/>
                        },
                        {
                            id: "3",
                            component: <FormItemNumber value={newStock} fieldname='Medicine Stock' min={1} max={99999999999} handleChange={handleSChange} unit={""}/>
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