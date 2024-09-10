import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
import { UserUtils } from './user_manager';
import { NotifUtils } from './notif_manager';
import { JobUtils } from './job_manager';
import { PatientUtils } from './patient_manager';
// import { hashPassword } from './passwordencryptor';

const db_prescriptions = collection(database, 'prescriptionss');

export class PrescriptionsUtils {

    static async getAllPrescriptions(){
        const promise = await getDocs(db_prescriptions);
        const users = promise.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));
        return users;
    }


    static async insertPrescriptions(Prescriptions : any){
        const PrescriptionsRef = doc(db_prescriptions);
        await setDoc(PrescriptionsRef, Prescriptions);
    }

    static async getPrescriptions(id : any){
        const aDocRef = doc(db_prescriptions, id);
        const aDocSnapshot = await getDoc(aDocRef);

        return aDocSnapshot.data();
    }

    static async updatePrescriptions(Prescriptions : any){
        const pDocRef = doc(db_prescriptions, Prescriptions.id);

        await updateDoc(pDocRef, Prescriptions);
    }

    static async updateStatus(Prescriptions : any, status : string){
        // const pDocRef = doc(db_prescriptions, Prescriptions.id);
        
        // const a = await this.getPrescriptions(Prescriptions.id)
        // a.status = status
        // await updateDoc(pDocRef, a);
    }

    static async deletePrescriptions(Prescriptions : any){
        const PrescriptionsRef = doc(db_prescriptions, Prescriptions.id);
        await deleteDoc(PrescriptionsRef);
    }

}

