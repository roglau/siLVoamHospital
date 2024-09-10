import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
import { UserUtils } from './user_manager';
import { NotifUtils } from './notif_manager';
import { JobUtils } from './job_manager';
// import { hashPassword } from './passwordencryptor';

const db_ambulances = collection(database, 'ambulances');

export class AmbulancesUtils {

    static async getAllAmbulances(){
        const promise = await getDocs(db_ambulances);
        const users = promise.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        return users;
    }

    static async getAmbulanceByRoomBed(room : any, bed: any){
        const q = query(
            db_ambulances,
            where("room", "==", room),
            where("bed", "==", bed),
            where("status", "==", "Used")
          );
        const querySnapshot = await getDocs(q);
        let ambulances = null

        querySnapshot.docs.map((doc) => {
            const n = {
                id : doc.id,
                ...doc.data()
            }
            ambulances = n
        })
        console.log(ambulances)
        return ambulances
    }

    static async insertAmbulance(ambulance : any){
        // console.log(ambulance)
        const ambulanceRef = doc(db_ambulances);
        await setDoc(ambulanceRef, ambulance);
    }

    static async getAmbulance(id : any){
        const aDocRef = doc(db_ambulances, id);
        const aDocSnapshot = await getDoc(aDocRef);

        return aDocSnapshot.data();
        
    }

    static async updateAmbulance(ambulance : any, status : string){
        const pDocRef = doc(db_ambulances, ambulance.id);
        
        const a = await this.getAmbulance(ambulance.id)
        a.patient = ambulance.patient
        a.status = status
        a.driver = ambulance.driver
        a.destination = ambulance.destination
        a.room = ambulance.room
        a.bed = ambulance.bed

        // console.log(a)
        
        await updateDoc(pDocRef, a);

        const staffs = []
        staffs.push(a.driver)

        const time = []
        time.push(Timestamp.fromDate(new Date()))

        JobUtils.insertAmbulanceJob("Picking up patient", Timestamp.fromDate(new Date()), Timestamp.fromDate(new Date(new Date().getTime() + 2 * 60 * 60 * 1000)), "ambulancedriver", a.patient, a.room, a.bed, staffs, time)
    }

    static async updateStatus(ambulance : any, status : string){
        const pDocRef = doc(db_ambulances, ambulance.id);
        
        const a = await this.getAmbulance(ambulance.id)
        a.status = status
        await updateDoc(pDocRef, a);
    }

    static async banAmbulance(ambulance : any){
        const pDocRef = doc(db_ambulances, ambulance.id);
        
        const a = await this.getAmbulance(ambulance.id)

        a.status = "Unusable"
        await updateDoc(pDocRef, a);
    }

}

