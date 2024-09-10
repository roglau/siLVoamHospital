import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
// import { hashPassword } from './passwordencryptor';

const db_patients = collection(database, 'patients');

export interface Patient{
    id : string,
    name : string,
    phone : string,
    address : string,
    dob : Date,
    gender : string,
    email : string
}

export class PatientUtils {

    static async getAllPatient(){
        const promise = await getDocs(db_patients);
        const patients = promise.docs.map((doc) => {
            const data = doc.data();
            const formattedDOB = data.dob.toDate().toLocaleString();
            return {
                id: doc.id,
                ...data,
                formattedDOB, 
            };
          });
        return patients;
    }

    static async getPatient(id:string){
        const jobDocRef = doc(db_patients, id);
        const jobDocSnapshot = await getDoc(jobDocRef);

        return jobDocSnapshot.data();
    }

    static async getPatientNID(id:string){
        const jobDocRef = doc(db_patients, id);
        const jobDocSnapshot = await getDoc(jobDocRef);

        return {id : jobDocSnapshot.id, ...jobDocSnapshot.data()}
    }

    

    static async insertPatient(patient: any){
        const userRef = doc(db_patients);
        await setDoc(userRef, patient);
    }

    static async updatePatient(patient: any){
        const pDocRef = doc(db_patients, patient.id);
        
        const pUpdate = {
            name : patient.name,
            email : patient.email,
            gender : patient.gender,
            dob : patient.dob,
            phone : patient.phone,
            address : patient.address
        }
        
        await updateDoc (pDocRef, pUpdate);
    }

    static async deletePatient(id : string){
        const userRef = doc(db_patients, id);
        await deleteDoc(userRef);
    }

}

