import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
import { PatientUtils } from './patient_manager';
import { RoomUtils } from './room_manager';
import { NotifUtils } from './notif_manager';
import { UserUtils } from './user_manager';
import { AmbulancesUtils } from './ambulance_manager';
import { AppointmentUtils } from './appointment_manager';
// import { hashPassword } from './passwordencryptor';

const db_jobs = collection(database, 'jobs');

// interface Job {
//     name : string,
//     startDate : Timestamp,
//     endDate : Timestamp,
//     assignedEmployees : []

// }

// interface Employee{
//     id : string,
//     name : string,
//     email : string,

// }

export class JobUtils {

    static async getAllJob() {
        const promise = await getDocs(db_jobs);
        const jobs = await Promise.all(
          promise.docs.map(async (doc) => {
            const data = doc.data();
            const start = data.startDate;
            const end = data.endDate;
            const formattedStartDate = new Date(start.seconds * 1000).toLocaleString();
            const formattedEndDate = new Date(end.seconds * 1000).toLocaleString();
            let patient = null
            if(data.patient)
                patient = await PatientUtils.getPatient(data.patient); // Await the patient data retrieval
      
      
            return {
              id: doc.id,
              ...data,
              status: data.status,
              formattedStartDate,
              formattedEndDate,
              patientN : patient ? patient.name : null,
              room : data.room
            };
          })
        );
      
        return jobs;
      }

    static async getJobByRoom(room:string){
        const jobs = await this.getAllJob()
        const j = jobs.filter((job) => job.room == room)
        return j
    }
      
    static async getLastDoctor(patient : string){
        const q = query(db_jobs, where('patient','==',patient));
        const querySnapshot = await getDocs(q);
        let jobs = []

        querySnapshot.docs.map((doc) => {
            const n = {
                id : doc.id,
                ...doc.data()
            }
            jobs.push(n)
        })
        await jobs.sort((a, b) => b.startDate - a.startDate);

        const staffs = []
        let i = 0
        for(i = 0 ; i < jobs.length; i++) {
            if(staffs.length <= 0){
                const promises = jobs[i].assignedEmployees.map(async (employee) => {
                    const s = await UserUtils.getUser(employee);
                    if (s.role === 'doctor' && !staffs.includes(employee)) {
                      staffs.push(employee);
                    }
                  });
                  
                await Promise.all(promises);
                  
            }else break;
        }
        
        // console.log(staffs)
        return staffs
    }

    static async insertJob(name:string, startDate:Timestamp, endDate:Timestamp, category : string, patient : string, room : string, bed : string){
        const userRef = doc(db_jobs);
        const userData = {
            name: name,
            startDate: startDate,
            endDate: endDate,
            assignedEmployees: [],
            assignedDate: [],
            status : "unfinished",
            patient : patient,
            category : category,
            room : room,
            bed : bed
        };
        await setDoc(userRef, userData);
    }

    static async insertJobWBedUpdate(name:string, startDate:Timestamp, endDate:Timestamp, category : string, patient : string, room : string, bed : string){
        const userRef = doc(db_jobs);
        const userData = {
            name: name,
            startDate: startDate,
            endDate: endDate,
            assignedEmployees: [],
            assignedDate: [],
            status : "unfinished",
            patient : patient,
            category : category,
            room : room,
            bed : bed
        };
        await RoomUtils.updateBedNoJob(bed, "Filled", patient)
        await setDoc(userRef, userData);
    }

    static async insertAppointmentJob(name:string, startDate:Timestamp, endDate:Timestamp, category : string, patient : string, room : string, bed : string, staffs : any, times : any){
        const userRef = doc(db_jobs);
        const userData = {
            name: name,
            startDate: startDate,
            endDate: endDate,
            assignedEmployees: staffs,
            assignedDate: times,
            status : "unfinished",
            patient : patient,
            category : category,
            room : room,
            bed : bed
        };
        await RoomUtils.updateBedNoJob(bed, "Filled", patient)
        await setDoc(userRef, userData);
 
        return userRef.id
    }

    static async insertAmbulanceJob(name:string, startDate:Timestamp, endDate:Timestamp, category : string, patient : string, room : string, bed : string, staffs : any, times : any){
        const userRef = doc(db_jobs);
        const userData = {
            name: name,
            startDate: startDate,
            endDate: endDate,
            assignedEmployees: staffs,
            assignedDate: times,
            status : "unfinished",
            patient : patient,
            category : category,
            room : room,
            bed : bed
        };
        await RoomUtils.updateBedNoJob(bed, "Filled", patient)
        await NotifUtils.insertNotif("Newly Assigned Job", name, staffs[0])
        await setDoc(userRef, userData);
    }

    static async getJob(jid:string){
        const jobDocRef = doc(db_jobs, jid);
        const jobDocSnapshot = await getDoc(jobDocRef);

        return jobDocSnapshot.data();
    }


    static async updateJob(jid: string, job: any){
        const jobDocRef = doc(db_jobs, jid);
        const jobUpdate = {
            name : job.name,
            startDate : job.startDate,
            endDate : job.endDate,
            assignedEmployees : job.assignedEmployees,
            assignedDate : job.assignedDate
        }
        if(job.assignedEmployees.length > 0)
        await NotifUtils.insertNotif("Newly Assigned Job", job.name, job.assignedEmployees[0])

        await updateDoc(jobDocRef, jobUpdate);
    }

    static async completeJob(jid: string){
        console.log(jid)
        const jobData = await this.getJob(jid);
        console.log(jobData)
        if (jobData) {
            // Update the job status attribute
            const jobUpdate = {
            ...jobData, // Copy all existing properties of the job data
            status: 'completed', // Update the status attribute
            };

            const jobDocRef = doc(db_jobs, jid);
            // console.log(jobUpdate, jid)
            await updateDoc(jobDocRef, jobUpdate);
        }

        if(jobData.category === 'cleaningservice' && jobData.name !== 'Remove bed'){            
            await RoomUtils.updateBedNoJob(jobData.bed, "Available",null)
        }else if(jobData.category === 'doctor'){
            console.log(jobData)
            let a = null
            try{
                 a = await AppointmentUtils.getAppointmentByJob(jid)
                 console.log(a)
            }catch(e){
                console.log(e)
            }
            
            if(a){
                console.log(a)
                await AppointmentUtils.updateStatus(a, "Completed")
            }
            await RoomUtils.updateBedNoJob(jobData.bed, "Unusable",null)
            await this.insertJob("Making the bed", Timestamp.fromDate(new Date()), Timestamp.fromDate(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)), "cleaningservice", null, jobData.room, jobData.bed)
        }else if(jobData.category === 'ambulancedriver'){
            const a = await AmbulancesUtils.getAmbulanceByRoomBed(jobData.room, jobData.bed)
            await AmbulancesUtils.updateStatus(a, "Available")
        }
    }

}

