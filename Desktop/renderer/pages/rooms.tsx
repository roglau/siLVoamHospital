import React, { useEffect, useState } from 'react';
import { makeStyles, styled } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Head from 'next/head';
import { CssBaseline, Dialog, DialogActions, DialogContent, Fab, IconButton } from '@mui/material';
import { Box, maxWidth } from '@mui/system';
import Sidebar from '../components/Sidebar';
import { Bed, Room, RoomUtils } from '../utils/room_manager';
import AddIcon from '@mui/icons-material/Add'
import FormDialog, { FormItemCombo, FormItemNumber, FormItemRadioButton, FormItemSelect, FormItemShortText, MFOption, MFOptionCombo } from '../components/InsertFormDialog';
import { resetServerContext } from 'react-beautiful-dnd';
import { SearchBar } from '../components/SearchBar';
import { ManualAutoComplete } from '../components/FormItems';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { DataGrid, GridCellParams } from '@mui/x-data-grid';
import { UserUtils } from '../utils/user_manager';
import { Patient, PatientUtils } from '../utils/patient_manager';

const buildings: MFOption[] = [
    { label: "A", value: 'A'},
    { label: 'B', value: 'B' },
  ];

  const floors: MFOption[] = Array.from({ length: 9 }, (_, index) => ({
    label: (index + 1).toString(),
    value: (index + 1).toString(),
  }));
  

  const types: MFOption[] = [
    { label: "Single", value: 'Single'},
    { label: 'Sharing', value: 'Sharing' },
    { label: 'VIP', value: 'VIP' },
    { label: 'Royale', value: 'Royale' },
    { label: 'Emergency', value: 'Emergency' },

  ];


export default function Rooms() {  
  const [userR, setUserR] = useState("");
  useEffect(() => {
    setUserR(localStorage.getItem('role'));
  }, [])
    

  const [ dataChanged, setDataChanged] = React.useState(false);
  const [rooms , setRooms] = useState<any>(0)

  useEffect(() => {
    fetchRooms();
  }, [dataChanged])

  const fetchRooms = async () => {
    const fetchedRooms = await RoomUtils.getAllRoom();
    setRooms(fetchedRooms);
  }


  function getStatusColor(status) {
    switch (status) {
      case 'Available':
        return 'green';
      case 'Unusable':
        return 'red';
      case 'Filled':
        return 'yellow';
      default:
        return 'textSecondary';
    }
  }

    const [ openCreateForm, setOpenCreateForm ] = React.useState(false);

    const [ newLRError, setNewLRError ] = React.useState<boolean>(false);
  
    const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');

    
    const [ newName, setNewName ] = React.useState<string>("");
    const [ newF, setNewF ] = React.useState<number>(1);
    const [newB, setNewB ] = React.useState<string>("");
    const [ newR, setNewR ] = React.useState<number>(1);
    const [ newRT, setNewRT ] = React.useState<any>(0);

    const [ filterF, setFilterF ] = React.useState<any>("");
    const [filterB, setFilterB ] = React.useState<string>("");

    const [ searched, setSearched ] = React.useState<any>("");
    const [ filtered, setFiltered ] = React.useState<any>("");
  
  const handleCreateNew = () => {
    resetForm();
    setNewLRError(false);
    setOpenCreateForm(true);
  }

  const resetForm = () => {
    setNewB("A");
    setNewF(1);
    setNewR(1)
    setNewRT("Single")
  }

  const handleCloseForm = () => {
    setOpenCreateForm(false);
  }

  async function checkRoom(s){
    
    const room = await RoomUtils.getRoom(s)
    if(room){
        return true
    }
    return false
  }

  const [adding, setAdding] = useState(false)

  const handleAddBed = async (roomId) => {
    if(!adding){
      setAdding(true)
      const count = await RoomUtils.getBedCount();
      const room = await RoomUtils.getRoomNId(roomId);

      await RoomUtils.updateAddBedRoom(room, (count+1).toString());
      setDataChanged(!dataChanged)
      setAdding(false)
    }
    
  }

  const handleSubmitForm = async () => {
    const id = newB + newF.toString() + newR.toString().padStart(3, "0");
    let maxBed = 1
    if (newRT === "Sharing") {
        maxBed = 6;
    } else if (newRT === "Emergency") {
        maxBed = 12;
    }

    if( await checkRoom(id)){
        setNewLRErrMsg("Room already exists");
        setNewLRError(true);
    }else if(newR > 999){
      setNewLRErrMsg("Room number must between 1 - 999");
      setNewLRError(true);
    }
    else{
        RoomUtils.insertRoom(id, newRT, maxBed)
        setDataChanged(!dataChanged)
        setOpenCreateForm(false);
    }
  }

  const handleFFChange = (event: any, newValue: MFOptionCombo) => {
    if(newValue !== null) 
      setFilterF(newValue.content);
    else setFilterF("");
  };

  const handleFBChange = (event: any, newValue: MFOptionCombo) => {
    if(newValue !== null) 
      setFilterB(newValue.content);
    else setFilterB("")
  };

  function convertBMFOption(index: number, b: MFOption) : MFOptionCombo{
    return {id : index, label: b.value, content: b.value} as MFOptionCombo;
  }

  function convertFMFOption(index: number, f: MFOption) : MFOptionCombo{
    return {id : index, label: f.value, content: f.value} as MFOptionCombo;
  }

  const handleFChange = (e: React.ChangeEvent<{ value: number }>) => {
    setNewF(e.target.value);
  }

  const handleRChange = (e: React.ChangeEvent<{ value: number }>) => {
    setNewR(e.target.value)
  }

  const handleBChange = (e: React.ChangeEvent<{ value: string }>) => {
    if(e.target.value)
      setNewB(e.target.value);
  };


  const handleRTChange = (e : React.ChangeEvent<{ value: string }>) => {
    if(e.target.value)
        setNewRT(e.target.value);
  }
  
  const handleSearch = (event) => {
    setSearched(event.target.value);
  };

  const handleFilter = async () => {
    const filter = filterB + filterF
    if(filter !== undefined && filter !== null && filter !== "") {
      console.log(filter)
      await fetchRooms()
      setFiltered(filter)
    }else{
      setFiltered("")
    }
  }

  const cancelSearch = () => {
    setSearched("");
  };

  useEffect(() => {
    if(searched !== ""){
      setRooms(rooms.filter((x) =>
      x.id.toLowerCase().includes(searched.toLowerCase())
    ))
    }else{
      setDataChanged(!dataChanged);
    }
  },[searched]);

  useEffect(() => {
    if(filtered !== "" && filtered && filtered !== undefined){
      setRooms(rooms.filter((x) =>
      x.id.toLowerCase().includes(filtered.toLowerCase())
    ))
    }else{
      setDataChanged(!dataChanged);
    }
  },[filtered]);

  const [openJobD, setOpenJobD] = useState(false)
  const [jobs, setJobs] = useState([])

  const handleOpenJobD = async (id) => {
    const r = await rooms.filter((room) => room.id === id)
    await r.map( async (rr) => {
      await setJobs(rr.jobs.filter((job) => job.status !== "completed"))
    })

    console.log(jobs)
    
    setOpenJobD(true)
  }

  const handleCloseJobD = () => {
    setOpenJobD(false)
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
    { field: 'room', headerName: 'Room', width: 125 },
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
              <Typography component="h6" variant="h6" style={{fontSize:'16'}}>
              Staffs
              </Typography>
          </IconButton>
      ),
  },
  ];

  const columnsE = [
    {field : 'id', headerName : "Id", width:250},
    { field: 'name', headerName :"Name", width : 200},
  ];

  const [selectedA, setSelectedA] = useState(false);
  const [selectedU, setSelectedU] = useState(false);
  const [selectedF, setSelectedF] = useState(false);

  const [openBed, setOpenBed] = useState(false)
  const [patientD, setPatientD] = useState<any>([])

  const handleCloseBed = () => {
    setOpenBed(false)
  }

  const [bed, setBed] = useState<any>([])
  const [room, setRoom] = useState<any>([])

  const handleBedAction = async (bed,room) => {
    setBed(bed)
    setRoom(room)
    // console.log(room.jobs, bed.id)
    switch (bed.status) {
      case 'Available':
        setSelectedA(true)
        setSelectedF(false);
        setSelectedU(false)
        setOpenBed(true)
        break
      case 'Unusable':
        setSelectedA(false)
        setSelectedF(false);
        setSelectedU(true)
        setOpenBed(true)
        break
      case 'Filled':
        const staff = room.jobs.filter((job) => job.bed == bed.id && job.status !== "completed" && job.assignedEmployees && job.assignedEmployees.length > 0)
        // room.jobs.map((job) =>  console.log(job.bed))
        // console.log(staff[0].assignedEmployees)
        // console.log(staff)
        // console.log(room.jobs.filter((job) => job.bed == bed.id && job.status !== "completed"))
        const transformedBed = {
          id : bed.patientD.id,
          name: bed.patientD.name,
          gender: bed.patientD.gender,
          dob: bed.patientD.dob,
          assignedEmployees: staff[0].assignedEmployees
        };
        setSelectedA(false)
        setSelectedF(true);
        setSelectedU(false)
        await setPatientD(transformedBed)
        setOpenBed(true)
        break
    }
  }

  const columnsP = [
    { field: 'id'},
    { field: 'name', headerName: 'Name', width: 125 },
    { field: 'gender', headerName: 'Gender', width: 100 },
    { field: 'dob', headerName: 'DOB', width: 150 },   
    {
      field: 'staff',
      headerName: 'Staffs',
      width: 75,
      renderCell: (params: GridCellParams) => (
          <IconButton color="primary" onClick={() => handleDetail(params.row.assignedEmployees)}>
              <Typography component="h6" variant="h6" style={{fontSize:'16'}}>
              Staffs
              </Typography>
          </IconButton>
      ),
    },
  ];

  const endBed = async () => {
    await RoomUtils.updateBed(bed, room, "Unusable", null, "Making the bed", "cleaningservice")
    setDataChanged(!dataChanged)
    setOpenBed(false)
  }

  const [openMoveBed, setOpenMoveBed] = useState(false)

  const handleMoveBed = () => {
    setSRoom("")
    setSBed("")
    setSBeds("")
    setOpenMoveBed(true)
  }

  const handleCloseMoveBed = () => {
    setOpenMoveBed(false)
  }

  const moveBed = async () => {
    await RoomUtils.moveBed(room,bed, sRoom)
    setDataChanged(!dataChanged)
    setOpenMoveBed(false)
    setOpenBed(false)
  }

  const removeBed = async () => {
    // console.log(room,bed)
    await RoomUtils.removeBed(room,bed)
    setDataChanged(!dataChanged)
    setOpenBed(false)
  }

  const [openMoveP, setOpenMoveP] = useState(false)

  const handleMoveP = () => {
      setSRoom("")
      setSBed("")
      setSBeds("")
      setOpenMoveP(true)
  }

  const handleCloseP = () => {
      setOpenMoveP(false)
  }

  const moveP = async () => {
    // console.log(room,bed)
    // console.log(sRoom, sBed)
    await RoomUtils.movePatient(room,bed, sRoom, sBed)
    setDataChanged(!dataChanged)
    setOpenMoveP(false)
  }

  const [patients, setPatients] = useState<any>([])

  useEffect(() => {
    const fetchPatient = async () => {
      const p = await PatientUtils.getAllPatient()
      setPatients(p)
    }
    fetchPatient()
  }, [])


  const [selectedAssign, setSelectedAssign] = useState<any>("");

  const[sRoom, setSRoom] = useState<any>("")
  const[sBeds, setSBeds] = useState<any>("")
  const[sBed, setSBed] = useState<any>("")

  const handleRoomChange = async (event: any, newValue: MFOptionCombo) => {
    // console.log(newValue.content.beds)
    await setSRoom(newValue.content.id);
    const beds = await newValue.content.beds.filter((b) => b.status === "Available" && b.id !== bed.id)
    // console.log(beds)
    await setSBeds(beds)
  };

  const handleBedChange = (event: any, newValue: MFOptionCombo) => {
    // console.log(newValue.content)
    setSBed(newValue.content);
  };

  function convertRoomMFOption(index: number, room: Room) : MFOptionCombo{
    return {id : index, label: room.id, content: room} as MFOptionCombo;
  }

  function convertBedMFOption(index: number, bed: Bed) : MFOptionCombo{
    return {id : index, label: bed.id, content: bed.id} as MFOptionCombo;
  }


  const assignP = async () => {
    // console.log(selectedAssign)
    await RoomUtils.updateBed(bed, room, "Filled", selectedAssign, "Assign patient to bed", "nurse")
    setSelectedAssign("")
    setDataChanged(!dataChanged)
    setOpenAsg(false)
  }

  const [openAsg, setOpenAsg] = useState(false)
  
  const handleCloseAssign = async () => {
    setOpenAsg(false)
  }

  const handlePatientChange = (event: any, newValue: MFOptionCombo) => {
    // console.log(newValue.content.name)
    setSelectedAssign(newValue.content.id);
  };

  function convertPatientMFOption(index: number, patient: Patient) : MFOptionCombo{
    return {id : index, label: patient.name, content: patient} as MFOptionCombo;
  }

  return (
    <React.Fragment>
            <Head>
                <title>Rooms Page</title>
            </Head>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Sidebar/>                
                <Box component="main" sx={{ flexGrow: 1, p: 3 , mt:7}}>
                <br/>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <Typography component="h1" variant="h5" color="primary">
                      Rooms
                  </Typography>
                  { userR == 'admin' && (<Fab
                    color="primary"
                    aria-label="add"
                    onClick={handleCreateNew}
                    >
                    <AddIcon />
                </Fab>)}
                </div>
                <br/>
                <SearchBar
                  value={searched}
                  onChange={handleSearch}
                  onCancelSearch={cancelSearch}
                  placeholder="Search rooms"
                />
                <br/>
                <div style={{display:'flex', gap:'1em'}}>
                <ManualAutoComplete
                  width = "15%"
                  fieldname="Filter Building"
                  placeholder='Filter Building'
                  value={filterB}
                  options={buildings.map((e, idx) => convertBMFOption(idx, e))}
                  handleChange={handleFBChange}
                />
                  
                  <ManualAutoComplete
                  width = "15%"
                    fieldname="Filter Floor"
                    placeholder='Filter floor'
                    value={filterF}
                    options={floors.map((e, idx) => convertFMFOption(idx, e))}
                    handleChange={handleFFChange}
                  />

                    <Button size="large" style={{ margin:'0.5em', backgroundColor:'blue' }} onClick={handleFilter} >
                        <span style={{color:'white'}}>Filter</span>
                    </Button>
                </div>
                
                
                <br/>
                
                <div style={{display : 'flex', flexWrap:"wrap"}}>
                {Array.isArray(rooms) ? (
                    rooms.map((room) => {
                        const isMaxBedsReached = room.beds.length >= room.maxBed;
                        return (
                        <Card style={{ minWidth: '18em', maxWidth: '18em', margin: '0.5em' }}>
                            <CardContent>
                                <Typography gutterBottom variant="h6" component="h6">
                                    {room.id}
                                </Typography>
                                <Typography style={{fontSize:14}}>
                                    {room.type}
                                </Typography>
                                {room.beds.map((bed, idx) => (
                                    <Button key={bed.id} size="medium" style={{ margin:'0.5em', backgroundColor: getStatusColor(bed.status) }} onClick={() => handleBedAction(bed, room)} >
                                        {idx + 1}
                                    </Button>
                                ))}
                            </CardContent>
                            <CardActions>
                            {!isMaxBedsReached && (userR == "admin") && (
                                <Button key={room.id} size="small" onClick={() => handleAddBed(room.id)}>
                                Add Bed
                                </Button>
                            )}

                                <Button size="small" onClick={() => handleOpenJobD(room.id)}>
                                Job Details
                                </Button>
                            </CardActions>
                        </Card>
                        );
                    })
                    ) : (
                    <Typography>No rooms available</Typography>
                    )}
                </div>
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

                <Dialog onClose={handleCloseAssign} aria-labelledby="customized-dialog-title" open={openAsg}>
                  <MuiDialogTitle id="customized-dialog-title">
                    Select Patient
                  </MuiDialogTitle>
                  <DialogContent dividers>
                  <FormItemCombo<Patient> value={selectedAssign} fieldname='Patient' placeholder='Patient' options={Array.isArray(patients) ? patients.map((e, idx) => convertPatientMFOption(idx, e)) : []} handleChange={handlePatientChange}/>

                    <Button  size="small" onClick={assignP}>
                        Assign Patient to Bed
                      </Button>
                    
                  </DialogContent>
                </Dialog>

                <Dialog onClose={handleCloseP} aria-labelledby="customized-dialog-title" open={openMoveP}>
                  <MuiDialogTitle id="customized-dialog-title">
                    Select Room & Bed
                  </MuiDialogTitle>
                  <DialogContent dividers>
                      
                  <FormItemCombo<Room> value={sRoom} fieldname='Room' placeholder='Room' options={Array.isArray(rooms) ? rooms.map((e, idx) => convertRoomMFOption(idx, e)) : []} handleChange={handleRoomChange}/>

                  {room && (
                    <FormItemCombo<String> value={sBed} fieldname='Bed' placeholder='Bed' options={Array.isArray(sBeds) ? sBeds.map((e, idx) => convertBedMFOption(idx, e)) : []} handleChange={handleBedChange}/>)}

                    <Button  size="small" onClick={moveP}>
                        Move Patient
                      </Button>
                    
                  </DialogContent>
                </Dialog> 

                <Dialog onClose={handleCloseMoveBed} aria-labelledby="customized-dialog-title" open={openMoveBed}>
                  <MuiDialogTitle id="customized-dialog-title">
                    Select Room & Bed
                  </MuiDialogTitle>
                  <DialogContent dividers>
                      
                  <FormItemCombo<Room> value={sRoom} fieldname='Room' placeholder='Room' options={Array.isArray(rooms) ? rooms.map((e, idx) => convertRoomMFOption(idx, e)) : []} handleChange={handleRoomChange}/>

                    <Button  size="small" onClick={moveBed}>
                        Move Bed
                      </Button>
                    
                  </DialogContent>
                </Dialog> 
                

              <Dialog onClose={handleCloseBed} aria-labelledby="customized-dialog-title" open={openBed}>
                  <MuiDialogTitle id="customized-dialog-title">
                    {selectedF  && ("Patient Details") }
                    {selectedA  && ("Bed Actions") }
                    {selectedU  && ("Bed unusable") } 
                  </MuiDialogTitle>
                  <DialogContent dividers>
                  {selectedA  && (
                    <div>
                      {(userR == "nurse" || userR== "admin") && (<Button  size="small" onClick={() => {setOpenAsg(true)}}>
                        Assign Patient to Bed
                      </Button>)}
                        {(userR== "admin") &&(<Button  size="small" onClick={handleMoveBed}>
                        Move Bed
                      </Button>)}
                      {(userR== "admin") &&(<Button  size="small" onClick={removeBed}>
                        Remove Bed
                      </Button>)}
                    </div>
                  ) }
                  {selectedF  && (
                    <div>
                    <DataGrid initialState={{
                      columns: {
                        columnVisibilityModel: {
                          id: false,
                        },
                        },
                      }}
                      rows={[patientD]} columns={columnsP}
                      disableRowSelectionOnClick
                      sx={{ mt:2,
                          height:'auto',
                          width: '100%',
                      }}/>
                    {(userR == "admin") &&(<Button  size="small" onClick={endBed}>
                      End Use Bed
                    </Button>)}
                    {(userR == "nurse" || userR == "admin") && (<Button  size="small" onClick={handleMoveP}>
                      Move Patient
                    </Button>)}
                  </div>
                  ) }
                    
                  </DialogContent>
                </Dialog> 

            <Dialog onClose={handleCloseJobD} aria-labelledby="customized-dialog-title" open={openJobD}>
                  <MuiDialogTitle id="customized-dialog-title">
                    Job Details
                  </MuiDialogTitle>
                  <DialogContent dividers>
                  <DataGrid 
                  initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                    },
                    },
                  }}
                  rows={jobs} columns={columns}
                  disableRowSelectionOnClick
                  sx={{ mt:2,
                      height:'auto',
                      width: '100%',
                      }}/>
                  </DialogContent>
                  <DialogActions>
                    <Button autoFocus onClick={handleCloseJobD} color="primary">
                      Close
                    </Button>
                  </DialogActions>
            </Dialog>

            <FormDialog
                title={"Add Room"} 
                success_msg={"Successfully added room"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                            id: "1",
                            component: <FormItemSelect<string> value={newB} fieldname='Room Building' placeholder='Room Building' options={buildings} handleChange={handleBChange}/>
                        },
                        {
                            id: "2",
                            component: <FormItemNumber value={newF} fieldname='Room Floor' min={1} max={9} handleChange={handleFChange} unit={""}/>
                        },
                        {
                            id: "3",
                            component: <FormItemNumber value={newR} fieldname='Room Number' min={1} max={999} handleChange={handleRChange} unit={""}/>
                        },
                        {
                            id: "4",
                            component: <FormItemSelect<string> value={newRT} fieldname='Room Type' placeholder='Room Type' options={types} handleChange={handleRTChange}/>
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
