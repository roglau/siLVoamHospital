import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where, } from 'firebase/firestore';

import { database } from '../firebase/firebase';
import { JobUtils } from './job_manager';
import { PatientUtils } from './patient_manager';
// import { hashPassword } from './passwordencryptor';

const db_rooms = collection(database, 'rooms');
const db_beds = collection(database, 'beds');

export interface Room{
    id : string,
    type : string,
    beds : []
}

export interface Bed{
    id : string,
    patient : string | null,
    status : string,
    patientD : any
}

export class RoomUtils {

    static async getAllRoom(){
        const promise = await getDocs(db_rooms);
        
        const rooms = await Promise.all(
          promise.docs.map(async (doc) => {
            const data = doc.data();
            
            const beds = await Promise.all(data.beds.map(async (bed) => {
                const bedD = await this.getBed(bed) as Bed;
                let p = null
                if (bedD.patient !== null){
                    p = await PatientUtils.getPatientNID(bedD.patient)
                    p.dob = new Date(p.dob.seconds * 1000).toLocaleString()
                    bedD.patientD = p                    
                }
                
                return bedD
            }));

            // console.log(beds, doc.id)

            const jobs = await JobUtils.getJobByRoom(doc.id)
            // console.log(jobs)
            
            return {
              id: doc.id,
              ...data,
              type : data.type,
              beds : beds,
              jobs : jobs
            };
          })
        );
      
        return rooms;
    }

    static async getAllBed(){
        const promise = await getDocs(db_beds);
        const beds = promise.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        return beds;
    }

    static async getBedCount() {
        const querySnapshot = await getDocs(db_beds);
        return await querySnapshot.size;       
      }

    static async getRoom(id){
        const roomDocRef = doc(db_rooms, id);
        const roomDocSnapshot = await getDoc(roomDocRef);

        return roomDocSnapshot.data()
    }

    static async getRoomNId(id){
        const roomDocRef = doc(db_rooms, id);
        const roomDocSnapshot = await getDoc(roomDocRef);

        return {id: roomDocSnapshot.id ,...roomDocSnapshot.data()}
    }

    static async getBed(id : string){
        const bedDocRef = doc(db_beds, id);
        const bedDocSnapshot = await getDoc(bedDocRef);

        return {id: bedDocSnapshot.id, ...bedDocSnapshot.data()}
    }

    static async insertRoom(id:string,type :string, maxBed : number){
        const roomRef = doc(db_rooms, id);
        const roomData = {
            beds : [],
            maxBed : maxBed,
            type : type,
        };
        await setDoc(roomRef, roomData);
    }

    static async updateBed(bed : any,room : any, status : string, patient : any, jobname:string, category:string){
        const pDocRef = doc(db_beds, bed.id);
        
        const pUpdate = {
            patient : patient,
            status : status,
        }
        
        await updateDoc(pDocRef, pUpdate);
        // console.log(room, bed.id)

        if(status === "Unusable"){
            let job = room.jobs.filter(job => job.status !== "completed" && job.bed === bed.id)
            // console.log(job[0].id)
            await JobUtils.completeJob(job[0].id)
        }
        await JobUtils.insertJob(jobname, Timestamp.fromDate(new Date()), Timestamp.fromDate(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)), category, patient, room.id, bed.id)
        
    }

    static async updateBedNoJob(bedid : any, status : string, patient : any){
        const pDocRef = doc(db_beds, bedid);
        
        const pUpdate = {
            patient : patient,
            status : status,
        }
        // console.log(pUpdate)
        await updateDoc(pDocRef, pUpdate);
    }

    static async updateAddBedRoom(room: any, bedId:any){
        const rDocRef = doc(db_rooms, room.id);
        room.beds.push(bedId)
        if(room.beds.length > room.maxBeds){
            return
        }else{
            await this.insertBed(bedId)
        
            const rUpdate = {
                beds : room.beds,
                maxBed : room.maxBed,
                type : room.type
            }

            await JobUtils.insertJob("Add Bed to Room", Timestamp.fromDate(new Date()), Timestamp.fromDate(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)), "cleaningservice", null, room.id, bedId)
            
            await updateDoc (rDocRef, rUpdate);
        }
        
    }

    static async movePatient(sourceRoom : any, sourceBed : any, destRoom : any, destBed : any) {
        const bDocRef = doc(db_beds, sourceBed.id);
        
        const bUpdate = {
            patient : null,
            status : "Unusable",
        }
        
        await updateDoc(bDocRef, bUpdate);
        await JobUtils.insertJob("Making the bed", Timestamp.fromDate(new Date()), Timestamp.fromDate(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)), "cleaningservice", null, sourceRoom.id, sourceBed.id)

        const bDocRef2 = doc(db_beds, destBed);
        
        const bUpdate2 = {
            patient : sourceBed.patient,
            status : "Filled",
        }

        await updateDoc(bDocRef2, bUpdate2);
        await JobUtils.insertJob("Move patient", Timestamp.fromDate(new Date()), Timestamp.fromDate(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)), "nurse", sourceBed.patient, destRoom, destBed)
    }

    static async moveBed(sourceRoom : any, sourceBed : any, destRoom : any){
        const rDocRef = doc(db_rooms, sourceRoom.id);
        const r = await getDoc(rDocRef)
        const rData = r.data()        
        let bed = await rData.beds.filter((bed) => bed !== sourceBed.id)
        
        const rUpdate = {
            ...rData,
            beds : bed
        }
        await updateDoc(rDocRef, rUpdate)
        

        const rDocRef2 = doc(db_rooms, destRoom);
        const r2 = await getDoc(rDocRef2)
        const r2Data = r2.data()
        r2Data.beds.push(sourceBed.id)
        
        const rUpdate2 = {
            ...r2Data,
            beds : r2Data.beds
        }


        await updateDoc(rDocRef2, rUpdate2)

        await this.updateBedNoJob(sourceBed.id, "Unusable", null)

        await JobUtils.insertJob("Move bed", Timestamp.fromDate(new Date()), Timestamp.fromDate(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)), "cleaningservice", null, destRoom, sourceBed.id)
    }

    static async insertBed(id:any){
        const bedRef = doc(db_beds, id);
        const bedData = {
            patient : null,
            status : "Unusable"
        };
        await setDoc(bedRef, bedData);
    }

    static async deleteRoom(id : string){
        const userRef = doc(db_rooms, id);
        await deleteDoc(userRef);
    }

    static async removeBed(sourceRoom : any, sourceBed : any){
        const rDocRef = doc(db_rooms, sourceRoom.id);
        const r = await getDoc(rDocRef)
        const rData = r.data()        
        let bed = await rData.beds.filter((bed) => bed !== sourceBed.id)
        
        const rUpdate = {
            ...rData,
            beds : bed
        }
        // console.log(rUpdate)

        await JobUtils.insertJob("Remove bed", Timestamp.fromDate(new Date()), Timestamp.fromDate(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)), "cleaningservice", null, sourceRoom.id, sourceBed.id)

        await this.updateBedNoJob(sourceBed.id, "Removed", null)

        await updateDoc(rDocRef, rUpdate)
    }

    

}

