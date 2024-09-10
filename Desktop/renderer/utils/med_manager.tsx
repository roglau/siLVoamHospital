import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
import { UserUtils } from './user_manager';
import { NotifUtils } from './notif_manager';
import { JobUtils } from './job_manager';
import { PatientUtils } from './patient_manager';
// import { hashPassword } from './passwordencryptor';

const db_medicine = collection(database, 'medicines');

export class MedicineUtils {

    static async getAllMedicine(){
        const promise = await getDocs(db_medicine);
        const users = promise.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));
        return users;
    }


    static async insertMedicine(medicine : any){
        const medicineRef = doc(db_medicine);
        await setDoc(medicineRef, medicine);
    }

    static async getMedicine(id : any){
        const aDocRef = doc(db_medicine, id);
        const aDocSnapshot = await getDoc(aDocRef);

        return aDocSnapshot.data();
    }

    static async updateMedicine(medicine : any){
        const pDocRef = doc(db_medicine, medicine.id);

        await updateDoc(pDocRef, medicine);
    }

    static async updateStatus(Medicine : any, status : string){
        // const pDocRef = doc(db_Medicine, Medicine.id);
        
        // const a = await this.getMedicine(Medicine.id)
        // a.status = status
        // await updateDoc(pDocRef, a);
    }

    static async deleteMedicine(medicine : any){
        const medicineRef = doc(db_medicine, medicine.id);
        await deleteDoc(medicineRef);
    }

}

