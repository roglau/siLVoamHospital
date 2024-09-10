import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { resetServerContext } from "react-beautiful-dnd"
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CssBaseline,
  Fab,
} from '@mui/material';
import Head from 'next/head';
import { Box, minHeight } from '@mui/system';
import Sidebar from '../components/Sidebar';
import { styled } from '@mui/material/styles';
import { UserUtils } from '../utils/user_manager';
import { JobUtils } from '../utils/job_manager';
import AddIcon from '@mui/icons-material/Add'
import FormDialog, { FormItemCombo, FormItemDate, FormItemDateTime, FormItemLongText, FormItemSelect, FormItemShortText, MFOption, MFOptionCombo } from '../components/InsertFormDialog';
import { Timestamp } from 'firebase/firestore';
import { Patient, PatientUtils } from '../utils/patient_manager';
import { Bed, Room, RoomUtils } from '../utils/room_manager';

// Dummy data
const employees = [
  { id: '1', name: 'John Doe', role: 'Manager' },
  { id: '2', name: 'Jane Smith', role: 'Developer' },
  { id: '3', name: 'Mike Johnson', role: 'Designer' },
  // Add more employees as needed
];

const dummyJobs = [
  {
    id: 'job1',
    name: 'Job 1',
    startDate: '2023-06-18',
    endDate: '2023-06-20',
    assignedEmployees: ['1', '3'],
  },
  {
    id: 'job2',
    name: 'Job 2',
    startDate: '2023-06-21',
    endDate: '2023-06-23',
    assignedEmployees: ['2','1'],
  },
  // Add more jobs as needed
];

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

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  }));


const JobAssignment = () => {
  resetServerContext()
//   const [jobs, setJobs] = useState(dummyJobs);
  const [jobs, setJobs] = useState([]);

  const [staffs, setStaffs] = useState([]);
  const [ refreshList, setRefreshList ] = React.useState(false);
  const [patients, setPatients] = useState<any>(0);
  const [rooms, setRooms] = useState<any>(0);
  const [beds, setBeds] = useState<any>([]);
  
  const [ patient, setPatient ] = React.useState<any>(0);
  const [ room, setRoom ] = React.useState<any>(0);
  const [ bed, setBed ] = React.useState<any>(0);

  const [ newRole, setNewRole ] = React.useState<string>("");

  useEffect(() => {
  const fetchStaffs = async () => {
    const fetchedStaffs = await UserUtils.getAllUser();
    setStaffs(fetchedStaffs);
  };

  fetchStaffs();
  } ,[]);

  useEffect(() => {
  const fetchJobs = async () => {
      let fetchedJobs = await JobUtils.getAllJob();
      fetchedJobs = await fetchedJobs.filter((job) => job.status !== "completed")
      setJobs(fetchedJobs);
  };

  fetchJobs();
  } ,[refreshList]);

  useEffect(() => {
    const fetchPatients = async () => {
        const fetchedPatients = await PatientUtils.getAllPatient();
        setPatients(fetchedPatients);
    };

    fetchPatients();
}, []);

useEffect(() => {
  const fetchRooms = async () => {
      const fetchedRooms = await RoomUtils.getAllRoom();
      setRooms(fetchedRooms);
  };

  fetchRooms();
  } ,[]);
  // console.log(rooms);

    

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return; // Item was dropped outside the droppable area

    // Reorder the employee cards within the same job
    if (source.droppableId === destination.droppableId) {
      const jobIndex = jobs.findIndex(
        (job) => job.id === source.droppableId
      );
      const updatedEmployees = [...jobs[jobIndex].assignedEmployees];
      const [removed] = updatedEmployees.splice(source.index, 1);
      updatedEmployees.splice(destination.index, 0, removed);

      const updatedJobs = [...jobs];
      updatedJobs[jobIndex].assignedEmployees = updatedEmployees;
      setJobs(updatedJobs);
    } else {
      // Move the employee card to a different job
    //   console.log("DEBUG: Raw Source " + source.droppableId + " Destination " + destination.droppableId)

      const sourceJobIndex = jobs.findIndex(
        (job) => job.id === source.droppableId
      );
      const destinationJobIndex = jobs.findIndex(
        (job) => job.id === destination.droppableId
      );

    //   console.log("Source job index: " + sourceJobIndex + " Destination job index: " + destinationJobIndex)

    //   console.log("DEBUG: Source " + sourceJobIndex + " Destination " + destinationJobIndex)

      const sourceEmployees = sourceJobIndex != -1 ? [...jobs[sourceJobIndex].assignedEmployees] : staffs;
      const destinationEmployees = destinationJobIndex != -1 ? [...jobs[destinationJobIndex].assignedEmployees] : [];

    //   console.log(sourceEmployees)
    //   console.log("Source Index " + source.index)
    //   console.log("Destination Index " + destination.index)

      const removed = sourceJobIndex != -1 ? sourceEmployees.splice(source.index, 1) : sourceEmployees[source.index];
      if(destinationEmployees.includes(removed.id)) return;
      
      destinationEmployees.splice(destination.index, 0, removed.id);
    //   console.log("after",destinationEmployees)
      const updatedJobs = [...jobs];
      if(sourceJobIndex != -1){
        updatedJobs[sourceJobIndex].assignedEmployees = sourceEmployees;
      }

      if(destinationJobIndex != -1){
        updatedJobs[destinationJobIndex].assignedEmployees = destinationEmployees;
      }
    //   console.log(jobs[destinationJobIndex].id, jobs[destinationJobIndex])
      updatedJobs[destinationJobIndex].assignedDate.unshift(Timestamp.fromDate(new Date()))
      // console.log(updatedJobs[destinationJobIndex].assignedDate);
      JobUtils.updateJob(jobs[destinationJobIndex].id, updatedJobs[destinationJobIndex]);
      setJobs(updatedJobs);
    }
  };

  React.useEffect(() => {
    // console.log(jobs)
    // const e = staffs.find((staff) => staff.id === jobs[0].assignedEmployees[0])
    // console.log(jobs[0].assignedEmployees);
    // console.log(e);
  }, [jobs])

  const handleUnassignEmployee = (jobId, employeeId) => {
    const jobIndex = jobs.findIndex((job) => job.id === jobId);
    // console.log(jobs[jobIndex]);

    const eIdx = jobs[jobIndex].assignedEmployees.indexOf(employeeId)

    const updatedEmployees = jobs[jobIndex].assignedEmployees.filter(
      id => id !== employeeId
    );
    

    const updatedDates = jobs[jobIndex].assignedDate.filter(
      (_, index) => index !== eIdx
    );

    // console.log(jobId, employeeId);
    // console.log(updatedEmployees);
    // console.log(updatedDates);

    const updatedJobs = [...jobs];
    updatedJobs[jobIndex].assignedEmployees = updatedEmployees;
    updatedJobs[jobIndex].assignedDate = updatedDates;
    // console.log(updatedJobs[jobIndex]);
    JobUtils.updateJob(jobId, updatedJobs[jobIndex]);
    setJobs(updatedJobs);
  };  

  const [ openCreateForm, setOpenCreateForm ] = React.useState(false);
  
  const [ newLRError, setNewLRError ] = React.useState<boolean>(false);

  const [ newLRErrMsg, setNewLRErrMsg ] = React.useState<string>('Error');

  const [ newProdName, setNewProdName ] = React.useState<string>("");
  const [ newStartDate, setNewStartDate ] = React.useState<Date>(new Date(Date.now()));
  const [ newEndDate, setNewEndDate ] = React.useState<Date>(new Date(Date.now()));

  const handleNameChange = (event: React.ChangeEvent<{ value: string }>) => {
    setNewProdName(event.target.value);
  }

  const resetForm = () => {
    setNewProdName("");
    setNewStartDate(new Date())
    setNewEndDate(new Date())
    setPatient(0)
    setNewRole("")
    setRoom("")
    setBed("")
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
    if(newProdName.length < 1){
        setNewLRErrMsg("Producer name must be filled");
        setNewLRError(true);
    }else{
        await JobUtils.insertJobWBedUpdate(newProdName, Timestamp.fromDate(newStartDate), Timestamp.fromDate(newEndDate), newRole, patient, room, bed);
        setRefreshList(!refreshList);
        setOpenCreateForm(false);
    }
  }

  function convertPatientMFOption(index: number, patient: Patient) : MFOptionCombo{
    return {id : index, label: patient.name, content: patient} as MFOptionCombo;
  }

  function convertRoomMFOption(index: number, room: Room) : MFOptionCombo{
    return {id : index, label: room.id, content: room} as MFOptionCombo;
  }

  function convertBedMFOption(index: number, bed: Bed) : MFOptionCombo{
    console.log(bed)
    return {id : index, label: bed.id, content: bed.id} as MFOptionCombo;
  }

  const handlePatientChange = (event: any, newValue: MFOptionCombo) => {
    // console.log(newValue.content.name)
    setPatient(newValue.content.id);
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

  const handleRoleChange = (e: React.ChangeEvent<{ value: string }>) => {
    if(e.target.value)
      setNewRole(e.target.value);
  };

  function getStatusColor(status) {
    switch (status) {
      case 'late':
        return 'red';
      case 'unfinish':
        return 'grey';
      case 'completed':
        return 'green';
      default:
        return 'textSecondary';
    }
  }

  const currentDate = new Date();
  const maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

  // Set the max attribute as a formatted string in the desired format
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
    <React.Fragment>
      <Head>
        <title>Add Job Page</title>
      </Head>
      <Box sx={{ display: 'flex', minHeight : '30em' }}>
        <CssBaseline />
        <Sidebar/>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
    
            <Container>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Grid container spacing={2}>
                {/* Left side: Employee List */}
                <Grid item xs={3}>
                <div style={{ height: '100vh', overflow: 'auto' }}>
                    <Droppable droppableId="employeeList">
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                        <Card>
                            <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Staff List
                            </Typography>
                            {staffs.map((staff, index) => (
                                <Draggable key={staff.id} draggableId={staff.id} index={index}>
                                {(provided) => (
                                    <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    >
                                    <Card variant="outlined" style={{ marginBottom: '8px' }}>
                                        <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {staff.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {staff.role}
                                        </Typography>
                                        </CardContent>
                                    </Card>
                                    </div>
                                )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            </CardContent>
                        </Card>
                        </div>
                    )}
                    </Droppable>
                    </div>
                </Grid>

                {/* Right side: Job Grid */}
                <Grid item xs={9}>
                    <Grid container spacing={2}>
                    {jobs.map((job) => (
                        <Grid item key={job.id} xs={4}>
                          <Card>
                          <CardContent>
                              <Typography variant="h6" gutterBottom>
                              {job.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                              Start Date: {job.formattedStartDate}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                              End Date: {job.formattedEndDate}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                              Category: {job.category}
                              </Typography>
                              <Typography variant="body2" color={getStatusColor(job.status)}>
                              Status: {job.status}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                              Room : {job.room} | Bed : {job.bed}
                              </Typography>
                              <Droppable droppableId={job.id}>
                                {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                              <List dense>
                              {job.assignedEmployees.map((employee, index) => (
                                  <ListItem key={employee.id}>
                                  <ListItemAvatar>
                                      <Avatar>{staffs.find((staff) => staff.id === job.assignedEmployees[index]).name[0]}</Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                      primary={staffs.find((staff) => staff.id === job.assignedEmployees[index]).name}
                                      secondary={staffs.find((staff) => staff.id === job.assignedEmployees[index]).role}
                                  />
                                  
                                  <Button
                                      size="small"
                                      onClick={() => handleUnassignEmployee(job.id, job.assignedEmployees[index])}
                                  >
                                      Unassign
                                  </Button>
                                  </ListItem>
                              ))}
                              </List>
                              {provided.placeholder}
                              </div>
                            )}
                            </Droppable>
                          </CardContent>
                          </Card>
                            
                        </Grid>
                    ))}
                    </Grid>
                    
                </Grid>
                </Grid>
            </DragDropContext>
            
            </Container>
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

        </Box>
        
        </Box>
        <FormDialog
                title={"Add Non Routine Job"} 
                success_msg={"Successfully added non-routine jobs"} 
                positive_btn_label={"Add"}
                negative_btn_label={"Cancel"}
                generic_err={newLRErrMsg}
                fields={
                    [
                        {
                          id: "1",
                          component: <FormItemShortText value={newProdName} fieldname='Job Name' placeholder='Job Name' minLength={0} maxLength={500} handleChange={handleNameChange}/>
                        },
                        {
                          id: "2",
                          component: <FormItemDateTime value={newStartDate} fieldname='Start Date' min={new Date("1950-01-01")} max={new Date(Date.now())} handleChange={setNewStartDate}/>
                        },
                        {
                          id: "3",
                          component: <FormItemDateTime value={newEndDate} fieldname='End Date' min={new Date(Date.now())} max={new Date(maxDateString)} handleChange={setNewEndDate}/>
                        },
                        {
                          id: "4",
                          component: <FormItemCombo<Patient> value={patient} fieldname='Patient' placeholder='Patient' options={Array.isArray(patients) ? patients.map((e, idx) => convertPatientMFOption(idx, e)) : []} handleChange={handlePatientChange}/>
                        },
                        {
                          id: "5",
                          component: <FormItemSelect<string> value={newRole} fieldname='Job Category' placeholder='Category' options={rolesFormatted} handleChange={handleRoleChange}/>
                        },
                        {
                          id: "6",
                          component: <FormItemCombo<Room> value={room} fieldname='Room' placeholder='Room' options={Array.isArray(rooms) ? rooms.map((e, idx) => convertRoomMFOption(idx, e)) : []} handleChange={handleRoomChange}/>
                        },
                        {
                          id: "7",
                          component: room && (
                            <FormItemCombo<String> value={bed} fieldname='Bed' placeholder='Bed' options={Array.isArray(beds) ? beds.map((e, idx) => convertBedMFOption(idx, e)) : []} handleChange={handleBedChange}/>
                          ),
                        }
                        
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
};

export default JobAssignment;
