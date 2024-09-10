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
import SearchBar from 'material-ui-search-bar';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import { Backdrop, ButtonGroup, CircularProgress, Fab, ToggleButton, ToggleButtonGroup} from '@mui/material';
import { makeStyles } from '@material-ui/core/styles';
import { ShiftUtils } from '../utils/shift_manager';
import AddIcon from '@mui/icons-material/Add'
import FormDialog, { FormItemCombo, FormItemDateTime, FormItemLongText, FormItemRadioButton, FormItemSelect, FormItemShortText, MFOption } from '../components/InsertFormDialog';
import { Timestamp } from 'firebase/firestore';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
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


let userRole = "";

export default function Staffs() {
    const { authenticatedUser} = useAuth();
    userRole = authenticatedUser?.role;
    const [staffs, setStaffs] = useState([]);

    const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
    const [ openEditForm, setOpenEditForm ] = React.useState(false);
  
    const [ newLRError, setNewLRError ] = React.useState<boolean>(false);
  
    const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');
  
    const [ newId, setNewId ] = React.useState<string>("");
    const [ newRole, setNewRole ] = React.useState<string>("");
    const [ newName, setNewName ] = React.useState<string>("");
    const [ newEmail, setNewEmail ] = React.useState<string>("");
    const [ newShift, setNewShift ] = React.useState<string>("");
    const [ newPassword, setNewPassword ] = React.useState<string>("");

    const [ searched, setSearched ] = React.useState<string>("");

    const handleRoleChange = (e: React.ChangeEvent<{ value: string }>) => {
        if(e.target.value)
          setNewRole(e.target.value);
      };

    const [dataChanged, setDataChanged] = React.useState(false)

    const [loading, setLoading] = React.useState(false)

    useEffect(() => {
        const fetchStaffs = async () => {
            const fetchedStaffs = await UserUtils.getAllUser();
            setStaffs(fetchedStaffs);
        };
    
        fetchStaffs();
    }, [dataChanged]);

    const handleEdit = (row) => {

        setNewId(row.id);
        setNewRole(row.role);
        setNewName(row.name);
        setNewEmail(row.email);
        setNewPassword(row.password);
        setNewShift(row.shift.toUpperCase());

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
        if(newRole.length < 1){
          setNewLRErrMsg("Role must be filled");
          setNewLRError(true);
        }
        else{
            const s = {
              uid : newId,
              role : newRole,
              name : newName,
              email : newEmail,
              password : newPassword,
              shiftId : newShift,
            }
            console.log(s);
            UserUtils.updateUser(s);
            setDataChanged(!dataChanged);
            setOpenEditForm(false);
        }
      }

      const handleDelete = (id) => {
        UserUtils.deleteUser(id);
        setDataChanged(!dataChanged);
      };
  
      const columns = [
      
        { field: 'id'},
        { field: 'name', headerName: 'Name', width: 125 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'role', headerName: 'Role', width: 100 },
        { field: 'shift', headerName: 'Shift', width: 150 },
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
                <title>Staffs Page</title>
            </Head>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar/>                
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                <Typography component="h1" variant="h5" color="primary">
                Staffs
                </Typography>
                
                <DataGrid initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                    },
                    },
                  }}
                  rows={staffs} columns={columns}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'auto',
                      width: '100%',
                      }}/>
                
                </Box>
            </Box>

            <FormDialog
                title={"Edit Staff"} 
                success_msg={"Successfully edited staff"} 
                positive_btn_label={"Edit"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                      {
                        id: "1",
                        component: <FormItemSelect<string> value={newRole} fieldname='Staff Role' placeholder='Staff Role' options={rolesFormatted} handleChange={handleRoleChange}/>
                      },
                    ]
                }
                handleSubmit={handleSubmitEditForm}
                handleClose={handleCloseEditForm}
                open={openEditForm}
                openError={newLRError}
                setOpenError={setNewLRError}
            />

            
        </React.Fragment>
    );
}