import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, where } from 'firebase/firestore';
import { database } from '../firebase/firebase';
// import { hashPassword } from './passwordencryptor';

const db_shifts = collection(database, 'shifts');

export class ShiftUtils {

    static async getAllShift(){
        const promise = await getDocs(db_shifts);
        const shifts = promise.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        return shifts;
    }
}

